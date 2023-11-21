/**
 * Functions for image processing.
 * Used in the test run form.
 */

import * as tf from "@tensorflow/tfjs-core";

export function inferImgAxes(shape, order = "bcz") {
  /**
   * Infer the axes of an image.
   *
   * @param {Array} shape Shape of the image.
   * @returns {string} Axes string.
   */
  if (shape.length === 2) {
    return "yx";
  } else if (shape.length <= 5) {
    let minDimIdx = shape.indexOf(Math.min(...shape));
    let lowDimShape = shape.slice(); // Clone the shape array
    lowDimShape.splice(minDimIdx, 1); // Remove the smallest dimension
    let lowDimAxes = inferImgAxes(lowDimShape, order.slice(1));
    const insert = order[0];
    return insertCharAtPosition(lowDimAxes, insert, minDimIdx);
  } else {
    throw new Error(`Image shape [${shape.join(", ")}] is not supported.`);
  }
}

export function inferImgAxesViaSpec(shape, specAxes, fromIJ = false) {
  let imgAxes;
  if (fromIJ) {
    if (shape.length === 2) {
      imgAxes = "yx";
    } else if (shape.length === 3) {
      imgAxes = "yxc";
    } else if (shape.length === 4) {
      if (specAxes.includes("z")) {
        imgAxes = "zyxc";
      } else {
        imgAxes = "cyxb";
      }
    } else {
      throw new Error(`Image shape [${shape.join(", ")}] is not supported.`);
    }
  } else {
    let order = "bcz";
    if (!specAxes.includes("c")) {
      order = "bz";
    } else if (!specAxes.includes("z")) {
      order = "bc";
    } else if (!specAxes.includes("b")) {
      order = "cz";
    }
    imgAxes = inferImgAxes(shape, order);
  }
  return imgAxes;
}

export function insertCharAtPosition(originalString, charToInsert, position) {
  return (
    originalString.substring(0, position) +
    charToInsert +
    originalString.substring(position)
  );
}

function getConstructor(tpstr) {
  /**
Int8Array	int8	int8
Int16Array	int16	int16
Int32Array	int32	int32
Uint8Array	uint8	uint8
Uint16Array	uint16	uint16
Uint32Array	uint32	uint32
Float32Array	float32	float32
Float64Array	float64	float64
   */
  let Constructor;
  if (tpstr == "uint8") {
    Constructor = Uint8Array;
  } else if (tpstr == "int8") {
    Constructor = Int8Array;
  } else if (tpstr == "uint16") {
    Constructor = Uint16Array;
  } else if (tpstr == "int16") {
    Constructor = Int16Array;
  } else if (tpstr == "uint32") {
    Constructor = Uint32Array;
  } else if (tpstr == "int32") {
    Constructor = Int32Array;
  } else if (tpstr == "float32") {
    Constructor = Float32Array;
  } else if (tpstr == "float64") {
    Constructor = Float64Array;
  } else if (tpstr == "bool") {
    Constructor = Uint8Array;
  } else {
    throw new Error("Unsupported dtype: " + tpstr);
  }
  return Constructor;
}

function reverseEndianness(arrayBuffer, bytesPerElement) {
  let uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < uint8Array.length; i += bytesPerElement) {
    for (let j = i, k = i + bytesPerElement - 1; j < k; j++, k--) {
      [uint8Array[j], uint8Array[k]] = [uint8Array[k], uint8Array[j]];
    }
  }
  return arrayBuffer;
}

export function ImjoyToTfJs(arr) {
  let buffer = new ArrayBuffer(arr._rvalue.length);
  let bufferView = new Uint8Array(buffer);
  bufferView.set(arr._rvalue);
  const Constructor = getConstructor(arr._rdtype);
  let tarr = new Constructor(buffer);
  if (arr._rdtype === "bool") {
    // convert 1 to 255
    for (let i = 0; i < tarr.length; i++) {
      if (tarr[i] === 1) {
        tarr[i] = 255;
      }
    }
  }
  const tensor = tf.tensor(Array.from(tarr), arr._rshape);
  tensor._rdtype = arr._rdtype;
  return tensor;
}

export function toImJoyArr(tensor, reverseEnd = false) {
  const data = tensor.dataSync();
  const Constructor = getConstructor(tensor._rdtype);
  let casted = new Constructor(data.length);
  for (let i = 0; i < data.length; i++) {
    casted[i] = data[i];
  }
  if (reverseEnd) {
    casted = new Constructor(
      reverseEndianness(casted.buffer, Constructor.BYTES_PER_ELEMENT)
    );
  }
  const value = new Uint8Array(casted.buffer);
  const ijarr = {
    _rtype: "ndarray",
    _rdtype: tensor._rdtype,
    _rshape: tensor.shape,
    _rvalue: value
  };
  return ijarr;
}

export function pick(tensor, idxes) {
  const sliceBegin = [];
  for (let i = 0; i < tensor.shape.length; i++) {
    if (idxes[i] === null) {
      sliceBegin.push(0);
    } else {
      sliceBegin.push(idxes[i]);
    }
  }
  const sliceSize = [];
  for (let i = 0; i < tensor.shape.length; i++) {
    if (idxes[i] === null) {
      sliceSize.push(tensor.shape[i]);
    } else {
      sliceSize.push(1);
    }
  }
  const subTensor = tf.slice(tensor, sliceBegin, sliceSize);
  const newShape = [];
  for (let i = 0; i < tensor.shape.length; i++) {
    if (idxes[i] === null) {
      newShape.push(tensor.shape[i]);
    }
  }
  return tf.reshape(subTensor, newShape);
}

export function mapAxes(inputArray, inputAxes, outputAxes) {
  if (inputAxes.length !== inputArray.shape.length) {
    throw new Error(
      `Number of axes ${inputAxes.length} and dimension of input ${inputArray.shape.length} don't match`
    );
  }

  const pickIdxes = [];
  inputAxes.split("").forEach((axName, axIdx) => {
    const axLen = inputArray.shape[axIdx];
    if (!outputAxes.includes(axName)) {
      let pickIdx = 0;
      if ("zyx".includes(axName)) {
        pickIdx = Math.floor(axLen / 2);
      }
      pickIdxes.push(pickIdx);
    } else {
      pickIdxes.push(null);
    }
  });
  let axes = inputAxes.split("").filter((name, idx) => pickIdxes[idx] === null);

  let newArray = pick(inputArray, pickIdxes);

  outputAxes.split("").forEach(axName => {
    if (!inputAxes.includes(axName)) {
      newArray = tf.reshape(newArray, newArray.shape.concat([1]));
      axes.push(axName);
    }
  });

  const transposeIdxes = [];
  for (let i = 0; i < outputAxes.length; i++) {
    const axName = outputAxes[i];
    const axIdx = axes.indexOf(axName);
    transposeIdxes.push(axIdx);
  }

  newArray = tf.transpose(newArray, transposeIdxes);
  newArray._rdtype = inputArray._rdtype;

  return newArray;
}

export const splitBy = (tensor, by, specAxes) => {
  const byIdx = specAxes.indexOf(by);
  const byLen = tensor.shape[byIdx];
  const splited = [];
  for (let i = 0; i < byLen; i++) {
    const pickIdx = [];
    for (let j = 0; j < tensor.shape.length; j++) {
      if (j === byIdx) {
        pickIdx.push(i);
      } else {
        pickIdx.push(null);
      }
    }
    const subArr = pick(tensor, pickIdx);
    splited.push(subArr);
  }
  return splited;
};

export function splitForShow(tensor, specAxes) {
  if (!specAxes.includes("x") || !specAxes.includes("y")) {
    throw new Error("Unsupported axes: " + specAxes);
  }
  const hasC = specAxes.includes("c");
  const lenC = tensor.shape[specAxes.indexOf("c")];
  const hasZ = specAxes.includes("z");
  const lenZ = tensor.shape[specAxes.indexOf("z")];
  let newImgs = [];
  if (specAxes.length === 2) {
    newImgs.push(tensor);
  } else if (specAxes.length === 3) {
    if (hasC) {
      if (lenC === 3) {
        if (tensor._rdtype === "uint8") {
          newImgs.push(mapAxes(tensor, specAxes, "yxc"));
        } else {
          newImgs.push(mapAxes(tensor, specAxes, "cyx"));
        }
      } else if (lenC === 1) {
        newImgs.push(mapAxes(tensor, specAxes, "yx"));
      } else {
        newImgs.push(mapAxes(tensor, specAxes, "cyx"));
      }
    } else if (hasZ) {
      newImgs.push(mapAxes(tensor, specAxes, "zyx"));
    } else {
      // b, y, x
      newImgs = splitBy(tensor, "b", specAxes);
    }
  } else if (specAxes.length === 4) {
    if (hasC && hasZ) {
      if (lenC == 3) {
        newImgs.push(mapAxes(tensor, specAxes, "zyxc"));
      } else if (lenC == 1) {
        newImgs.push(mapAxes(tensor, specAxes, "zyx"));
      } else if (lenZ == 1) {
        newImgs.push(mapAxes(tensor, specAxes, "cyx"));
      } else {
        // split by c
        splitBy(tensor, "c", specAxes).map(arrs => {
          const subAxes = specAxes.replace("c", "");
          newImgs = newImgs.concat(splitForShow(arrs, subAxes));
        });
      }
    } else {
      // b,c,y,x or b,z,y,x
      // split by b
      splitBy(tensor, "b", specAxes).map(arrs => {
        const subAxes = specAxes.replace("b", "");
        newImgs = newImgs.concat(splitForShow(arrs, subAxes));
      });
    }
  } else if (specAxes.length === 5) {
    // b,c,z,y,x
    // split by b
    splitBy(tensor, "b", specAxes).map(arrs => {
      const subAxes = specAxes.replace("b", "");
      newImgs = newImgs.concat(splitForShow(arrs, subAxes));
    });
  } else {
    throw new Error("Unsupported axes: " + specAxes);
  }
  return newImgs;
}

export function processForShow(img, specAxes) {
  /**
    Process the image for showing.
    ImageJ.JS only supports:
      [height, width]
      [height, width, 1]
      [height, width, 3] (will show as RGB image)
      [z-stack, height, width]
      [z-stack, height, width, 1]
      [z-stack, height, width, 3] (will show as a stack of RGB image)
   */
  const tensor = ImjoyToTfJs(img);
  const splitedArrs = splitForShow(tensor, specAxes);
  return splitedArrs.map(arr => {
    arr._rdtype = tensor._rdtype;
    return toImJoyArr(arr);
  });
}

function getNpyDtype(buffer) {
  const headerLength = new DataView(buffer.slice(8, 10)).getUint8(0);
  const hcontents = new TextDecoder("utf-8").decode(
    new Uint8Array(buffer.slice(10, 10 + headerLength))
  );
  const header = JSON.parse(
    hcontents
      .toLowerCase() // True -> true
      .replace(/'/g, '"')
      .replace("(", "[")
      .replace(/,*\),*/g, "]")
  );
  return header.descr;
}

export async function getNpyEndianness(url) {
  const resp = await fetch(url, {
    headers: {
      Range: "bytes=0-999"
    }
  });
  if (!resp.ok) {
    console.error(resp);
    return null;
  }
  const arrayBuffer = await resp.arrayBuffer();
  const npyDtype = getNpyDtype(arrayBuffer);
  return npyDtype[0];
}

export class Tile {
  constructor(size, start, end) {
    this.size = size;
    this.start = start;
    this.end = end;
  }
}

export class Tiler {
  constructor(id, imageShape, tileShape, overlap) {
    this.id = id;
    this.imageShape = imageShape; // e.g. [1000, 1000, 3]
    this.tileShape = tileShape; // e.g. [256, 256, 3] or [256, 256, null]
    this.overlap = overlap; // e.g. [0, 0, 0]
  }

  getTiles() {
    const tiles = [];
    const imageShape = this.imageShape;
    const tileShape = this.tileShape;
    for (let i = 0; i < tileShape.length; i++) {
      tileShape[i] = tileShape[i] || imageShape[i];
    }
    const overlap = this.overlap;
    const nDims = imageShape.length;
    const nTilesInEachDim = [];
    for (let i = 0; i < nDims; i++) {
      const n = Math.ceil(
        (imageShape[i] - overlap[i]) / (tileShape[i] - overlap[i])
      );
      nTilesInEachDim.push(n);
    }
    const nTiles = nTilesInEachDim.reduce((a, b) => a * b);
    for (let i = 0; i < nTiles; i++) {
      const start = [];
      const end = [];
      for (let j = 0; j < nDims; j++) {
        const n = nTilesInEachDim[j];
        start.push(
          Math.floor(i / n) * (tileShape[j] - overlap[j]) +
            (i % n) * tileShape[j]
        );
        end.push(start[j] + tileShape[j]);
      }
      tiles.push(new Tile(i, tileShape, start, end));
    }
  }
}

<template>
  <div>
    <h2>Quick model testing with your own data</h2>
    <p>
      By clicking the <code>Test the model</code> button, you can test the model
      with your own data.
    </p>
    <b-button v-if="!this.switch" class="is-primary" @click="this.turnOn">
      Test the model
    </b-button>
    <div id="test-run-body" v-if="this.switch">
      <hr />
      <div id="buttons">
        <b-button
          :disabled="!this.buttonEnabledInput"
          @click="this.loadTestInput"
        >
          Load sample image
        </b-button>
        <b-button
          class="is-primary"
          :disabled="!this.buttonEnabledRun"
          @click="this.runModel"
        >
          Run model
        </b-button>
        <b-button
          :disabled="!this.buttonEnabledOutput"
          @click="this.loadTestOutput"
        >
          Show reference output
        </b-button>
      </div>
      <div id="info">
        <div v-if="this.waiting" class="loader"></div>
        <div v-else>
          <span
            >💡Tip: Drag and drop your own image file below to try out the
            model. We support formats like .tiff, .png, and .jpg</span
          >
        </div>
        <div id="info-panel">{{ this.info }}</div>
      </div>
      <div id="ij-container"></div>
    </div>
  </div>
</template>

<style scoped>
#ij-container {
  height: 800px;
  border: 1px solid #ccc;
}
#buttons {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}
#info-panel {
  display: inline-block;
  margin-left: 10px;
  margin-bottom: 20px;
}
.loader {
  display: inline-block;
  border: 4px solid #f3f3f3; /* Light grey */
  border-top: 4px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script>
import { hyphaWebsocketClient } from "imjoy-rpc";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import npyjs from "npyjs";

function inferImgAxes(shape, order = "bcz") {
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

function inferImgAxesViaSpec(shape, specAxes, fromIJ = false) {
  let order = "bcz";
  if (fromIJ) {
    order = "cz";
  } else if (!specAxes.includes("c")) {
    order = "bz";
  } else if (!specAxes.includes("z")) {
    order = "bc";
  } else if (!specAxes.includes("b")) {
    order = "cz";
  }
  const imgAxes = inferImgAxes(shape, order);
  return imgAxes;
}

function insertCharAtPosition(originalString, charToInsert, position) {
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

//function multiplyArrayElements(arr) {
//  return arr.reduce((product, number) => product * number, 1);
//}

//function reverseEndianness(arrayBuffer, bytesPerElement) {
//  let uint8Array = new Uint8Array(arrayBuffer);
//  for (let i = 0; i < uint8Array.length; i += bytesPerElement) {
//    for (let j = i, k = i + bytesPerElement - 1; j < k; j++, k--) {
//      [uint8Array[j], uint8Array[k]] = [uint8Array[k], uint8Array[j]];
//    }
//  }
//  return arrayBuffer;
//}

function ImjoyToTfJs(arr) {
  if (arr._rvalue instanceof ArrayBuffer) {
    arr._rvalue = new Uint8Array(arr._rvalue);
  }
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

function toImJoyArr(tensor) {
  const data = tensor.dataSync();
  const Constructor = getConstructor(tensor._rdtype);
  const casted = new Constructor(data.length);
  for (let i = 0; i < data.length; i++) {
    casted[i] = data[i];
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

function pick(tensor, idxes) {
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

function mapAxes(inputArray, inputAxes, outputAxes) {
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

const splitBy = (tensor, by, specAxes) => {
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

function splitForShow(tensor, specAxes) {
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

function processForShow(img, specAxes) {
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

function rdfHas(rdf, key) {
  return rdf[key] !== undefined && rdf[key].length > 0;
}

export default {
  name: "TestRunForm",
  props: {
    resourceItem: {
      type: Object,
      default: null
    }
  },
  data: () => ({
    switch: false,
    waiting: false,
    rdf: null,
    info: "",
    triton: null,
    ij: null,
    api: null,
    buttonEnabledRun: false,
    buttonEnabledInput: false,
    buttonEnabledOutput: false
  }),
  methods: {
    async turnOn() {
      this.switch = true;
      this.setInfoPanel("Initializing...", true);
      await this.loadImJoy();
      await this.loadTritonClient();
      await this.loadRdf();
      this.setInfoPanel("Loading ImageJ.JS ...", true);
      await this.loadImageJ();
      this.setInfoPanel("");
      this.buttonEnabledRun = true;
      if (
        rdfHas(this.rdf, "test_inputs") ||
        rdfHas(this.rdf, "sample_inputs")
      ) {
        this.buttonEnabledInput = true;
      }
      if (
        rdfHas(this.rdf, "test_outputs") ||
        rdfHas(this.rdf, "sample_outputs")
      ) {
        this.buttonEnabledOutput = true;
      }
    },

    setInfoPanel(info, waiting = false) {
      this.info = info;
      if (waiting) {
        this.waiting = true;
      } else {
        this.waiting = false;
      }
    },

    async bioengineExecute(
      model_id,
      inputs = null,
      return_rdf = false,
      weight_format = null
    ) {
      const ret = await this.triton.execute({
        _rkwargs: true,
        inputs: [
          {
            model_id: model_id,
            inputs: inputs,
            return_rdf: return_rdf,
            weight_format: weight_format
          }
        ],
        model_name: "bioengine-model-runner",
        serialization: "imjoy"
      });
      return ret;
    },

    async runModel() {
      this.setInfoPanel("Running the model...", true);
      this.buttonEnabledRun = false;
      const img = await this.ij.getImage({ format: "ndarray", all: true });
      const inputSpec = this.rdf.inputs[0];
      await this.api.log("Spec input axes: " + inputSpec.axes);
      let imgAxes;
      imgAxes = inferImgAxesViaSpec(img._rshape, inputSpec.axes, true);
      await this.api.log("Input image axes: " + imgAxes);
      await this.api.log("Reshape image to match the input spec.");
      const tensor = ImjoyToTfJs(img);
      const newTensor = mapAxes(tensor, imgAxes, inputSpec.axes);
      const reshapedImg = toImJoyArr(newTensor);
      const resp = await this.bioengineExecute(this.resourceItem.id, [
        reshapedImg
      ]);
      if (!resp.result.success) {
        await this.api.alert("Failed to run the model.");
        this.setInfoPanel("Failed to run the model.");
        this.buttonEnabledRun = true;
        console.error(resp.result.error);
        debugger;
        return;
      }
      this.setInfoPanel("");
      const outImg = resp.result.outputs[0];
      await this.api.log("Output image shape: " + outImg._rshape);
      const outputSpec = this.rdf.outputs[0];
      await this.api.log("Spec output axes: " + outputSpec.axes);
      const imgsForShow = processForShow(outImg, outputSpec.axes);
      await this.showImgs(imgsForShow);
      this.buttonEnabledRun = true;
    },

    async showImgs(imgs) {
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        await this.api.log(
          "Output image shape after processing: " + img._rshape
        );
        try {
          await this.ij.viewImage(img, { name: "output" });
        } catch (err) {
          console.error(err);
          this.setInfoPanel("Failed to view the image.");
        }
        //        await this.ij.runMacro("run('Enhance Contrast', 'saturated=0.35');")
      }
    },

    async loadRdf() {
      const ret = await this.bioengineExecute(
        this.resourceItem.id,
        undefined,
        true
      );
      const rdf = ret.result.rdf;
      console.log(rdf);
      this.rdf = rdf;
    },

    async loadTritonClient() {
      const server = await hyphaWebsocketClient.connectToServer({
        server_url: "https://ai.imjoy.io",
        method_timeout: 30,
        name: "client"
      });
      this.triton = await server.get_service("triton-client");
    },

    async loadImJoy() {
      const api = window.app.imjoy.api;
      this.api = api;
    },

    async loadImageJ() {
      await this.api.log("Loading IJ...");
      this.ij = await this.api.createWindow({
        src: "https://ij.imjoy.io/",
        name: "ImageJ.JS",
        fullscreen: false,
        window_id: "ij-container"
      });
    },

    async viewImgFromUrl(url) {
      await this.api.log("View image from url: " + url);
      let fileName;
      if (url.endsWith("/content")) {
        fileName = url.split("/")[url.split("/").length - 2];
      } else {
        fileName = url.split("/")[url.split("/").length - 1];
      }
      if (fileName.endsWith(".npy")) {
        let nj = new npyjs();
        const res = await nj.load(url);
        const value = new Uint8Array(
          res.data.buffer.slice(res.data.byteOffset)
        );
        const imjArr = {
          _rtype: "ndarray",
          _rdtype: res.dtype,
          _rshape: res.shape,
          _rvalue: value
        };
        const inputSpec = this.rdf.inputs[0];
        const imgAxes = inferImgAxesViaSpec(imjArr._rshape, inputSpec.axes);
        const imgsForShow = processForShow(imjArr, imgAxes);
        await this.showImgs(imgsForShow);
      } else {
        const resp = await fetch(url);
        if (!resp.ok) {
          this.setInfoPanel("Failed to load the image.");
          console.error(resp);
          return;
        }
        const arrayBuffer = await resp.arrayBuffer();
        this.ij.viewImage(arrayBuffer, { name: fileName }).catch(err => {
          console.error(err);
          this.setInfoPanel("Failed to view the image.");
        });
      }
    },

    async loadTestInput() {
      this.setInfoPanel("Loading test input...", true);
      if (rdfHas(this.rdf, "test_inputs")) {
        try {
          await this.viewImgFromUrl(this.rdf.test_inputs[0]);
        } catch (err) {
          await this.api.log("Failed to load the test input.");
          console.error(err);
          await this.api.log("Loading sample input instead...");
          await this.viewImgFromUrl(this.rdf.sample_inputs[0]);
        }
      } else if (rdfHas(this.rdf, "sample_inputs")) {
        await this.viewImgFromUrl(this.rdf.sample_inputs[0]);
      } else {
        await this.api.alert("No test input found.");
      }
      this.setInfoPanel("");
    },

    async loadTestOutput() {
      this.setInfoPanel("Loading test output...", true);
      if (rdfHas(this.rdf, "test_outputs")) {
        try {
          await this.viewImgFromUrl(this.rdf.test_outputs[0]);
        } catch (err) {
          await this.api.log("Failed to load the test output.");
          console.error(err);
          await this.api.log("Loading sample output instead...");
          await this.viewImgFromUrl(this.rdf.sample_outputs[0]);
        }
      } else if (rdfHas(this.rdf, "sample_outputs")) {
        await this.viewImgFromUrl(this.rdf.sample_outputs[0]);
      } else {
        await this.api.alert("No test output found.");
      }
      this.setInfoPanel("");
    }
  }
};
</script>

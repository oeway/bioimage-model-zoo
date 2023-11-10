<template>
  <div>
    <h2>Quick model testing with your own data</h2>
    <p>
      By clicking the <code>Test the model</code> button, you can test the model
      with your own data.
    </p>
    <button class="button is-primary" @click="this.turnOn">
      Test the model
    </button>
    <div id="test-run-body" v-if="this.switch">
      <hr />
      <div id="buttons">
        <button
          class="button"
          :disabled="!this.buttonEnabledRun"
          @click="this.runModel"
        >
          Run model
        </button>
        <button
          class="button"
          :disabled="!this.buttonEnabledInput"
          @click="this.loadSampleInput"
        >
          Sample input
        </button>
        <button
          class="button"
          :disabled="!this.buttonEnabledOutput"
          @click="this.loadSampleOutput"
        >
          Sample output
        </button>
      </div>
      <div id="info">
        <div v-if="this.waiting" class="loader"></div>
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
  height: 10px;
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
import nj from "@d4c/numjs";


function inferImgAxes(shape, order="czb") {
    /**
     * Infer the axes of an image.
     *
     * @param {Array} shape Shape of the image.
     * @returns {string} Axes string.
     */
    if (shape.length === 2) {
        return 'yx';
    } else if (shape.length <= 5) {
        let minDimIdx = shape.indexOf(Math.min(...shape));
        let lowDimShape = shape.slice(); // Clone the shape array
        lowDimShape.splice(minDimIdx, 1); // Remove the smallest dimension
        let lowDimAxes = inferImgAxes(lowDimShape, order.slice(1));
        const insert = order[0];
        return insertCharAtPosition(lowDimAxes, insert, minDimIdx);
    } else {
        throw new Error(`Image shape [${shape.join(', ')}] is not supported.`);
    }
}


function inferImgAxesViaSpec(shape, specAxes) {
  let order = "czb";
  if (!specAxes.includes("c")) {
    order = "zb";
  } else if (!specAxes.includes("z")) {
    order = "cb";
  }
  const imgAxes = inferImgAxes(shape, order);
  return imgAxes;
}


function insertCharAtPosition(originalString, charToInsert, position) {
    return originalString.substring(0, position) + charToInsert + originalString.substring(position);
}


const toNumJS = arr => {
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
  if (arr._rdtype == "uint8") {
    Constructor = Uint8Array;
  } else if (arr._rdtype == "uint16") {
    Constructor = Uint16Array;
  } else if (arr._rdtype == "uint32") {
    Constructor = Uint32Array;
  } else if (arr._rdtype == "int8") {
    Constructor = Int8Array;
  } else if (arr._rdtype == "int16") {
    Constructor = Int16Array;
  } else if (arr._rdtype == "int32") {
    Constructor = Int32Array;
  } else if (arr._rdtype == "float32") {
    Constructor = Float32Array;
  } else if (arr._rdtype == "float64") {
    Constructor = Float64Array;
  } else {
    throw new Error(`Unsupported dtype: ${arr._rdtype}`);
  }
  if (arr._rvalue instanceof ArrayBuffer) {
    arr._rvalue = new Uint8Array(arr._rvalue);
  }
  let buffer = new ArrayBuffer(arr._rvalue.length);
  let bufferView = new Uint8Array(buffer);
  bufferView.set(arr._rvalue);
  let njarr = nj.array(new Constructor(buffer));
  njarr = njarr.reshape(arr._rshape);
  return njarr;
};

const toImJoyArr = njarr => {
  const value = new Uint8Array(njarr.selection.data.buffer);
  const ijarr = {
    _rtype: "ndarray",
    _rdtype: njarr.dtype,
    _rshape: njarr.shape,
    _rvalue: value
  };
  return ijarr;
};

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
  let axes = inputAxes
    .split("")
    .filter((name, idx) => pickIdxes[idx] === null);

  let newArray = inputArray.pick(...pickIdxes);

  outputAxes.split("").forEach(axName => {
    if (!inputAxes.includes(axName)) {
      newArray = newArray.reshape(newArray.shape.concat([1]));
      axes.push(axName);
    }
  });

  const transposeIdxes = [];
  for (let i = 0; i < outputAxes.length; i++) {
    const axName = outputAxes[i];
    const axIdx = axes.indexOf(axName);
    transposeIdxes.push(axIdx);
  }

  newArray = newArray.transpose(...transposeIdxes);

  return newArray;
}


const splitBy = (njarr, by, specAxes) => {
  const byIdx = specAxes.indexOf(by);
  const byLen = njarr.shape[byIdx];
  const splited = [];
  for (let i = 0; i < byLen; i++) {
    const pickIdx = [];
    for (let j = 0; j < njarr.shape.length; j++) {
      if (j === byIdx) {
        pickIdx.push(i);
      } else {
        pickIdx.push(null);
      }
    }
    const subArr = njarr.pick(...pickIdx);
    splited.push(subArr);
  }
  return splited
}


function splitForShow(njarr, specAxes) {
  debugger
  if (!specAxes.includes("x") || !specAxes.includes("y")) {
    throw new Error("Unsupported axes: " + specAxes);
  }
  const hasC = specAxes.includes("c");
  const lenC = njarr.shape[specAxes.indexOf("c")];
  const hasZ = specAxes.includes("z");
  const lenZ = njarr.shape[specAxes.indexOf("z")];
  let newImgs = [];
  if (specAxes.length === 2) {
    newImgs.push(njarr);
  } else if (specAxes.length === 3) {
    if (hasC) {
      if (lenC === 3) {
        newImgs.push(mapAxes(njarr, specAxes, "yxc"));
      } else if (lenC === 1) {
        newImgs.push(mapAxes(njarr, specAxes, "yx"));
      } else {
        newImgs.push(mapAxes(njarr, specAxes, "cyx"));
      }
    } else if (hasZ) {
      newImgs.push(mapAxes(njarr, specAxes, "zyx"));
    } else {  // b, y, x
      newImgs = splitBy(njarr, "b", specAxes);
    }
  } else if (specAxes.length === 4) {
    if (hasC && hasZ) {
      if (lenC == 3) {
        newImgs.push(mapAxes(njarr, specAxes, "zyxc"));
      } else if (lenC == 1) {
        newImgs.push(mapAxes(njarr, specAxes, "zyx"));
      } else if (lenZ == 1) {
        newImgs.push(mapAxes(njarr, specAxes, "cyx"));
      } else {
        // split by c
        splitBy(njarr, "c", specAxes).map((arrs) => {
          const subAxes = specAxes.replace("c", "");
          newImgs = newImgs.concat(splitForShow(arrs, subAxes))
        })
      }
    } else {  // b,c,y,x or b,z,y,x
      // split by b
      splitBy(njarr, "b", specAxes).map((arrs) => {
        const subAxes = specAxes.replace("b", "");
        newImgs = newImgs.concat(splitForShow(arrs, subAxes))
      })
    }
  } else if (specAxes.length === 5) {
    // b,c,z,y,x
    // split by b
    splitBy(njarr, "b", specAxes).map((arrs) => {
      const subAxes = specAxes.replace("b", "");
      newImgs = newImgs.concat(splitForShow(arrs, subAxes))
    })
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
  const njarr = toNumJS(img);
  const splitedArrs = splitForShow(njarr, specAxes);
  return splitedArrs.map(arr => toImJoyArr(arr));
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
      const hasSampleInput =
        this.rdf.sample_inputs !== undefined &&
        this.rdf.sample_inputs.length > 0;
      if (hasSampleInput) {
        this.buttonEnabledInput = true;
      }
      const hasSampleOutput =
        this.rdf.sample_outputs !== undefined &&
        this.rdf.sample_outputs.length > 0;
      if (hasSampleOutput) {
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
      imgAxes = inferImgAxesViaSpec(img._rshape, inputSpec.axes);
      await this.api.log("Input image axes: " + imgAxes);
      await this.api.log("Reshape image to match the input spec.");
      const njarr = toNumJS(img);
      const newNjArr = mapAxes(njarr, imgAxes, inputSpec.axes);
      const reshapedImg = toImJoyArr(newNjArr);
      const resp = await this.bioengineExecute(this.resourceItem.id, [
        reshapedImg
      ]);
      if (!resp.result.success) {
        await this.api.alert("Failed to run the model.");
        this.setInfoPanel("Failed to run the model.");
        this.buttonEnabledRun = true;
        console.error(resp.result.error);
        debugger
        return;
      }
      this.setInfoPanel("Success!");
      const outImg = resp.result.outputs[0];
      await this.api.log("Output image shape: " + outImg._rshape);
      const outputSpec = this.rdf.outputs[0];
      await this.api.log("Spec output axes: " + outputSpec.axes);
      const imgsForShow = processForShow(outImg, outputSpec.axes);
      for (let i = 0; i < imgsForShow.length; i++) {
        const img = imgsForShow[i];
        await this.api.log("Output image shape after processing: " + img._rshape);
        await this.ij.viewImage(img, { name: "output" }).catch(err => {
          console.error(err);
          this.setInfoPanel("Failed to view the image.");
        });
      }
      this.buttonEnabledRun = true;
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
      const resp = await fetch(url);
      if (!resp.ok) {
        this.setInfoPanel("Failed to load the image.");
        console.error(resp);
        return;
      }
      const arrayBuffer = await resp.arrayBuffer();
      let fileName;
      if (url.endsWith("/content")) {
        fileName = url.split("/")[url.split("/").length - 2];
      } else {
        fileName = url.split("/")[url.split("/").length - 1];
      }
      this.ij.viewImage(arrayBuffer, { name: fileName }).catch(err => {
        console.error(err);
        this.setInfoPanel("Failed to view the image.");
      });
    },

    async loadSampleInput() {
      const url = this.rdf.sample_inputs[0];
      this.setInfoPanel("Loading sample input...", true);
      await this.viewImgFromUrl(url);
      this.setInfoPanel("");
    },

    async loadSampleOutput() {
      const url = this.rdf.sample_outputs[0];
      this.setInfoPanel("Loading sample output...", true);
      await this.viewImgFromUrl(url);
      this.setInfoPanel("");
    }
  }
};
</script>

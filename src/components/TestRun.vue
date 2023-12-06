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
      <details>
        <div class="overlay-container">
          <div v-if="waiting" class="overlay"></div>
          <h3>Settings for image tiling</h3>
          <div style="display: flex; gap: 30px">
            <div style="width: 30%">
              <b-field
                v-if="'x' in inputMinShape && 'y' in inputMinShape"
                label="Tile size(XY)"
              >
                <b-numberinput
                  v-model="tileSizes.x"
                  :min="inputMinShape.x"
                  :max="inputMaxShape.x"
                ></b-numberinput>
              </b-field>
              <b-field v-if="'z' in inputMinShape" label="Tile size(Z)">
                <b-numberinput
                  v-model="tileSizes.z"
                  :min="inputMinShape.z"
                  :max="inputMaxShape.z"
                ></b-numberinput>
              </b-field>
            </div>
            <div style="width: 30%">
              <b-field
                v-if="'x' in inputMinShape && 'y' in inputMinShape"
                label="Tile overlap(XY)"
              >
                <b-numberinput
                  v-model="tileOverlap.x"
                  :min="0"
                  :max="inputMaxShape.x"
                ></b-numberinput>
              </b-field>
              <b-field v-if="'z' in inputMinShape" label="Tile overlap(Z)">
                <b-numberinput
                  v-model="tileOverlap.z"
                  :min="0"
                  :max="inputMaxShape.z"
                ></b-numberinput>
              </b-field>
            </div>
          </div>
        </div>
        <summary>Advance options</summary>
      </details>
      <div id="info">
        <div v-if="this.waiting" class="loader"></div>
        <div v-else>
          <span
            >💡Tip: Drag and drop your own image file below to try out the
            model. We support formats like .tiff, .png, and .jpg</span
          >
        </div>
        <div id="info-panel" :style="{ color: infoColor }">{{ this.info }}</div>
      </div>
      <div id="ij-container"></div>
    </div>
  </div>
</template>

<style scoped>
#ij-container {
  height: 600px;
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

details > summary:before,
details[open] > summary:before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  left: -21px;
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='9' viewBox='0 0 14 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L7 7.5L13 1.5' stroke='%230039A6' stroke-width='2'/%3E%3C/svg%3E%0A");
  background-repeat: no-repeat;
  background-position: center center;
  transition: 0.2s;
}

details[open] > summary:before {
  transform: rotate(180deg);
}

summary {
  user-select: none;
}

.overlay-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute; /* Sit on top of the page content */
  display: block; /* Hidden by default */
  width: 100%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(61, 60, 60, 0.5); /* Black background with opacity */
  z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
  cursor: pointer; /* Add a pointer on hover */
}
</style>

<script>
import { hyphaWebsocketClient } from "imjoy-rpc";
import npyjs from "npyjs";
import {
  ImjoyToTfJs,
  mapAxes,
  toImJoyArr,
  inferImgAxesViaSpec,
  getNpyEndianness,
  processForShow,
  ImgPadder,
  ImgTiler,
  ImgTile,
  TileMerger,
  MeanTileMerger
} from "../imgProcess";

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
    error: false,
    rdf: null,
    info: "",
    triton: null,
    ij: null,
    api: null,
    buttonEnabledRun: false,
    buttonEnabledInput: false,
    buttonEnabledOutput: false,
    inputEndianness: null,
    tileSizes: { x: 0, y: 0, z: 0 },
    tileOverlap: { x: 0, y: 0, z: 0 }
  }),
  computed: {
    infoColor() {
      if (this.error) {
        return "red";
      } else {
        return "black";
      }
    },
    fixedTileSize() {
      if (this.rdf) {
        const inputSpec = this.rdf.inputs[0];
        const dims = this.tritonConfig.input[0]["dims"];
        if (dims !== undefined && !dims.includes(-1)) {
          return dims;
        }
        if (inputSpec.shape instanceof Array) {
          return inputSpec.shape;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    inputMinShape() {
      if (this.rdf) {
        const axes = this.rdf.inputs[0].axes; // something like "zyx"
        let minShape; // something like [16, 64, 64]
        if (this.fixedTileSize === false) {
          minShape = this.rdf.inputs[0].shape.min;
        } else {
          minShape = this.fixedTileSize;
        }
        // return something like {x: 64, y: 64, z: 16}
        const res = axes.split("").reduce((acc, cur, i) => {
          acc[cur] = minShape[i];
          return acc;
        }, {});
        return res;
      } else {
        return {};
      }
    },
    inputMaxShape() {
      if (this.rdf) {
        const axes = this.rdf.inputs[0].axes; // something like "zyx"
        let maxShape; // something like [16, 64, 64]
        if (this.fixedTileSize !== false) {
          maxShape = this.fixedTileSize;
        } else {
          // array of undefined
          maxShape = this.rdf.inputs[0].shape.min.map(() => undefined);
        }
        return axes.split("").reduce((acc, cur, i) => {
          acc[cur] = maxShape[i];
          return acc;
        }, {});
      } else {
        return {};
      }
    }
  },
  watch: {
    tileSizes: {
      handler(oldObj, newObj) {
        if (newObj.y !== newObj.x) {
          this.tileSizes.y = newObj.x; // keep x and y the same
        }
        console.log(oldObj, newObj);
      },
      deep: true
    },

    tileOverlap: {
      handler(oldObj, newObj) {
        if (newObj.y !== newObj.x) {
          this.tileOverlap.y = newObj.x; // keep x and y the same
        }
        console.log(oldObj, newObj);
      },
      deep: true
    }
  },
  methods: {
    async turnOn() {
      this.switch = true;
      this.setInfoPanel("Initializing...", true);
      await this.loadImJoy();
      await this.loadTritonClient();
      await this.loadRdf();
      await this.loadTritonConfig();
      this.setDefaultTileSize();
      this.setDefaultOverlap();
      await this.detectInputEndianness();
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

    setDefaultTileSize() {
      const tileSizes = Object.assign({}, this.inputMinShape);
      const axes = this.rdf.inputs[0].axes;
      if (this.fixedTileSize === false) {
        const xyFactor = 4;
        tileSizes.x = xyFactor * this.inputMinShape.x;
        tileSizes.y = xyFactor * this.inputMinShape.y;
      } else {
        axes.split("").map((a, i) => {
          tileSizes[a] = this.fixedTileSize[i];
        });
      }
      this.tileSizes = tileSizes;
    },

    setDefaultOverlap() {
      const inputSpec = this.rdf.inputs[0];
      const outputSpec = this.rdf.outputs[0];
      const axes = inputSpec.axes;
      let overlap = {};
      if (outputSpec.halo && this.fixedTileSize === false) {
        axes.split("").map((a, i) => {
          if (outputSpec.axes.includes(a) && a !== "z") {
            overlap[a] = 2 * outputSpec.halo[i];
          } else {
            overlap[a] = 0;
          }
        });
      } else {
        overlap = axes.split("").reduce((acc, cur) => {
          acc[cur] = 0;
          return acc;
        }, {});
      }
      this.tileOverlap = overlap;
    },

    setInfoPanel(info, waiting = false, error = false) {
      this.info = info;
      this.waiting = waiting;
      this.error = error;
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

    async submitTensor(tensor) {
      const reverseEnd = this.inputEndianness === "<";
      const reshapedImg = toImJoyArr(tensor, reverseEnd);
      const resp = await this.bioengineExecute(this.resourceItem.id, [
        reshapedImg
      ]);
      if (!resp.result.success) {
        throw new Error(resp.result.error);
      }
      const outImg = resp.result.outputs[0];
      return outImg;
    },

    async runOneTensor(tensor, padder) {
      await this.api.log("Input tile shape: " + tensor.shape);
      const [paddedTensor, padArr] = padder.pad(tensor);
      await this.api.log("Padded tile shape: " + paddedTensor.shape);
      let outImg = await this.submitTensor(paddedTensor);
      await this.api.log("Output tile shape: " + outImg._rshape);
      const outTensor = ImjoyToTfJs(outImg);
      const isImg2Img =
        this.rdf.outputs[0].axes.includes("x") &&
        this.rdf.outputs[0].axes.includes("y");
      let result = outTensor;
      if (isImg2Img) {
        const cropedTensor = padder.crop(outTensor, padArr);
        result = cropedTensor;
      }
      return result;
    },

    async runTiles(tensor, inputSpec, outputSpec) {
      let padder;
      if (this.fixedTileSize === false) {
        padder = new ImgPadder(
          undefined,
          inputSpec.shape.min,
          inputSpec.shape.step,
          0
        );
      } else {
        padder = new ImgPadder(this.fixedTileSize, undefined, undefined, 0);
      }
      const tileSize = inputSpec.axes.split("").map(a => this.tileSizes[a]);
      const overlap = inputSpec.axes.split("").map(a => this.tileOverlap[a]);
      console.log("tile size:", tileSize, "overlap:", overlap);
      const tiler = new ImgTiler(tensor.shape, tileSize, overlap);
      const nTiles = tiler.getNTiles();
      await this.api.log("Number of tiles in each dimension: " + nTiles);
      const inTiles = tiler.getTiles();
      await this.api.log("Number of tiles: " + inTiles.length);
      const outTiles = [];
      for (let i = 0; i < inTiles.length; i++) {
        this.setInfoPanel(
          `Running the model... (${i + 1}/${inTiles.length})`,
          true
        );
        const tile = inTiles[i];
        console.log(tile);
        tile.slice(tensor);
        const outTensor = await this.runOneTensor(tile.data, padder);
        const outTile = new ImgTile(tile.starts, tile.ends, tile.indexes);
        outTile.data = outTensor;
        outTiles.push(outTile);
      }
      const isImg2Img =
        outputSpec.axes.includes("x") && outputSpec.axes.includes("y");
      let merger;
      if (isImg2Img) {
        merger = new TileMerger(tensor.shape);
      } else {
        merger = new MeanTileMerger(tensor.shape);
      }
      const res = merger.mergeTiles(outTiles).data;
      await this.api.log("Output image shape after merging: " + res.shape);
      return res;
    },

    async runModel() {
      this.setInfoPanel("Running the model...", true);
      this.buttonEnabledRun = false;
      const inputSpec = this.rdf.inputs[0];
      const outputSpec = this.rdf.outputs[0];
      await this.api.log("Spec input axes: " + inputSpec.axes);
      await this.api.log("Spec output axes: " + outputSpec.axes);
      try {
        const img = await this.ij.getImage({ format: "ndarray", all: true });
        let imgAxes = inferImgAxesViaSpec(img._rshape, inputSpec.axes, true);
        await this.api.log("Input image axes: " + imgAxes);
        await this.api.log("Reshape image to match the input spec.");
        const tensor = ImjoyToTfJs(img);
        const reshapedTensor = mapAxes(tensor, imgAxes, inputSpec.axes);
        const outTensor = await this.runTiles(
          reshapedTensor,
          inputSpec,
          outputSpec
        );
        const isImg2Img =
          outputSpec.axes.includes("x") && outputSpec.axes.includes("y");
        if (isImg2Img) {
          const imgsForShow = processForShow(outTensor, outputSpec.axes);
          await this.showImgs(imgsForShow, "output");
        } else {
          // classification model
          await this.showTableFromTensor(outTensor, "output");
        }
      } catch (e) {
        await this.api.alert(
          "Failed to run the model, see console for details."
        );
        this.setInfoPanel(
          "Failed to run the model, see console for details.",
          false,
          true
        );
        this.buttonEnabledRun = true;
        console.error(e);
        debugger;
        return;
      }
      this.setInfoPanel("");
      this.buttonEnabledRun = true;
    },

    async showImgs(imgs, name = "output") {
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        await this.api.log(
          "Output image shape after processing: " + img._rshape
        );
        try {
          await this.ij.viewImage(img, { name: name });
        } catch (err) {
          console.error(err);
          this.setInfoPanel("Failed to view the image.", false, true);
        }
        //        await this.ij.runMacro("run('Enhance Contrast', 'saturated=0.35');")
      }
    },

    async loadRdf() {
      let ret;
      try {
        ret = await this.bioengineExecute(
          this.resourceItem.id,
          undefined,
          true
        );
      } catch (err) {
        await this.api.alert(
          "Failed to load the model, see console for details."
        );
        this.setInfoPanel("Failed to load the model.", false, true);
        throw err;
      }
      const rdf = ret.result.rdf;
      console.log(rdf);
      this.rdf = rdf;
    },

    async loadTritonClient() {
      const server = await hyphaWebsocketClient.connectToServer({
        server_url: "https://hypha.bioimage.io",
        method_timeout: 30,
        name: "client"
      });
      this.triton = await server.get_service("triton-client");
    },

    async loadTritonConfig() {
      const nickname = this.resourceItem.nickname;
      const url = `https://ai.imjoy.io/triton/v2/models/${nickname}/config`;
      const config = await fetch(url).then(res => res.json());
      this.tritonConfig = config;
    },

    async loadImJoy() {
      function waitForImjoy(timeout = 10000) {
        return new Promise((resolve, reject) => {
          const interval = setInterval(() => {
            if (window.app && window.app.imjoy !== undefined) {
              clearInterval(interval);
              resolve(window.app.imjoy);
            }
          }, 100); // Check every 100 milliseconds

          // Optional: Reject the promise after a timeout
          setTimeout(() => {
            clearInterval(interval);
            reject(new Error("Timeout waiting for window.app.imjoy"));
          }, timeout);
        });
      }

      const imjoy = await waitForImjoy();
      console.log("ImJoy is ready:", imjoy);

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

    async viewFromUrl(url, type = "input") {
      await this.api.log("View image from url: " + url);
      let fileName;
      if (url.endsWith("/content")) {
        fileName = url.split("/")[url.split("/").length - 2];
      } else {
        fileName = url.split("/")[url.split("/").length - 1];
      }
      if (fileName.endsWith(".npy")) {
        let nj = new npyjs();
        const npyBuffer = await fetch(url).then(res => res.arrayBuffer());
        const res = await nj.load(npyBuffer);
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
        const tensor = ImjoyToTfJs(imjArr);
        if (type === "output") {
          const outputSpec = this.rdf.outputs[0];
          const isImg2Img =
            outputSpec.axes.includes("x") && outputSpec.axes.includes("y");
          if (!isImg2Img) {
            //classification model
            await this.showTableFromTensor(tensor, fileName);
            return;
          }
        }
        const imgsForShow = processForShow(tensor, imgAxes);
        await this.showImgs(imgsForShow, fileName);
      } else {
        const resp = await fetch(url);
        if (!resp.ok) {
          this.setInfoPanel("Failed to load the image.", false, true);
          console.error(resp);
          return;
        }
        const arrayBuffer = await resp.arrayBuffer();
        this.ij.viewImage(arrayBuffer, { name: fileName }).catch(err => {
          console.error(err);
          this.setInfoPanel("Failed to view the image.", false, true);
        });
      }
    },

    async showTableFromTensor(tensor, tableName) {
      const arrs = tensor.arraySync();
      arrs.map(async arr => {
        await this.showTable(arr, "Probability", tableName);
      });
    },

    async showTable(column, columnName, tableName) {
      const index = column.map((_, i) => i);
      const macro = `
Table.create("${tableName}")
Table.setColumn("Index", newArray(${index.join(",")}))
Table.setColumn("${columnName}", newArray(${column.join(",")}))
      `;
      this.ij.runMacro(macro);
    },

    async detectInputEndianness() {
      const url = this.rdf.test_inputs[0];
      if (!url) {
        this.inputEndianness = null;
      } else {
        this.inputEndianness = await getNpyEndianness(url);
      }
      await this.api.log("Input endianness: " + this.inputEndianness);
    },

    async loadTestInput() {
      this.setInfoPanel("Loading test input...", true);
      if (rdfHas(this.rdf, "test_inputs")) {
        try {
          await this.viewFromUrl(this.rdf.test_inputs[0]);
        } catch (err) {
          await this.api.log(
            "Failed to load the test input, see console for details."
          );
          console.error(err);
          await this.api.log("Loading sample input instead...");
          await this.viewFromUrl(this.rdf.sample_inputs[0]);
        }
      } else if (rdfHas(this.rdf, "sample_inputs")) {
        await this.viewFromUrl(this.rdf.sample_inputs[0]);
      } else {
        await this.api.alert("No test input found.");
      }
      this.setInfoPanel("");
    },

    async loadTestOutput() {
      this.setInfoPanel("Loading test output...", true);
      if (rdfHas(this.rdf, "test_outputs")) {
        try {
          await this.viewFromUrl(this.rdf.test_outputs[0], "output");
        } catch (err) {
          await this.api.log("Failed to load the test output.");
          console.error(err);
          await this.api.log("Loading sample output instead...");
          await this.viewFromUrl(this.rdf.sample_outputs[0], "output");
        }
      } else if (rdfHas(this.rdf, "sample_outputs")) {
        await this.viewFromUrl(this.rdf.sample_outputs[0], "output");
      } else {
        await this.api.alert("No test output found.");
      }
      this.setInfoPanel("");
    }
  }
};
</script>

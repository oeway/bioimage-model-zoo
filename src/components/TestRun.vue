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
      <div id="bioengine-web-client"></div>
      <div id="ij-tips">
        💡Tip: Drag and drop your own image file below to try out the model. We
        support formats like .tiff, .png, and .jpg
      </div>
      <div id="ij-container"></div>
    </div>
  </div>
</template>

<style scoped>
#bioengine-web-client {
  width: 100%;
  height: 100%;
  margin-bottom: 10px;
}
#ij-tips {
  margin-bottom: 10px;
}
#ij-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ccc;
}
</style>

<script>
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
    api: null
  }),
  computed: {},
  watch: {},
  methods: {
    async turnOn() {
      this.switch = true;
      await this.loadImJoy();
      await this.loadBioengineWebClient();
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
    async loadBioengineWebClient() {
      const api = this.api;
      api.createWindow({
        src: "https://ij.imjoy.io/",
        name: "ImageJ.JS",
        fullscreen: false,
        window_id: "ij-container"
      });
      api.createWindow({
        src: `https://bioimage-io.github.io/bioengine-web-client/?model=${this.resourceItem.id}`,
        title: "Bioengine Web Client",
        window_id: "bioengine-web-client"
      });
    }
  }
};
</script>

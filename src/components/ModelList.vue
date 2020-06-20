<template>
  <div class="model-list">
    <div class="container content-wrapper">
      <div class="columns is-multiline">
        <div
          v-for="model in models"
          :key="model.name"
          class="column is-4-desktop is-3-widescreen is-half-tablet"
        >
          <model-card
            @show-info="showModelInfo"
            :model="model"
            :apps="apps"
          ></model-card>
        </div>
        <span
          style="text-align: center;"
          class="column"
          v-if="models && models.length === 0"
          >The model list is empty.</span
        >
      </div>
    </div>
  </div>
</template>

<script>
import { version } from "../../package.json";
import Vue from "vue";
import ModelCard from "./ModelCard";

Vue.component("label-selector", {
  props: ["all-labels"],
  template: document.getElementById("label-selector")
});

export default {
  name: "ModelList",
  components: { "model-card": ModelCard },
  props: {
    models: {
      type: Array,
      default: null
    },
    apps: {
      type: Object,
      default: null
    }
  },
  computed: {
    filteredModels: function() {
      const covered = this.models.filter(model => model.cover_image);
      const models = covered.concat(
        this.models.filter(model => !model.cover_image)
      );
      return models.filter(model =>
        this.filters.every(label => model.allLabels.includes(label))
      );
    }
  },
  data() {
    return {
      version: version,
      filters: [],
      selected_model: {},
      windows: [],
      imjoy: null,
      dialog_window: null,
      loading: false,
      lastModified: null,
      local_file: null,
      watch_timer: null,
      show_models: true,
      selected_window: null
    };
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    showModelInfo(minfo) {
      this.$emit("show-model-info", minfo);
    },
    showMessage(message, duration) {
      duration = duration || 5000;
      const data = {
        message: message.slice(0, 200),
        onAction: function() {},
        actionText: "Close",
        duration: duration
      };

      this.$buefy.snackbar.open(data);
    },
    share(model) {
      prompt(
        "Please copy and paste following URL for sharing:",
        "https://bioimage.io?model=" + encodeURI(model.name)
      );
    },
    addRemoveToFilters(label) {
      if (this.filters.indexOf(label) === -1) {
        this.filters.push(label);
      } else {
        this.filters = this.filters.filter(x => x !== label);
      }
    },
    checkActive(label) {
      return this.filters.indexOf(label) > -1;
    },
    clearAllFilters() {
      this.filters = [];
    },
    getLabelCount(label) {
      return this.filteredModels.filter(models =>
        models.allLabels.includes(label)
      ).length;
    },
    getModelsCount() {
      return this.filteredModels.length;
    },
    showSubscriptionForm() {
      if (!this.$refs.subscription_dialog.open)
        this.$refs.subscription_dialog.showModal();
    },
    closeSubscriptionForm() {
      this.$refs.subscription_dialog.close();
    },
    addWindow(w) {
      this.selectWindow(w);
      this.show_models = false;
      this.selected_window = w;
      this.$forceUpdate();
    },
    async removeWindow(w) {
      w.closing = true;
      await w.close();
      this.show_models = true;
      this.selected_window = null;
      this.$forceUpdate();
    },
    selectWindow(w) {
      if (w.closing) return;
      this.selected_window = w;
      this.show_models = false;
    },
    closeDialog() {
      this.$refs.window_dialog.close();
    },
    async runManyModels(plugin) {
      try {
        this.loading = true;
        if (plugin.type === "window") {
          const w = await plugin.api.run();
          if (!this.validateBioEngineApp(plugin.name, w)) {
            w.runManyModels = w.run;
          }
          await w.runManyModels(this.models);
        } else {
          plugin.api.runManyModels(this.models);
        }
      } catch (e) {
        this.showMessage(e);
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async runOneModel(plugin, model) {
      try {
        this.loading = true;
        if (plugin.type === "window") {
          const w = await plugin.api.run();
          this.validateBioEngineApp(plugin.name, w);
          await w.runOneModel(model);
        } else {
          plugin.api.runOneModel(model);
        }
      } catch (e) {
        this.showMessage(e);
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    fileSelected() {
      this.lastModified = null;
      if (!this.$refs.file_select.files) return;
      this.local_file = this.$refs.file_select.files[0];
      this.lastModified = "old";
      this.showMessage("Loading App...");
      this.watch_timer = setInterval(() => {
        this.$forceUpdate();
        this.loadCodeFromFile(this.local_file);
      }, 1000);
      this.loadCodeFromFile(this.local_file);
    },
    validateBioEngineApp(name, api) {
      if (!api.runOneModel && !api.runManyModels) {
        console.error(
          `${name}" has neither "runOneModel" nor "runManyModels":`,
          api
        );
        alert(
          `"${name}" is not a valid BioEngine App, it should define "runOneModel" and/or "runManyModels".`
        );
        return false;
      }
      if (!api.testModel) {
        console.warn(`Please define a testModel function for "${name}".`);
      }
      return true;
    },
    loadCodeFromFile(file) {
      file = file || this.local_file;
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        this.local_file = file;
        try {
          const code = reader.result;
          if (this.lastModified != file.lastModified) {
            this.lastModified = file.lastModified;
            const config = this.imjoy.pm.parsePluginCode(code);
            config.dependencies = config.dependencies || [];
            try {
              this.loading = true;
              for (let i = 0; i < config.dependencies.length; i++) {
                await this.imjoy.pm.reloadPluginRecursively({
                  uri: config.dependencies[i]
                });
              }
              const plugin = await this.imjoy.pm.reloadPlugin(config);
              console.log(plugin);
              if (plugin.type !== "window") {
                this.validateBioEngineApp(plugin.name, plugin.api);
              }
              this.$store.commit("addApp", plugin);
              this.showMessage(`Plugin "${plugin.name}" loaded successfully.`);
              this.$forceUpdate();
              console.log(`Plugin "${plugin.name}" loaded successfully.`);
            } catch (error) {
              this.showMessage(
                `Failed to load dependencies for ${config.name}: ${error}`
              );
            } finally {
              this.loading = false;
            }
          }
        } catch (e) {
          console.error(e);
          this.showMessage(`Failed to load plugin: ${e}`);
        }
      };
      reader.onerror = e => {
        console.error(e);
        this.showMessage(`Failed to load plugin: ${e}`);
        if (this.watch_timer) {
          clearInterval(this.watch_timer);
        }
        this.watch_file = false;
        this.$forceUpdate();
      };
      reader.readAsText(file);
    }
  }
};
</script>

<style lang="css">
.model-list {
  min-height: 50vh;
}
</style>

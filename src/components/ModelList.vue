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
            :apps="model.apps"
            :model="model"
          ></model-card>
        </div>
        <span
          style="text-align: center;"
          class="column"
          v-if="models && models.length === 0"
          >The list is empty.</span
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
    }
  }
};
</script>

<style lang="css">
.model-list {
  min-height: 50vh;
}
</style>

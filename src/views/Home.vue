<template>
  <div class="home">
    <!-- Navigation bar -->
    <nav class="navbar is-link is-fixed-top">
      <div class="navbar-brand">
        <span style="font-size:3em;margin-left:10px;">
          {{ siteConfig.site_icon }}</span
        >
        <span style="font-size:2.4em;padding-top:10px;padding-left:4px;">
          {{ siteConfig.site_name }}</span
        >
        <div
          class="navbar-burger burger"
          :class="{ 'is-active': showMenu }"
          data-target="navbarExampleTransparentExample"
          @click="showMenu = !showMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div
        id="navbarExampleTransparentExample"
        :class="{ 'is-active': showMenu }"
        class="navbar-menu"
      >
        <div class="navbar-end">
          <a class="navbar-item" @click="showAboutDialog">
            <b-icon icon="information-outline"></b-icon>
            <span>About</span>
          </a>
          <a
            class="navbar-item"
            v-if="siteConfig.subscribe_url"
            @click="showSubscribeDialog"
          >
            <b-icon icon="playlist-check"></b-icon>
            <span>Subscribe</span>
          </a>
          <a
            class="navbar-item"
            target="_blank"
            v-if="siteConfig.contribute_url"
            :href="siteConfig.contribute_url"
          >
            <b-icon icon="plus"></b-icon>
            <span>Contribute</span>
          </a>
          <a class="navbar-item" @click="showApps">
            <b-icon icon="puzzle"></b-icon>
            <span>Applications</span>
          </a>
        </div>
      </div>
    </nav>
    <!-- Header -->
    <section class="hero is-link is-fullheight is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-1">
            {{ siteConfig.splash_title }}
          </h1>
          <h2 class="subtitle is-3">
            {{ siteConfig.splash_subtitle }}
          </h2>
          <ul style="font-size: 1.5em;" v-if="siteConfig.splash_feature_list">
            <li
              v-for="feature in siteConfig.splash_feature_list"
              :key="feature"
            >
              - {{ feature }}
            </li>
          </ul>
          <br />
          <b-button rounded style="text-transform:none;" @click="enter">
            <span style="font-size: 1.3rem;">{{
              siteConfig.explore_button_text
            }}</span></b-button
          >
        </div>
        <img
          style="position:absolute; bottom: 0px; right:0px; opacity: 0.9; width:70%;"
          :src="siteConfig.background_image"
        />
      </div>
    </section>
    <br />
    <span ref="search_anchor"></span>
    <div class="container" style="text-align:center;  padding-right: 60px;">
      <div
        class="item-lists is-link"
        style="width:30px;"
        @click="currentList = null"
        :class="{ active: !currentList }"
      >
        All
      </div>
      <div
        class="item-lists is-link"
        @click="currentList = list"
        :class="{ active: currentList === list }"
        v-for="list in siteConfig.item_lists"
        :key="list.name"
      >
        {{ list.name }}
      </div>
    </div>
    <model-selector
      @selection-changed="updateModelList"
      :models="models"
      :fullLabelList="fullLabelList"
      :tagCategories="tagCategories"
      :type="currentList && currentList.type"
    ></model-selector>
    <div
      v-if="currentList && currentList.type === 'application'"
      style="text-align:center;"
    >
      <a @click="$refs.file_select.click()">Load application from file</a>
      <input
        type="file"
        style="display:none;"
        @change="fileSelected"
        ref="file_select"
      />
    </div>
    <br />
    <model-list @show-model-info="showModelInfo" :models="selectedModels" />

    <footer class="footer">
      <div class="columns is-multiline">
        <div
          v-if="siteConfig.footer_github"
          class="column is-4-desktop is-3-widescreen is-half-tablet"
        >
          <a :href="siteConfig.footer_github.url" target="_blank">
            <img
              src="/static/img/github.svg"
              style="width: 36px; height:36px;margin-right:3px; margin-bottom:-8px;"
            /><span style="font-size:1.3rem;">{{
              siteConfig.footer_github.label
            }}</span></a
          >
        </div>
      </div>
    </footer>
    <modal
      name="window-modal-dialog"
      :resizable="!dialogWindowConfig.fullscreen"
      ref="window_modal_dialog"
      :width="dialogWindowConfig.width"
      :height="dialogWindowConfig.height"
      :adaptive_size="dialogWindowConfig.adaptive_size"
      :minWidth="200"
      :minHeight="150"
      :fullscreen="dialogWindowConfig.fullscreen"
      style="max-width: 100%; max-height:100%;"
      draggable=".drag-handle"
      :scrollable="true"
    >
      <div
        v-if="selected_dialog_window"
        @dblclick="maximizeWindow()"
        class="drag-handle dialog-header"
      >
        <span class="noselect"> {{ selected_dialog_window.name }}</span>
        <button
          @click="closeWindow(selected_dialog_window)"
          class="noselect dialog-control-button"
          style="background:#ff0000c4;left:2px;"
        >
          x
        </button>
        <button
          @click="minimizeWindow()"
          class="noselect dialog-control-button"
          style="background:#00cdff61;left:40px;"
        >
          -
        </button>
        <button
          @click="maximizeWindow()"
          class="noselect dialog-control-button"
          style="background:#00cdff61;left:80px;"
        >
          {{ fullscreen ? "=" : "+" }}
        </button>
      </div>
      <template v-for="wdialog in dialogWindows">
        <div
          :key="wdialog.window_id"
          v-show="wdialog === selected_dialog_window"
          style="height: calc(100% - 18px);"
        >
          <div :id="wdialog.window_id" style="width: 100%;height: 100%;"></div>
        </div>
      </template>
    </modal>
    <modal
      name="info-dialog"
      :resizable="true"
      ref="window_modal_dialog"
      :minWidth="200"
      :minHeight="150"
      :height="600"
      :width="800"
      style="max-width:100%;max-height:100%;"
      :fullscreen="fullscreen"
      draggable=".drag-handle"
      :scrollable="true"
    >
      <div @dblclick="maximizeWindow()" class="drag-handle dialog-header">
        <span class="noselect"> {{ infoDialogTitle }}</span>
        <button
          @click="closeWindow()"
          class="noselect dialog-control-button"
          style="background:#ff0000c4;left:2px;"
        >
          x
        </button>
        <button
          @click="maximizeWindow()"
          class="noselect dialog-control-button"
          style="background:#00cdff61;left:40px;"
        >
          {{ fullscreen ? "=" : "+" }}
        </button>
      </div>
      <about v-if="showDialogMode === 'about'"></about>
      <iframe
        v-else-if="showDialogMode === 'subscribe'"
        style="padding-bottom: 64px;width: 100%;
    height: 100%;"
        :src="siteConfig.subscribe_url"
        width="640"
        height="852"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
        >Loading…</iframe
      >
      <model-info
        v-else-if="showDialogMode === 'model' && selectedModel"
        :model="selectedModel"
      ></model-info>
    </modal>
  </div>
</template>

<script>
// @ is an alias to /src
import ModelSelector from "@/components/ModelSelector.vue";
import ModelList from "@/components/ModelList.vue";
import ModelInfo from "@/components/ModelInfo.vue";
import About from "@/views/About.vue";
import siteConfig from "../siteConfig";
import {
  setupBioEngine,
  loadPlugins,
  loadCodeFromFile,
  setupBioEngineAPI
} from "../bioEngine";
import {
  getUrlParameter,
  randId,
  concatAndResolveUrl,
  debounce
} from "../utils";

function normalizeModel(model) {
  model.apps = model.apps || [];
  model.covers = model.covers || [];
  model.authors = model.authors || [];
  model.description = model.description || "";
  if (model.covers && !Array.isArray(model.covers)) {
    model.covers = [model.covers];
  }
  model.cover_images = [];
  for (let cover of model.covers) {
    if (cover.includes("(") || cover.includes(")")) {
      console.error("cover image file name cannot contain brackets.");
      continue;
    }
    if (!cover.startsWith("http")) {
      model.cover_images.push(
        encodeURI(concatAndResolveUrl(model.root_url, cover))
      );
    } else {
      model.cover_images.push(encodeURI(cover));
    }
  }

  model.allLabels = model.labels || [];
  if (model.license) {
    model.allLabels.push(model.license);
  }
  if (model.tags) {
    model.allLabels = model.allLabels.concat(
      model.tags.map(tag => tag.toLowerCase())
    );
  }
}

export default {
  name: "Home",
  components: {
    "model-list": ModelList,
    "model-selector": ModelSelector,
    "model-info": ModelInfo,
    about: About
  },
  data() {
    return {
      siteConfig: siteConfig,
      models: null,
      selectedModels: null,
      showMenu: false,
      applications: [],
      apps: {},
      dialogWindowConfig: {
        width: "800px",
        height: "670px",
        draggable: true
      },
      dialogWindows: [],
      selectedModel: null,
      fullscreen: false,
      selected_dialog_window: null,
      screenWidth: 1000,
      showDialogMode: null,
      infoDialogTitle: "",
      currentList: null
    };
  },
  created: async function() {
    window.document.title = this.siteConfig.site_name;
    let items;
    try {
      let repo = "bioimage-io/bioimage-io-models";

      const query_repo = getUrlParameter("repo");
      let manifest_url = this.siteConfig.manifest_url;
      if (query_repo) {
        if (query_repo.startsWith("http") || query_repo.startsWith("/")) {
          manifest_url = query_repo;
        } else if (query_repo.split("/").length === 2) {
          manifest_url = `https://raw.githubusercontent.com/${query_repo}/master/manifest.model.json`;
        } else if (query_repo.split("/").length === 3) {
          manifest_url = `https://raw.githubusercontent.com/${query_repo}/manifest.model.json`;
        } else {
          alert("Unsupported repo format.");
          throw "Unsupported repo format.";
        }

        repo = query_repo;
      }

      const response = await fetch(manifest_url + "?" + randId());
      const repo_manifest = JSON.parse(await response.text());
      items = repo_manifest.items;
      for (let model of items) {
        model.repo = repo;
        model.model_uri = `${repo}:${model.name}`;
        model.source_url = model.url;
        if (!model.source.startsWith("http"))
          model.source = concatAndResolveUrl(model.root_url, model.source);
      }
      this.setModels(items);
      this.$forceUpdate();

      console.log("Loading ImJoy...");
      const workspace = getUrlParameter("workspace") || getUrlParameter("w");
      setupBioEngine(
        workspace,
        this.showMessage,
        this.showWindowDialog,
        this.closeWindowDialog,
        this.updateStatus
      ).then(imjoy => {
        this.imjoy = imjoy;
        imjoy.event_bus.on("show_message", msg => {
          this.showMessage(msg);
        });
        imjoy.event_bus.on("add_window", w => {
          this.addWindow(w);
        });
        imjoy.event_bus.on("plugin_loaded", () => {});

        imjoy.event_bus.on("imjoy_ready", () => {});

        imjoy.event_bus.on("close_window", () => {});
        const applications = items.filter(m => m.type === "application");
        this.showMessage("Loading applications...");
        loadPlugins(imjoy, applications).then(apps => {
          this.showMessage(
            `Successfully loaded ${Object.keys(apps).length} applications.`
          );
        });
        for (let model of this.models) {
          model.apps = [];
          for (let app_key in model.applications) {
            if (this.apps[app_key]) model.apps.push(this.apps[app_key]);
          }
        }
      });
      // inside an iframe
      if (window.self !== window.top) {
        setupBioEngineAPI();
      }
    } catch (e) {
      console.error(e);
      alert(`Failed to fetch manifest file from the repo: ${e}.`);
    }
  },
  computed: {
    fullLabelList: function() {
      const fullLabelList = [];
      if (this.models)
        for (let model of this.models) {
          normalizeModel(model);
          model.allLabels.forEach(label => {
            if (fullLabelList.indexOf(label) === -1) {
              fullLabelList.push(label.toLowerCase());
            }
          });
        }
      fullLabelList.sort((a, b) =>
        a.toLowerCase() < b.toLowerCase() ? -1 : 1
      );
      return fullLabelList;
    },
    tagCategories: function() {
      if (this.currentList) {
        return this.currentList && this.currentList.tag_categories;
      } else {
        let combined = {};
        for (let list of siteConfig.item_lists) {
          combined = Object.assign(combined, list.tag_categories);
        }
        return combined;
      }
    }
  },
  mounted() {
    window.addEventListener("resize", this.updateSize);
    window.dispatchEvent(new Event("resize"));
    // select models as default
    for (let list of siteConfig.item_lists) {
      if (list.type === "model") {
        this.currentList = list;
        break;
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateSize);
  },
  methods: {
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
    updateSize() {
      debounce(() => {
        this.screenWidth = window.innerWidth;
        if (this.screenWidth < 700) this.fullscreen = true;
        this.$forceUpdate();
      }, 250)();
    },
    showApps() {
      for (let list of siteConfig.item_lists) {
        if (list.type === "application") {
          this.currentList = list;
          break;
        }
      }
      this.enter();
    },
    showAboutDialog() {
      this.showDialogMode = "about";
      this.infoDialogTitle = "About";
      this.$modal.show("info-dialog");
    },
    showSubscribeDialog() {
      this.showDialogMode = "subscribe";
      this.infoDialogTitle = "Subscribe to News and Updates";
      this.$modal.show("info-dialog");
    },
    showModelInfo(mInfo) {
      this.showDialogMode = "model";
      this.selectedModel = mInfo;
      this.infoDialogTitle = this.selectedModel.name;
      if (this.screenWidth < 700) this.fullscreen = true;
      this.$modal.show("info-dialog");
    },
    updateStatus(status) {
      if (status.loading === true) this.showMessage("Loading...");
      if (status.loading === false) this.showMessage("Loading done.");
    },
    closeWindow() {
      this.selectedModel = null;
      this.$modal.hide("info-dialog");
    },
    minimizeWindow() {
      this.$modal.hide("odel-info-dialog");
    },
    maximizeWindow() {
      this.fullscreen = !this.fullscreen;
    },
    enter() {
      const top = this.$refs.search_anchor.getBoundingClientRect().top;
      window.scrollTo({ top: top - 100, behavior: "smooth", block: "start" });
    },
    updateModelList(models) {
      if (models.length <= 0) {
        this.showMessage("No item found.");
      }
      this.selectedModels = models;
    },
    setModels(models) {
      this.models = models;
      this.selectedModels = models;
    },
    showModelFromUrl() {
      const selected_model = getUrlParameter("model");
      if (selected_model) {
        const m = this.models.filter(model => model.name === selected_model)[0];
        if (m) this.showModelInfo(m);
      }
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
    showWindowDialog() {},
    closeWindowDialog() {},
    fileSelected() {
      if (!this.$refs.file_select.files) return;
      const local_file = this.$refs.file_select.files[0];
      this.showMessage("Loading App...");
      loadCodeFromFile(this.imjoy, local_file);
    },

    share(model) {
      prompt(
        "Please copy and paste following URL for sharing:",
        "https://bioimage.io?model=" + encodeURI(model.name)
      );
    },
    getLabelCount(label) {
      return this.filteredModels.filter(models =>
        models.allLabels.includes(label)
      ).length;
    },
    getModelsCount() {
      return this.filteredModels.length;
    }
  }
};
</script>

<style>
.navbar-item,
.navbar-link {
  font-size: 1.5rem;
}

.navbar-item:hover,
.navbar-item:focus {
  background: #a8d8ff !important;
}

.model-card:hover {
  transition: all 0.4s;
  -webkit-transition: all 0.4s;
  box-shadow: 0 10px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.b-tooltip.is-primary:after {
  background: #2196f3 !important;
  color: white;
}
.card-image {
  max-height: 200px;
}
.vm--modal {
  max-height: 100%;
  max-width: 100%;
}
.dialog-header {
  height: 40px;
  font-size: 1.4rem;
  cursor: move;
  background-color: #2196f3;
  color: white;
  text-align: center;
  line-height: 40px;
}
.dialog-control-button {
  cursor: pointer;
  width: 34px;
  height: 36px;
  line-height: 30px;
  padding-bottom: 7px;
  border: 0px;
  font-size: 2rem;
  position: absolute;
  color: white;
  top: 2px;
  font-family: "Lucida Console", Monaco, monospace;
}
.dialog-control-button:focus {
  outline: none;
}

.item-lists {
  width: 100px;
  display: inline-block;
  margin: 10px;
  text-align: center;
  cursor: pointer;
  font-size: 1.2em;
  color: #006fcb;
}
.item-lists:hover {
  font-weight: 600;
}

.item-lists.active {
  font-weight: 600;
}
.noselect {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>

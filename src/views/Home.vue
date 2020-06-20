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
          <a class="navbar-item" @click="showBioEngineApps">
            <b-icon icon="puzzle"></b-icon>
            <span>BioEngine Apps</span>
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
        <span> {{ selected_dialog_window.name }}</span>
        <button
          @click="closeWindow(selected_dialog_window)"
          class="dialog-header-button"
          style="background:#ff0000c4;left:2px;"
        >
          x
        </button>
        <button
          @click="minimizeWindow()"
          class="dialog-header-button"
          style="background:#00cdff61;left:40px;"
        >
          -
        </button>
        <button
          @click="maximizeWindow()"
          class="dialog-header-button"
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
        <span> {{ infoDialogTitle }}</span>
        <button
          @click="closeWindow()"
          class="dialog-header-button"
          style="background:#ff0000c4;left:2px;"
        >
          x
        </button>
        <button
          @click="maximizeWindow()"
          class="dialog-header-button"
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
      let repository_url = this.siteConfig.repository_url;
      if (query_repo) {
        if (query_repo.startsWith("http") || query_repo.startsWith("/")) {
          repository_url = query_repo;
        } else if (query_repo.split("/").length === 2) {
          repository_url = `https://raw.githubusercontent.com/${query_repo}/master/manifest.model.json`;
        } else if (query_repo.split("/").length === 3) {
          repository_url = `https://raw.githubusercontent.com/${query_repo}/manifest.model.json`;
        } else {
          alert("Unsupported repo format.");
          throw "Unsupported repo format.";
        }

        repo = query_repo;
      }

      const response = await fetch(repository_url + "?" + randId());
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
      const applications = items.filter(m => m.type === "application");
      console.log("Loading ImJoy...");
      this.setupImJoyCore(applications).then(() => {
        for (let model of this.models) {
          model.apps = [];
          for (let app_key in model.applications) {
            if (this.apps[app_key]) model.apps.push(this.apps[app_key]);
          }
        }
      });
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
    updateSize() {
      debounce(() => {
        this.screenWidth = window.innerWidth;
        if (this.screenWidth < 700) this.fullscreen = true;
        this.$forceUpdate();
      }, 250)();
    },
    showBioEngineApps() {
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
    async setupImJoyCore(appSources) {
      const imjoyCore = await window.loadImJoyCore({ version: "0.13.10" });
      const me = this;
      const lazy_dependencies = {};
      var imjoy_api = {
        showStatus(plugin, info) {
          me.showMessage(info);
        },
        showMessage(plugin, info, duration) {
          me.showMessage(info, duration);
        },
        showProgress(plugin, progress) {
          if (progress < 1) progress = progress * 100;
          me.$refs.progressbar.setProgress(progress);
        },
        showDialog(_plugin, config) {
          return new Promise((resolve, reject) => {
            me.dialog_window = config;
            me.$forceUpdate();
            if (config.ui) {
              if (!me.$refs.window_dialog.open)
                me.$refs.window_dialog.showModal();
              const joy_config = {
                container: document.getElementById("window-dialog-container"),
                init: config.ui || "", //"{id:'localizationWorkflow', type:'ops'} " + // a list of ops
                data: config.data, // || Joy.loadFromURL(),
                modules: config.modules || ["instructions", "math"],
                onexecute: config.onexecute,
                onupdate: config.onupdate
              };
              try {
                new imjoyCore.Joy(joy_config);
              } catch (e) {
                console.error("error occured when loading the workflow", e);
                joy_config.data = "";
                new imjoyCore.Joy(joy_config);
                throw e;
              }
            } else if (config.type) {
              if (!me.$refs.window_dialog.open)
                me.$refs.window_dialog.showModal();
              config.window_container = "window-dialog-container";
              config.standalone = true;
              if (config.type.startsWith("imjoy/")) {
                config.render = () => {};
              }
              setTimeout(() => {
                imjoy.pm
                  .createWindow(null, config)
                  .then(api => {
                    const _close = api.close;
                    api.close = async () => {
                      await _close();
                      me.closeDialog();
                    };
                    resolve(api);
                  })
                  .catch(reject);
              }, 0);
            } else {
              alert("Unsupported dialog type.");
            }
          });
        }
      };

      const imjoy = new imjoyCore.ImJoy({
        imjoy_api: imjoy_api
      });
      imjoy.event_bus.on("show_message", msg => {
        this.showMessage(msg);
      });
      imjoy.event_bus.on("add_window", w => {
        this.addWindow(w);
      });
      imjoy.pm.imjoy_api.getPlugin = async (_plugin, plugin_name) => {
        const target_plugin = imjoy.pm.plugin_names[plugin_name];
        if (target_plugin) {
          return target_plugin.api;
        } else if (imjoy.pm.internal_plugins[plugin_name]) {
          try {
            this.loading = true;
            this.$forceUpdate();
            const p = await imjoy.pm.reloadPluginRecursively(
              {
                uri: imjoy.pm.internal_plugins[plugin_name].uri
              },
              null,
              "eval is evil"
            );
            console.log(`${p.name} loaded.`);
            return p.api;
          } catch (e) {
            console.error(e);
            throw e;
          } finally {
            this.loading = false;
            this.$forceUpdate();
          }
        } else if (lazy_dependencies[plugin_name]) {
          try {
            this.loading = true;
            this.$forceUpdate();
            const p = await imjoy.pm.reloadPluginRecursively({
              uri: lazy_dependencies[plugin_name]
            });
            console.log(`${p.name} loaded.`);
            return p.api;
          } catch (e) {
            console.error(e);
            throw e;
          } finally {
            this.loading = false;
            this.$forceUpdate();
          }
        } else {
          throw `plugin with type ${plugin_name} not found.`;
        }
      };
      const workspace = getUrlParameter("workspace") || getUrlParameter("w");
      imjoy
        .start({ workspace: workspace })
        .then(async () => {
          this.windows = imjoy.wm.windows;
          console.log("ImJoy started: ", imjoy);
          this.loading = true;
          await imjoy.pm.reloadPluginRecursively({
            uri:
              "https://imjoy-team.github.io/jupyter-engine-manager/Jupyter-Engine-Manager.imjoy.html"
          });
          // await imjoy.pm.reloadInternalPlugins()
          for (let ap of appSources) {
            try {
              const config = await imjoy.pm.getPluginFromUrl(ap.source);
              const p = await imjoy.pm.reloadPlugin(config);
              for (let i = 0; i < config.dependencies.length; i++) {
                const d_config = await imjoy.pm.getPluginFromUrl(
                  config.dependencies[i]
                );
                // TODO: use a better way to determin if it's an internal plugin type
                if (imjoy.pm.getBadges(d_config) === "🚀") {
                  lazy_dependencies[d_config.name] = config.dependencies[i];
                } else {
                  await imjoy.pm.reloadPluginRecursively({
                    uri: config.dependencies[i]
                  });
                }
              }
              if (p.type !== "window") {
                if (!this.validateBioEngineApp(p.name, p.api)) continue;
              }
              this.apps[ap.name] = p;
            } catch (e) {
              console.error(e);
            }
          }
          this.loading = false;
          this.$forceUpdate();
        })
        .catch(e => {
          console.error(e);
          alert("Error: " + e);
        });

      imjoy.event_bus.on("plugin_loaded", () => {});

      imjoy.event_bus.on("imjoy_ready", () => {});

      imjoy.event_bus.on("close_window", w => {
        if (w.window_container !== "window-dialog-container") {
          this.show_models = true;
          this.$forceUpdate();
        }
      });
      this.imjoy = imjoy;
      console.log("ImJoy loaded successfully.");
      return imjoy;
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
  background-color: #448aff;
  color: white;
  text-align: center;
  line-height: 40px;
}
.dialog-header-button {
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
</style>

<template>
  <div class="home">
    <!-- Navigation bar -->
    <nav class="navbar is-link is-fixed-top">
      <div class="navbar-brand">
        <span style="font-size:3em;margin-left:10px;"> 🦒</span>
        <span style="font-size:2.5em;padding-top:10px;padding-left:4px;">
          BioImage.IO</span
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
          <a class="navbar-item" href="/#/about">
            <b-icon icon="info"></b-icon>
            <span>About</span>
          </a>
          <a class="navbar-item">
            <span>Subscribe</span>
          </a>
          <a
            class="navbar-item"
            target="_blank"
            href="https://github.com/bioimage-io/bioimage-io-models#how-to-contribute-new-models"
          >
            Contribute
          </a>
          <a class="navbar-item" href="#BioEngine">
            <span class="icon">
              <i class="fas fa-th-list"></i>
            </span>
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
            Bioimage Model Zoo
          </h1>
          <h2 class="subtitle is-3">
            Advanced AI models in one-click
          </h2>
          <ul style="font-size: 1.5em;">
            <li>- Integrate with Fiji, Ilastik, ImJoy</li>
            <li>- Try model instantly with BioEngine</li>
            <li>- Contribute your models via Github</li>
            <li>- Link models to BioEngine Apps</li>
          </ul>
          <br />
          <b-button rounded style="text-transform:none;" @click="enter"
            >🚀Explore the Zoo</b-button
          >
        </div>
        <img
          style="position:absolute; bottom: 0px; right:0px; opacity: 0.9; width:70%;"
          src="static/img/zoo-background.svg"
        />
      </div>
    </section>
    <br />
    <span ref="search_anchor"></span>
    <model-selector
      @selection-changed="updateModelList"
      :models="models"
      :fullLabelList="fullLabelList"
    ></model-selector>
    <model-list
      @show-model-info="showModelInfo"
      :models="selectedModels"
      :apps="apps"
    />

    <footer class="footer">
      <div>
        <ul>
          <li>
            <a
              href="https://github.com/bioimage-io/bioimage-io-models"
              target="_blank"
            >
              <img
                src="/static/img/github.svg"
                style="width: 20px; height:20px;margin-right:3px;"
              />Model Repository</a
            >
          </li>
          <li>
            <a
              href="https://gitter.im/bioimage-io/community?utm_source=badge&amp;utm_medium=badge&amp;utm_campaign=pr-badge"
              rel="nofollow"
              ><img
                src="https://camo.githubusercontent.com/9c76187a0ae04eb172156d1e614a1f6a128d05a4/68747470733a2f2f6261646765732e6769747465722e696d2f62696f696d6167652d696f2f636f6d6d756e6974792e737667"
                alt="Gitter"
                data-canonical-src="https://badges.gitter.im/bioimage-io/community.svg"
                style="max-width:100%;"
            /></a>
          </li>
        </ul>
      </div>
    </footer>
    <modal
      name="window-modal-dialog"
      :resizable="!dialog_window_config.fullscreen"
      ref="window_modal_dialog"
      :width="dialog_window_config.width"
      :height="dialog_window_config.height"
      :adaptive_size="dialog_window_config.adaptive_size"
      :minWidth="200"
      :minHeight="150"
      :fullscreen="dialog_window_config.fullscreen"
      style="max-width: 100%; max-height:100%;"
      draggable=".drag-handle"
      :scrollable="true"
    >
      <div
        v-if="selected_dialog_window"
        @dblclick="maximizeWindow()"
        style="cursor:move; background-color: #448aff; color: white; text-align: center;"
      >
        {{ selected_dialog_window.name }}
        <button
          @click="closeWindow(selected_dialog_window)"
          style="height: 16px;border:0px;font-size:1rem;position:absolute;background:#ff0000c4;color:white;top:1px; left:1px;"
        >
          X
        </button>
        <button
          @click="minimizeWindow()"
          style="height: 16px;border:0px;font-size:1rem;position:absolute;background:#00cdff61;color:white;top:1px; left:25px;"
        >
          -
        </button>
        <button
          @click="maximizeWindow()"
          style="height: 16px;border:0px;font-size:1rem;position:absolute;background:#00cdff61;color:white;top:1px; left:45px;"
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
      name="model-info-dialog"
      :resizable="true"
      ref="window_modal_dialog"
      :minWidth="200"
      :minHeight="150"
      :fullscreen="fullscreen"
      draggable=".drag-handle"
      :scrollable="true"
    >
      <div
        v-if="selectedModel"
        @dblclick="maximizeWindow()"
        style="cursor:move; background-color: #448aff; color: white; text-align: center;"
      >
        {{ selectedModel.name }}
        <button
          @click="closeWindow(selectedModel)"
          style="height: 22px;border:0px;font-size:1rem;position:absolute;background:#ff0000c4;color:white;top:1px; left:1px;"
        >
          X
        </button>
        <button
          @click="minimizeWindow()"
          style="height: 22px;border:0px;font-size:1rem;position:absolute;background:#00cdff61;color:white;top:1px; left:25px;"
        >
          -
        </button>
        <button
          @click="maximizeWindow()"
          style="height: 22px;border:0px;font-size:1rem;position:absolute;background:#00cdff61;color:white;top:1px; left:45px;"
        >
          {{ fullscreen ? "=" : "+" }}
        </button>
      </div>
      <section v-if="selectedModel">
        <model-info :model="selectedModel"></model-info>
      </section>
    </modal>
  </div>
</template>

<script>
// @ is an alias to /src
import ModelSelector from "@/components/ModelSelector.vue";
import ModelList from "@/components/ModelList.vue";
import ModelInfo from "@/components/ModelInfo.vue";
import { getUrlParameter, randId } from "../utils";

function normalizeModel(model) {
  model.cover_images = [];
  if (model.covers && !Array.isArray(model.covers)) {
    model.covers = [model.covers];
  }
  for (let cover of model.covers) {
    if (cover.includes("(") || cover.includes(")")) {
      console.error("cover image file name cannot contain brackets.");
      continue;
    }
    if (!cover.startsWith("http")) {
      model.cover_images.push(encodeURI(model.root_url + "/" + cover));
    } else {
      model.cover_images.push(encodeURI(cover));
    }
  }

  model.allLabels = model.labels || [];
  if (model.license) {
    model.allLabels.push(model.license);
  }
  if (model.tags) {
    model.allLabels = model.allLabels.concat(model.tags);
  }
}

export default {
  name: "Home",
  components: {
    "model-list": ModelList,
    "model-selector": ModelSelector,
    "model-info": ModelInfo
  },
  data() {
    return {
      models: null,
      selectedModels: null,
      showMenu: false,
      fullLabelList: [],
      applications: [],
      apps: {},
      dialog_window_config: {
        width: "800px",
        height: "670px",
        draggable: true
      },
      dialogWindows: [],
      selectedModel: null,
      fullscreen: false,
      selected_dialog_window: null
    };
  },
  created: async function() {
    let models;
    try {
      let repo = "bioimage-io/bioimage-io-models";

      const query_repo = getUrlParameter("repo");
      let repository_url = `https://raw.githubusercontent.com/bioimage-io/bioimage-io-models/master/manifest.model.json`;
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
      models = repo_manifest.models;
      for (let model of models) {
        model.repo = repo;
        model.model_uri = `${repo}:${model.name}`;
        model.source_url = model.url;
        if (!model.config_url.startsWith("http"))
          model.config_url = model.root_url + "/" + model.config_url;
      }
      this.setModels(models);
      this.$forceUpdate();
      console.log("Loading ImJoy...");
      this.setupImJoyCore(repo_manifest.applications);
    } catch (e) {
      console.error(e);
      alert(`Failed to fetch manifest file from the repo: ${e}.`);
    }
  },
  computed: {},
  methods: {
    showModelInfo(mInfo) {
      this.selectedModel = mInfo;
      this.$modal.show("model-info-dialog");
    },
    closeWindow() {
      this.selectedModel = null;
      this.$modal.hide("model-info-dialog");
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
        this.showMessage("No model found.");
      }
      this.selectedModels = models;
    },
    setModels(models) {
      this.fullLabelList = [];
      for (let model of models) {
        normalizeModel(model);
        model.allLabels.forEach(label => {
          if (this.fullLabelList.indexOf(label) === -1) {
            this.fullLabelList.push(label);
          }
        });
        this.fullLabelList.sort((a, b) =>
          a.toLowerCase() < b.toLowerCase() ? -1 : 1
        );
      }
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
          for (let k in appSources) {
            try {
              const config = await imjoy.pm.getPluginFromUrl(appSources[k]);
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
              this.apps[k] = p;
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
</style>

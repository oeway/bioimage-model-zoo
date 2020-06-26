<template>
  <div class="home">
    <!-- Navigation bar -->
    <nav class="navbar is-link is-fixed-top">
      <div class="navbar-brand">
        <span class="site-icon"> {{ siteConfig.site_icon }}</span>
        <span class="site-title"> {{ siteConfig.site_name }}</span>
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
          <a class="navbar-item" @click="showAboutDialog">
            <b-icon icon="information-outline"></b-icon>
            <span>About</span>
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
          <ul class="feature-list" v-if="siteConfig.splash_feature_list">
            <li
              v-for="feature in siteConfig.splash_feature_list"
              :key="feature"
            >
              - {{ feature }}
            </li>
          </ul>
          <br />
          <b-button rounded style="text-transform:none;" @click="enter">
            <span class="explore-btn">{{
              siteConfig.explore_button_text
            }}</span></b-button
          >
        </div>
        <img class="background-img" :src="siteConfig.background_image" />
      </div>
    </section>
    <br />
    <span ref="search_anchor"></span>
    <div class="container" style="text-align:center;">
      <div
        class="item-lists is-link"
        style="width:30px; margin-left: -16px;"
        @click="
          currentList = null;
          updateQueryTags();
        "
        :class="{ active: !currentList }"
      >
        All
      </div>
      <div
        class="item-lists is-link"
        @click="
          currentList = list;
          updateQueryTags();
        "
        :class="{ active: currentList === list }"
        v-for="list in siteConfig.item_lists"
        :key="list.name"
      >
        {{ list.name }}
      </div>
    </div>
    <resource-item-selector
      @selection-changed="updateResourceItemList"
      :allItems="resourceItems"
      :fullLabelList="fullLabelList"
      :tagCategories="tagCategories"
      :type="currentList && currentList.type"
      :showDisplayMode="screenWidth > 700"
      @display-mode-change="displayModeChanged"
      :searchTags="searchTags"
      @tags-updated="updateQueryTags"
    ></resource-item-selector>
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
    <resource-item-list
      @show-resource-item-info="showResourceItemInfo"
      :allItems="selectedItems"
      :displayMode="screenWidth > 700 ? displayMode : 'card'"
    />
    <br />

    <footer class="footer">
      <div class="columns is-mobile is-centered" v-if="siteConfig.footer">
        <div
          v-for="item in siteConfig.footer"
          :key="item.label"
          class="column is-one-quarter"
          style="text-align: center"
        >
          <b-tooltip :label="item.tooltip" position="is-top"
            ><a :href="item.url" target="_blank">
              <img :src="item.logo" style="height: 55px;" />
            </a>
          </b-tooltip>
        </div>
      </div>
      <div style="text-align: center" v-if="siteConfig.footnote">
        <p>{{ siteConfig.footnote }}</p>
      </div>
    </footer>
    <modal
      name="window-modal-dialog"
      :resizable="!dialogWindowConfig.fullscreen"
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
        v-if="selectedDialogWindow"
        @dblclick="maximizeDialogWindow()"
        :class="{ 'drag-handle': !isTouchDevice }"
        class=" dialog-header"
      >
        <span class="noselect dialog-title">
          {{ selectedDialogWindow.name }}</span
        >
        <button
          @click="closeDialogWindow(selectedDialogWindow)"
          class="noselect dialog-control-button"
          style="background:#ff0000c4;left:2px;"
        >
          x
        </button>
        <button
          v-if="screenWidth > 700"
          @click="minimizeDialogWindow()"
          class="noselect dialog-control-button"
          style="background:#00cdff61;left:40px;"
        >
          -
        </button>
        <button
          v-if="screenWidth > 700"
          @click="maximizeDialogWindow()"
          class="noselect dialog-control-button"
          style="background:#00cdff61;left:80px;"
        >
          {{ dialogWindowConfig.fullscreen ? "=" : "+" }}
        </button>

        <b-dropdown
          aria-role="list"
          style="position:absolute;right:1px;"
          position="is-bottom-left"
        >
          <button
            class="button"
            style="background: rgba(0, 205, 255, 0.38);color:white;width:34px;"
            slot="trigger"
          >
            <b-icon icon="dots-horizontal"></b-icon>
          </button>

          <b-dropdown-item
            aria-role="listitem"
            v-for="w in dialogWindows"
            @click="selectWindow(w)"
            :key="w.id"
            >{{ w.name }}</b-dropdown-item
          >
        </b-dropdown>
      </div>
      <template v-for="wdialog in dialogWindows">
        <div
          :key="wdialog.window_id"
          v-show="wdialog === selectedDialogWindow"
          style="height: calc(100% - 18px);"
        >
          <div :id="wdialog.window_id" style="width: 100%;height: 100%;"></div>
        </div>
      </template>
    </modal>
    <modal
      name="info-dialog"
      :resizable="true"
      :minWidth="200"
      :minHeight="150"
      :height="600"
      :width="800"
      style="max-width:100%;max-height:100%;"
      :fullscreen="infoDialogFullscreen"
      draggable=".drag-handle"
      :scrollable="true"
    >
      <div
        @dblclick="maximizeInfoWindow()"
        :class="{ 'drag-handle': !isTouchDevice }"
        class="dialog-header"
      >
        <span class="noselect dialog-title"> {{ infoDialogTitle }}</span>
        <button
          @click="closeInfoWindow()"
          class="noselect dialog-control-button"
          style="background:#ff0000c4;left:2px;"
        >
          x
        </button>
        <button
          v-if="screenWidth > 700"
          @click="maximizeInfoWindow()"
          class="noselect dialog-control-button"
          style="background:#00cdff61;left:40px;"
        >
          {{ infoDialogFullscreen ? "=" : "+" }}
        </button>
      </div>
      <about v-if="showInfoDialogMode === 'about'"></about>
      <iframe
        v-else-if="showInfoDialogMode === 'subscribe'"
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
      <resource-item-info
        v-else-if="showInfoDialogMode === 'model' && selectedResourceItem"
        :resourceItem="selectedResourceItem"
      ></resource-item-info>
    </modal>
  </div>
</template>

<script>
import Vue from "vue";
import ResourceItemSelector from "@/components/ResourceItemSelector.vue";
import ResourceItemList from "@/components/ResourceItemList.vue";
import ResourceItemInfo from "@/components/ResourceItemInfo.vue";
import About from "@/views/About.vue";
import siteConfig from "../../site.config.json";
import {
  setupBioEngine,
  loadPlugins,
  loadCodeFromFile,
  setupBioEngineAPI,
  runOneModel,
  runManyModels
} from "../bioEngine";
import { randId, concatAndResolveUrl, debounce } from "../utils";

// set default values for table_view
siteConfig.table_view = siteConfig.table_view || {
  columns: ["name", "authors", "badges", "apps"]
};

const isTouchDevice = (function() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
})();

function normalizeItem(self, item) {
  item.covers = item.covers || [];
  item.authors = item.authors || [];
  item.description = item.description || "";
  if (item.covers && !Array.isArray(item.covers)) {
    item.covers = [item.covers];
  }
  item.cover_images = [];
  for (let cover of item.covers) {
    if (cover.includes("(") || cover.includes(")")) {
      console.error("cover image file name cannot contain brackets.");
      continue;
    }
    if (!cover.startsWith("http")) {
      item.cover_images.push(
        encodeURI(concatAndResolveUrl(item.root_url, cover))
      );
    } else {
      item.cover_images.push(encodeURI(cover));
    }
  }

  item.allLabels = item.labels || [];
  if (item.license) {
    item.allLabels.push(item.license);
  }
  if (item.applications) {
    item.allLabels = item.allLabels.concat(item.applications);
  }
  if (item.tags) {
    item.allLabels = item.allLabels.concat(
      item.tags
        .filter(tag => typeof tag === "string")
        .map(tag => tag.toLowerCase())
    );
  }
  // make it lower case and remove duplicates
  item.allLabels = Array.from(
    new Set(item.allLabels.map(label => label.toLowerCase()))
  );
  item.apps = [];
  item.apps.unshift({
    name: "Share",
    icon: "share-variant",
    show_on_hover: true,
    run() {
      const query = Object.assign({}, self.$route.query);
      query.id = item.id;
      self.$router.replace({ query: query }).catch(() => {});

      alert(
        "Please copy and paste the URL in the browser address bar for sharing."
      );
    }
  });
  if (item.source)
    item.apps.unshift({
      name: "Source",
      icon: "code-tags",
      show_on_hover: true,
      url: item.source
    });
  if (item.download_url)
    item.apps.unshift({
      name: "Download",
      icon: "download",
      url: item.download_url,
      show_on_hover: true
    });
  if (item.git_repo)
    item.apps.unshift({
      name: "Git Repository",
      icon: "github-circle",
      url: item.git_repo,
      show_on_hover: true
    });

  item.badges = item.badges || [];
  if (item.weights) {
    item.badges.unshift({
      label: "weights",
      label_type: "is-dark",
      ext: Object.keys(item.weights).length,
      ext_type: "is-primary",
      run() {
        self.showResourceItemInfo(item, "weights");
      }
    });
  }
  if (item.files) {
    item.badges.unshift({
      label: "files",
      ext: Object.keys(item.files).length,
      ext_type: "is-primary",
      run() {
        self.showResourceItemInfo(item, "files");
      }
    });
  }
  if (item.license) {
    item.badges.unshift({
      label: "license",
      ext: item.license,
      ext_type: "is-info"
    });
  }
  if (item.type === "model" && item.co2) {
    item.badges.unshift({
      label: "CO2",
      ext: item.co2,
      ext_type: "is-success",
      run() {
        alert(
          `SAVE THE EARTH: The carbon footprint for training this model is around ${item.co2} lbs, reusing existing models can help save the earth from climate change.`
        );
      }
    });
  }
}

export default {
  name: "Home",
  components: {
    "resource-item-list": ResourceItemList,
    "resource-item-selector": ResourceItemSelector,
    "resource-item-info": ResourceItemInfo,
    about: About
  },
  data() {
    return {
      searchTags: null,
      isTouchDevice: isTouchDevice,
      siteConfig: siteConfig,
      resourceItems: null,
      selectedItems: null,
      showMenu: false,
      applications: [],
      allApps: {},
      dialogWindowConfig: {
        width: "800px",
        height: "670px",
        draggable: true,
        fullscreen: false
      },
      dialogWindows: [],
      selectedWindowsStack: [],
      selectedDialogWindow: null,
      selectedResourceItem: null,
      infoDialogFullscreen: false,
      screenWidth: 1000,
      showInfoDialogMode: null,
      infoDialogTitle: "",
      currentList: null,
      displayMode: "card",
      currentTags: []
    };
  },
  created: async function() {
    try {
      let repo = siteConfig.model_repo;
      const query_repo = this.$route.query.repo;
      let manifest_url = this.siteConfig.manifest_url;
      if (query_repo) {
        if (query_repo.startsWith("http") || query_repo.startsWith("/")) {
          manifest_url = query_repo;
        } else if (query_repo.split("/").length === 2) {
          manifest_url = `https://raw.githubusercontent.com/${query_repo}/master/manifest.bioimage.io.json`;
        } else if (query_repo.split("/").length === 3) {
          manifest_url = `https://raw.githubusercontent.com/${query_repo}/manifest.bioimage.io.json`;
        } else {
          alert("Unsupported repo format.");
          throw "Unsupported repo format.";
        }

        repo = query_repo;
      }

      const response = await fetch(manifest_url + "?" + randId());
      const repo_manifest = JSON.parse(await response.text());
      const resourceItems = repo_manifest.resources;
      for (let item of resourceItems) {
        item.repo = repo;
        normalizeItem(this, item);
        if (!item.source.startsWith("http"))
          item.source = concatAndResolveUrl(item.root_url, item.source);
      }
      this.resourceItems = resourceItems;
      const tp = this.currentList && this.currentList.type;
      this.selectedItems = tp
        ? resourceItems.filter(m => m.type === tp)
        : resourceItems;

      this.updateViewByUrlQuery();
      this.$forceUpdate();
      console.log("Loading ImJoy...");
      const workspace = this.$route.query.workspace || this.$route.query.w;
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

        imjoy.event_bus.on("close_window", w => {
          this.closeDialogWindow(w);
        });
        const applications = resourceItems.filter(
          m => m.type === "application"
        );
        this.showMessage("Loading applications...");
        loadPlugins(imjoy, applications).then(allApps => {
          this.showMessage(
            `Successfully loaded ${Object.keys(allApps).length} applications.`
          );
          this.allApps = allApps;
          for (let item of resourceItems) {
            // make a shallow copy or create an empty array
            const apps = (item.apps && item.apps.slice()) || [];
            if (item.type === "application") {
              const app = this.allApps[item.name];
              apps.unshift({
                name: "Run",
                icon: "play",
                run() {
                  runManyModels(app, item);
                }
              });
            } else if (item.applications) {
              for (let app_key of item.applications) {
                if (this.allApps[app_key]) {
                  const app = this.allApps[app_key];
                  apps.unshift({
                    name: app.name,
                    icon: app.config.icon,
                    run() {
                      runOneModel(app, item);
                    }
                  });
                }
              }
            }
            // This is to make sure the app icons get updated
            Vue.set(item, "apps", apps);
          }
        });
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
      if (this.resourceItems) {
        const tp = this.currentList && this.currentList.type;
        const items = tp
          ? this.resourceItems.filter(m => m.type === tp)
          : this.resourceItems;
        for (let item of items) {
          item.allLabels.forEach(label => {
            if (fullLabelList.indexOf(label) === -1) {
              fullLabelList.push(label.toLowerCase());
            }
          });
        }
      }
      fullLabelList.sort((a, b) =>
        a.toLowerCase() < b.toLowerCase() ? -1 : 1
      );
      return Array.from(new Set(fullLabelList));
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
    updateQueryTags(newTags) {
      if (newTags) {
        if (newTags.length > 0) {
          this.currentTags = newTags;
        } else {
          this.currentTags = null;
        }
      }

      const query = Object.assign({}, this.$route.query);
      if (this.currentList) {
        // remove the default type in the query if that's the only query
        if (
          this.currentList.type === "model" &&
          query.type &&
          Object.keys(query).length <= 1
        )
          delete query.type;
        else {
          query.type = this.currentList.type;
        }
      } else {
        query.type = "all";
      }

      if (this.currentTags) {
        query.tags = this.currentTags.join(",");
      } else {
        delete query.tags;
      }
      this.$router.replace({ query: query }).catch(() => {});
    },
    displayModeChanged(mode) {
      this.displayMode = mode;
    },
    addWindow(w) {
      if (this.selectedDialogWindow) {
        this.selectedWindowsStack.push(this.selectedDialogWindow);
      }
      this.selectWindow(w);
      this.dialogWindows.push(w);
      if (this.screenWidth < 700) this.dialogWindowConfig.fullscreen = true;
      this.$modal.show("window-modal-dialog");
      this.$forceUpdate();
    },
    selectWindow(w) {
      if (w.closing) return;
      this.selectedDialogWindow = w;
    },
    updateSize() {
      debounce(() => {
        this.screenWidth = window.innerWidth;
        if (this.screenWidth < 700) this.infoDialogFullscreen = true;
        this.$forceUpdate();
      }, 250)();
    },
    showAboutDialog() {
      this.showInfoDialogMode = "about";
      this.infoDialogTitle = "About";
      if (this.screenWidth < 700) this.infoDialogFullscreen = true;
      this.$modal.show("info-dialog");
    },
    showSubscribeDialog() {
      this.showInfoDialogMode = "subscribe";
      this.infoDialogTitle = "Subscribe to News and Updates";
      if (this.screenWidth < 700) this.infoDialogFullscreen = true;
      this.$modal.show("info-dialog");
    },
    showResourceItemInfo(mInfo, focus) {
      this.showInfoDialogMode = "model";
      mInfo._focus = focus;
      this.selectedResourceItem = mInfo;
      this.infoDialogTitle = this.selectedResourceItem.name;
      if (this.screenWidth < 700) this.infoDialogFullscreen = true;
      this.$modal.show("info-dialog");
      if (mInfo.id) {
        const query = Object.assign({}, this.$route.query);
        query.id = mInfo.id;
        this.$router.replace({ query: query }).catch(() => {});
      }
    },
    updateStatus(status) {
      if (status.loading === true) this.showMessage("Loading...");
      if (status.loading === false) this.showMessage("Loading done.");
    },
    closeInfoWindow() {
      this.selectedResourceItem = null;

      this.$modal.hide("info-dialog");
      const query = Object.assign({}, this.$route.query);
      delete query.id;
      this.$router.replace({ query: query }).catch(() => {});
    },
    maximizeInfoWindow() {
      this.infoDialogFullscreen = !this.infoDialogFullscreen;
    },
    closeDialogWindow(w) {
      if (this.selectedDialogWindow.id !== w.id) {
        console.warn("ignore close window: " + w.id);
        return;
      }
      const idx = this.dialogWindows.indexOf(w);
      if (idx >= 0) this.dialogWindows.splice(idx, 1);
      this.selectedDialogWindow = this.selectedWindowsStack.pop();
      if (!this.selectedDialogWindow) this.$modal.hide("window-modal-dialog");
    },
    minimizeDialogWindow() {
      this.$modal.hide("window-modal-dialog");
    },
    maximizeDialogWindow() {
      this.dialogWindowConfig.fullscreen = !this.dialogWindowConfig.fullscreen;
    },
    enter() {
      const top =
        window.pageYOffset +
        this.$refs.search_anchor.getBoundingClientRect().top;
      window.scrollTo({ top: top - 100, behavior: "smooth", block: "start" });
    },
    updateResourceItemList(models) {
      if (models.length <= 0) {
        this.showMessage("No item found.");
      }
      this.selectedItems = models;
    },
    updateViewByUrlQuery() {
      let hasQuery = false;
      if (this.$route.query.id) {
        const m = this.resourceItems.filter(
          item => item.id === this.$route.query.id
        )[0];
        if (m) {
          this.showResourceItemInfo(m);
          hasQuery = true;
        }
      }
      if (this.$route.query.tags) {
        if (typeof this.$route.query.tags === "string")
          this.searchTags = this.$route.query.tags.split(",");
        else this.searchTags = this.$route.query.tags;
        hasQuery = true;
      }

      if (this.$route.query.type) {
        if (this.$route.query.type === "all") this.currentList = null;
        else
          this.currentList = this.siteConfig.item_lists.filter(
            item => item.type === this.$route.query.type
          )[0];

        hasQuery = true;
      }
      if (hasQuery) {
        this.enter();
      }
    },
    showMessage(message, duration) {
      duration = duration || 5000;
      const data = {
        message: message.slice(0, 200),
        onAction: function() {},
        actionText: "Close",
        duration: duration,
        queue: false
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

    share(item) {
      prompt(
        "Please copy and paste following URL for sharing:",
        "https://bioimage.io?name=" + encodeURI(item.name)
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

.resource-item-card:hover {
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
  width: 34px !important;
  min-width: 34px !important;
  max-width: 34px !important;
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
  width: 110px;
  display: inline-block;
  margin: 10px;
  text-align: center;
  cursor: pointer;
  font-size: 1.1em;
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
.background-img {
  position: absolute;
  bottom: 0px;
  right: 0px;
  opacity: 0.9;
  width: 60%;
  transition: 0.9s ease;
  max-height: 50%;
  max-width: 100%;
  object-fit: contain;
}
.hero:hover .background-img {
  width: 65%;
  transition: 0.4s ease;
}
.feature-list {
  font-size: 1.5em;
}
.explore-btn {
  font-size: 1.3rem;
}
.site-title {
  font-size: 2.4em;
  padding-top: 10px;
  padding-left: 4px;
}
.site-icon {
  font-size: 3em;
  margin-left: 10px;
}
.dialog-title {
  font-size: 1.4rem;
}
@media screen and (max-width: 768px) {
  .dialog-title {
    font-size: 1.1rem;
  }
  .site-title {
    font-size: 2em !important;
  }
  .site-icon {
    font-size: 2.3em;
  }
  .title {
    font-size: 2rem !important;
  }
  .subtitle {
    font-size: 1.6rem !important;
  }
  .feature-list {
    font-size: 1em !important;
  }
  .explore-btn {
    font-size: 1.1rem !important;
  }
}

.hover-show {
  opacity: 0;
  transition: 0.3s ease;
}

.card:hover .hover-show {
  opacity: 1;
  transition: 0.3s ease;
}

html,
body {
  overflow-x: hidden;
}
</style>

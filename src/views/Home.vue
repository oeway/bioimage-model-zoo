<template>
  <div class="home">
    <!-- Header -->
    <section
      class="hero is-link is-fullheight is-fullheight-with-navbar"
      style="max-height: 1024px!important;height:100%;min-height:640px;"
    >
      <div class="hero-body" style="position: relative;">
        <img
          class="background-img"
          v-if="selectedPartner"
          :src="selectedPartner.background_image"
        />
        <img class="background-img" v-else :src="siteConfig.background_image" />
        <partners-component
          v-if="partners"
          style="position: absolute;bottom: 0px;"
          :partners="partners"
          @switchPartner="switchPartner"
        ></partners-component>

        <div
          class="container"
          style="margin-bottom: 100px;"
          v-if="selectedPartner"
        >
          <h1 class="title is-1">
            {{ selectedPartner.splash_title }}
          </h1>
          <h2 class="subtitle is-3">
            {{ selectedPartner.splash_subtitle }}
          </h2>
          <ul class="feature-list" v-if="selectedPartner.splash_feature_list">
            <li
              v-for="feature in selectedPartner.splash_feature_list"
              :key="feature"
            >
              {{ feature }}
            </li>
          </ul>
          <br />
          <b-button
            v-if="selectedPartner.about_url"
            rounded
            style="text-transform:none;"
            @click="showAboutPartner(selectedPartner)"
          >
            <span class="explore-btn">About</span></b-button
          >
          &nbsp;
          <b-button rounded style="text-transform:none;" @click="enter">
            <span class="explore-btn">{{
              selectedPartner.explore_button_text
            }}</span></b-button
          >
        </div>

        <div class="container" style="margin-bottom: 100px;" v-else>
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
              {{ feature }}
            </li>
          </ul>
          <br />
          <b-button rounded style="text-transform:none;" @click="enter">
            <span class="explore-btn">{{
              siteConfig.explore_button_text
            }}</span></b-button
          >
        </div>
      </div>
    </section>

    <span ref="search_anchor"></span>
    <br />
    <section style="margin-top: -30px;opacity: 0.6;">
      <b-progress :value="progress"></b-progress>
    </section>
    <br />
    <div
      class="container"
      v-if="resourceCategories.length > 1"
      style="text-align:center;"
    >
      <b-tooltip label="List all items" position="is-bottom">
        <div
          class="item-lists is-link"
          style="width:30px; margin-left: -16px;border-bottom-color: gray;"
          @click="
            selectedCategory = null;
            updateQueryTags();
          "
          :class="{ active: !selectedCategory }"
        >
          All
        </div>
      </b-tooltip>
      <b-tooltip
        v-for="list in resourceCategories"
        :key="list.name"
        :label="list.description"
        position="is-bottom"
      >
        <div
          class="item-lists is-link"
          @click="
            selectedCategory = list;
            updateQueryTags();
          "
          :style="{ 'border-bottom-color': list.outline_color }"
          :class="{ active: selectedCategory === list }"
        >
          {{ list.name }}
        </div>
      </b-tooltip>
    </div>
    <resource-item-selector
      @selection-changed="updateResourceItemList"
      :allItems="resourceItems"
      :fullLabelList="fullLabelList"
      :tagCategories="tagCategories"
      :type="selectedCategory && selectedCategory.type"
      :showDisplayMode="screenWidth > 700"
      @display-mode-change="displayModeChanged"
      :searchTags="searchTags"
      @tags-updated="updateQueryTags"
      @input-change="removePartner"
    ></resource-item-selector>
    <br />
    <resource-item-list
      @show-resource-item-info="showResourceItemInfo"
      @select-tag="searchTags = [$event]"
      v-if="selectedItems"
      :allItems="selectedItems"
      :displayMode="screenWidth > 700 ? displayMode : 'card'"
      :bioEngineReady="bioEngineReady"
    />
    <br />

    <footer class="footer">
      <div class="columns is-mobile is-centered" v-if="siteConfig.footer">
        <div
          v-for="item in siteConfig.footer"
          :key="item.label"
          class="column is-one-quarter"
          style="text-align: center; width: 16%;"
        >
          <b-tooltip :label="item.tooltip" position="is-top"
            ><a :href="item.url" target="_blank">
              <figure>
                <img :src="item.logo" style="max-height: 55px;" />
                <figcaption class="hide-on-small-screen">
                  {{ item.label }}
                </figcaption>
              </figure>
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
      style="max-width: 100%; max-height:100%;z-index: 9999;"
      draggable=".drag-handle"
      :scrollable="true"
    >
      <div
        v-if="selectedDialogWindow"
        @dblclick="maximizeDialogWindow()"
        :class="{ 'drag-handle': !isTouchDevice }"
        class="dialog-header"
      >
        <div style="position: absolute; left:2px; margin-top: -1px;">
          <button
            @click="closeDialogWindow(selectedDialogWindow)"
            class="noselect dialog-control-button"
            style="background:#ff0000c4;"
          >
            x
          </button>
          <button
            v-if="screenWidth > 700"
            @click="minimizeDialogWindow()"
            class="noselect dialog-control-button"
            style="background:#00cdff61;"
          >
            -
          </button>
          <button
            v-if="screenWidth > 700"
            @click="maximizeDialogWindow()"
            class="noselect dialog-control-button"
            style="background:#00cdff61;"
          >
            {{ dialogWindowConfig.fullscreen ? "=" : "+" }}
          </button>
        </div>
        <span class="noselect dialog-title">
          {{ selectedDialogWindow.name }}</span
        >

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
          <div
            :id="wdialog.window_id"
            class="noselect"
            style="width: 100%;height: 100%;"
          ></div>
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
        <div style="position: absolute; left:2px; margin-top: -1px;">
          <button
            @click="closeInfoWindow()"
            class="noselect dialog-control-button"
            style="background:#ff0000c4;"
          >
            x
          </button>
          <button
            v-if="screenWidth > 700"
            @click="maximizeInfoWindow()"
            class="noselect dialog-control-button"
            style="background:#00cdff61;"
          >
            {{ infoDialogFullscreen ? "=" : "+" }}
          </button>
        </div>
        <span class="noselect dialog-title"> {{ infoDialogTitle }}</span>
      </div>
      <div class="markdown-container" v-if="showInfoDialogMode === 'markdown'">
        <markdown-component
          :content="infoMarkdownContent"
          :url="infoMarkdownUrl"
        ></markdown-component>
        <comment-box
          v-if="infoCommentBoxTitle"
          :title="infoCommentBoxTitle"
        ></comment-box>
      </div>
      <div
        class="markdown-container"
        v-else-if="showInfoDialogMode === 'attachments' && selectedResourceItem"
      >
        <attachments-component
          :attachments="selectedResourceItem.attachments"
          :focusTarget="selectedResourceItem._focus"
        ></attachments-component>
      </div>
      <resource-item-info
        v-else-if="showInfoDialogMode === 'model' && selectedResourceItem"
        :resource-item="selectedResourceItem"
        :show-resource-item-info="showResourceItemInfo"
      ></resource-item-info>
    </modal>
  </div>
</template>

<script>
import yaml from "js-yaml";
import { mapState } from "vuex";
import spdxLicenseList from "spdx-license-list/full";
import ResourceItemSelector from "@/components/ResourceItemSelector.vue";
import ResourceItemList from "@/components/ResourceItemList.vue";
import ResourceItemInfo from "@/components/ResourceItemInfo.vue";
import AttachmentsComponent from "@/components/Attachments.vue";
import PartnersComponent from "@/components/Partners.vue";
import CommentBox from "@/components/CommentBox.vue";
import MarkdownComponent from "@/components/Markdown.vue";

const DEFAULT_ICONS = {
  notebook: "notebook-outline",
  dataset: "database",
  application: "puzzle",
  model: "hubspot"
};
import { setupDevMenu, runAppForItem, runAppForAllItems } from "../bioEngine";
import { concatAndResolveUrl, debounce } from "../utils";

function titleCase(str) {
  return str.replace(/_/g, " ").replace(/(^|\s)\S/g, function(t) {
    return t.toUpperCase();
  });
}
const isTouchDevice = (function() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
})();

function normalizeItem(self, item, bioEngineConfigs) {
  item = Object.assign({}, item); // make a copy
  item.covers = item.covers || [];
  item.authors = item.authors || [];
  item.description = item.description || "";
  if (item.covers && !Array.isArray(item.covers)) {
    item.covers = [item.covers];
  }
  if (item.icon === "extension") item.icon = "puzzle";
  if (item.type === "dataset") {
    if (!item.download_url && item.source) item.download_url = item.source;
  }

  item.covers = item.covers.map(cover => {
    if (!cover.startsWith("http") && item.root_url) {
      return encodeURI(concatAndResolveUrl(item.root_url, cover));
    } else {
      if (cover.includes(" ")) {
        return encodeURI(cover);
      } else return cover;
    }
  });
  // if no cover image added, use the icon image
  if (item.covers.length <= 0 && item?.icon?.startsWith("http")) {
    item.covers.push(item.icon);
  }

  item.allLabels = item.labels || [];
  if (item.license) {
    item.allLabels.push(item.license);
  }
  item.allLabels.push(item.id);
  if (item.applications) {
    item.allLabels = item.allLabels.concat(item.applications);
  }
  // add nickname for search
  if (item.nickname) {
    item.allLabels.push(item.nickname);
  }
  if (item.tags) {
    item.tags = item.tags.filter(tag => {
      return (
        typeof tag === "string" && !self.siteConfig.excluded_tags.includes(tag)
      );
    });
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

  if (item.owners) {
    if (item.owners.includes(self.userId)) {
      item.apps.unshift({
        name: "Edit",
        icon: "pencil",
        show_on_hover: true,
        run() {
          self.$router.push({
            name: "Update",
            params: { updateDepositId: item.id }
          });
        }
      });
    }
  }
  item.apps.unshift({
    name: "Share",
    icon: "share-variant",
    show_on_hover: true,
    run() {
      const query = Object.assign({}, self.$route.query);
      query.id = item.id;
      self.$router.replace({ query: query }).catch(() => {});
      self.$buefy.dialog.alert({
        title: "Sharing " + item.type,
        hasIcon: true,
        icon: "share",
        message: `Here is the URL for sharing ${item.name}: <br> <code>${window.location.href}</code>`,
        confirmText: "OK"
      });
    }
  });

  if (item.config && item.rdf_source)
    item.apps.unshift({
      name: "Source",
      icon: "code-tags",
      show_on_hover: true,
      run() {
        self.showSource(item);
      }
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
      icon: "github",
      url: item.git_repo,
      show_on_hover: true
    });

  if (item.type === "application") {
    if (self.allApps[item.id]) {
      item.apps.unshift({
        name: "Run",
        icon: "play",
        run() {
          runAppForAllItems(self, self.allApps[item.id], self.resourceItems);
        }
      });
    } else if (
      item.tags.includes("colab") &&
      item.source &&
      item.source.endsWith(".ipynb")
    ) {
      // convert github raw url to colab url
      item.config = item.config || {};

      if (
        item.source &&
        item.source.startsWith("https://raw.githubusercontent.com/")
      ) {
        const b = item.source.split("/");
        item.config._colab_url = `https://colab.research.google.com/github/${
          b[3]
        }/${b[4]}/blob/${b[5]}/${b.slice(6).join("/")}`;
        item.apps.unshift({
          name: "Run",
          icon: "play",
          run() {
            window.open(item.config._colab_url);
          }
        });
      } else {
        console.warn(
          "Invalid colab source URL: " +
            item.source +
            " (the URL must be a raw github URL starts with https://raw.githubusercontent.com/)"
        );
      }
    }
  }

  item.links = item.links || [];
  if (item.id in bioEngineConfigs) {
    item.links.push("imjoy/imjoy");
  }
  if (item.training_data && !item.links.includes(item.training_data.id)) {
    item.links.push(item.training_data.id);
  }
  for (let link_key of item.links) {
    // skip default links
    if (
      ["imjoy/bioimageio-packager", "imjoy/genericbioengineapp"].includes(
        link_key
      )
    )
      continue;
    const linked = self.resourceItems.filter(
      item => item.id.toLowerCase() === link_key.toLowerCase()
    );

    for (let lit of linked) {
      item.apps.unshift({
        name: lit.name,
        icon: lit.icon || DEFAULT_ICONS[lit.type],
        isLinkedApp: self.allApps[link_key],
        async run() {
          if (self.allApps[link_key]) {
            await self.updateFullRDF(item);
            await runAppForItem(self, self.allApps[link_key], item);
          } else self.showResourceItemInfo(lit);
        }
      });
    }
  }

  item.badges = item.badges || [];
  item.attachments = item.attachments || {};
  const linkedItems = self.resourceItems.filter(
    m => m.links && m.links.includes(item.id)
  );
  for (let it of linkedItems) {
    if (item.attachments[it.type]) item.attachments[it.type].push(it);
    else item.attachments[it.type] = [it];
  }

  for (let att_name of Object.keys(item.attachments)) {
    if (Array.isArray(item.attachments[att_name]) && att_name !== "files") {
      item.badges.unshift({
        label: att_name,
        label_type: "is-dark",
        ext: item.attachments[att_name].length,
        ext_type: "is-primary",
        run() {
          self.showAttachmentsDialog(item, att_name);
        }
      });
    }
  }

  if (item.type === "model") {
    if (!item.links.includes("imjoy/bioimageio-packager"))
      item.links.push("imjoy/bioimageio-packager");
    item.apps.unshift({
      name: "Download",
      icon: "download",
      async run() {
        await self.updateFullRDF(item);
        await runAppForItem(
          self,
          self.allApps["imjoy/bioimageio-packager"],
          item
        );
      }
    });
  }

  if (item.type === "model" && item.id.startsWith("10.5281/zenodo.")) {
    if (bioEngineConfigs[item.id]) {
      if (!item.links.includes("imjoy/genericbioengineapp"))
        item.links.push("imjoy/genericbioengineapp");
    }
  }

  if (item.license) {
    item.badges.unshift({
      label: "license",
      ext: item.license,
      ext_type: "is-info",
      url: spdxLicenseList[item.license] && spdxLicenseList[item.license].url
    });
  }

  if (item.download_count)
    item.badges.unshift({
      label: "downloads",
      label_type: "is-dark",
      ext: item.download_count
    });

  if (item.config && item.config._conceptdoi) {
    item.badges.unshift({
      label: item.config._conceptdoi,
      label_type: "is-dark",
      label_short: self.zenodoClient.isSandbox ? "Zenodo" : "DOI",
      url: self.zenodoClient.isSandbox
        ? `${item.config._deposit.links.html}`
        : `https://doi.org/${item.config._conceptdoi}`
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
  if (item.error) {
    if (item.error.spec) {
      item.badges.unshift({
        label: "spec",
        label_type: "is-dark",
        ext: "failing",
        ext_type: "is-danger",
        run() {
          alert(
            "This model failed the specification checks, here are the errors: \n" +
              JSON.stringify(item.error.spec, null, "  ")
          );
        }
      });
    } else {
      item.badges.unshift({
        label: "spec",
        label_type: "is-dark",
        ext: "passing",
        ext_type: "is-success",
        run() {
          alert("🎉 This model passed the specification checks!");
        }
      });
    }
  }
  return item;
}

export default {
  name: "Home",
  props: ["resourceId"],
  components: {
    "resource-item-list": ResourceItemList,
    "resource-item-selector": ResourceItemSelector,
    "resource-item-info": ResourceItemInfo,
    "comment-box": CommentBox,
    "attachments-component": AttachmentsComponent,
    "markdown-component": MarkdownComponent,
    "partners-component": PartnersComponent
  },
  data() {
    return {
      initialized: false,
      progress: 100,
      searchTags: null,
      isTouchDevice: isTouchDevice,
      selectedItems: null,
      showMenu: false,
      applications: [],
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
      infoMarkdownUrl: null,
      infoMarkdownContent: null,
      infoCommentBoxTitle: null,
      selectedCategory: null,
      displayMode: "card",
      currentTags: [],
      selectedPartner: null,
      bioEngineConfigs: {}
    };
  },
  mounted: async function() {
    this.resourceId = this.resourceId && this.resourceId.toLowerCase();
    window.addEventListener("resize", this.updateSize);
    window.dispatchEvent(new Event("resize"));
    setupDevMenu(this.updateDevMenu);
    // select models as default
    for (let list of this.resourceCategories) {
      if (list.type === "model") {
        this.selectedCategory = list;
        break;
      }
    }

    try {
      // Fix the github oauth redirection
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.forEach((value, key) => {
        this.$route.query[key] = value;
      });
      const originalUrl =
        window.location.pathname + "#" + window.location.hash.substr(1);
      window.history.replaceState(null, "", originalUrl);

      let repo = this.siteConfig.rdf_root_repo;
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

      const self = this;
      const response = await fetch(
        "https://raw.githubusercontent.com/bioimage-io/bioengine-model-runner/gh-pages/manifest.bioengine.json"
      );
      const bioEngineManifest = await response.json();
      self.bioEngineConfigs = {};
      for (let conf of bioEngineManifest.collection)
        if (conf.id) self.bioEngineConfigs[conf.id] = conf;
      await this.$store.dispatch("fetchResourceItems", {
        repo,
        manifest_url,
        transform(item) {
          return normalizeItem(self, item, self.bioEngineConfigs);
        }
      });

      const tp = this.selectedCategory && this.selectedCategory.type;
      this.selectedItems = tp
        ? this.resourceItems.filter(m => m.type === tp)
        : this.resourceItems;

      // get id from component props
      if (this.resourceId) {
        if (this.resourceId.startsWith("zenodo:")) {
          const zenodoId = parseInt(this.resourceId.split(":")[1]);
          const matchedItem = this.resourceItems.filter(
            item =>
              item.config &&
              item.config._deposit &&
              (item.config._deposit.id === zenodoId ||
                item.config._deposit.conceptrecid === zenodoId)
          )[0];
          if (matchedItem) this.$route.query.id = matchedItem.id;
          else {
            alert(
              "Oops, resource item not found: " +
                this.resourceId +
                ". Possibly because it has not been approved yet."
            );
          }
        } else this.$route.query.id = this.resourceId;
      }

      this.updateViewByUrlQuery();
      this.$forceUpdate();
    } catch (e) {
      console.error(e);
      alert(`Oops, failed to fetch manifest data. Details: ${e}.`);
    }
  },
  computed: {
    userId() {
      return this.zenodoClient && this.zenodoClient.getUserId();
    },
    partners: function() {
      return (
        this.siteConfig.partners &&
        this.siteConfig.partners.concat([
          {
            isJoinButton: true,
            name: "Join Community Partners",
            icon: "/static/img/plus-sign.png"
          }
        ])
      );
    },
    resourceCategories: function() {
      if (this.selectedPartner)
        return this.siteConfig.resource_categories.filter(list =>
          this.selectedPartner.resource_types.includes(list.type)
        );
      else return this.siteConfig.resource_categories;
    },
    fullLabelList: function() {
      const fullLabelList = [];
      if (this.resourceItems) {
        const tp = this.selectedCategory && this.selectedCategory.type;
        const items = tp
          ? this.resourceItems.filter(m => m.type === tp)
          : this.resourceItems;
        for (let item of items) {
          // TODO: why item.allLabels can be empty sometimes?
          if (item.allLabels)
            item.allLabels.forEach(label => {
              if (fullLabelList.indexOf(label) === -1) {
                fullLabelList.push(label.toLowerCase());
              }
            });
        }
      }
      fullLabelList.sort((a, b) => (a < b ? -1 : 1));
      return Array.from(new Set(fullLabelList));
    },
    tagCategories: function() {
      if (this.selectedCategory) {
        return this.selectedCategory && this.selectedCategory.tag_categories;
      } else {
        let combined = {};
        for (let list of this.resourceCategories) {
          combined = Object.assign(combined, list.tag_categories);
        }
        return combined;
      }
    },
    ...mapState({
      allApps: state => state.allApps,
      zenodoClient: state => state.zenodoClient,
      siteConfig: state => state.siteConfig,
      resourceItems: state => state.resourceItems,
      bioEngineReady: state => state.bioEngineReady
    })
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateSize);
  },
  methods: {
    async updateDevMenu(action, plugin) {
      if (action === "add") await this.$store.dispatch("addDevPlugin", plugin);
      else await this.$store.dispatch("removeDevPlugin", plugin);
    },
    goHome() {
      this.selectedPartner = null;
      this.searchTags = [];
      const query = Object.assign({}, this.$route.query);
      delete query.partner;
      delete query.tags;
      this.$router.push({ query: query }).catch(() => {});
    },
    switchPartner(partner) {
      if (partner.isJoinButton) {
        this.showJoinDialog();
        return;
      }
      this.selectedPartner = partner;
      this.selectedCategory = null; // select all
      if (this.selectedPartner.default_type) {
        for (let list of this.resourceCategories) {
          if (list.type === this.selectedPartner.default_type) {
            this.selectedCategory = list;
            break;
          }
        }
      }
      this.$nextTick(() => {
        this.searchTags = this.selectedPartner && this.selectedPartner.tags;
      });
      const query = Object.assign({}, this.$route.query);
      query.partner = partner.id;
      query.tags = partner.tags;
      if (this.initialized)
        this.$router.replace({ query: query }).catch(() => {});
    },
    showJoinDialog() {
      this.infoDialogTitle = `Join ${this.siteConfig.site_name} as a community partner`;
      this.infoCommentBoxTitle = this.infoDialogTitle;
      this.infoMarkdownUrl = this.siteConfig.join_partners_url;
      this.showInfoDialogMode = "markdown";
      if (this.screenWidth < 700) this.infoDialogFullscreen = true;
      this.$modal.show("info-dialog");
    },
    async updateFullRDF(item) {
      if (item.rdf_source) {
        const response = await fetch(item.rdf_source);
        if (response.ok) {
          const yamlStr = await response.text();
          const newRDF = yaml.load(yamlStr);
          if (!newRDF.source) {
            newRDF.source = newRDF.rdf_source || item.rdf_source;
          }
          for (let k of Object.keys(newRDF)) {
            if (k !== "rdf_source" && k !== "id") item[k] = newRDF[k];
          }
          delete item.badges;
          Object.assign(item, normalizeItem(this, item, this.bioEngineConfigs));

          item.links = item.links || [];
          // add training data
          if (item.training_data) {
            if (!item.links.includes(item.training_data.id)) {
              item.links.push(item.training_data.id);
            }

            item.training_data_item = this.resourceItems.filter(
              m => m.id === item.training_data.id
            )[0];
            if (!item.training_data_item) {
              console.error(
                `Training data not found: ${item.training_data.id}`
              );
            }
          }
        } else {
          throw new Error(`Oops, failed to fetch RDF file.`);
        }
      }
    },
    async showStatsDialog(item) {
      this.infoDialogTitle = "Statistics for " + item.name;
      this.showInfoDialogMode = "markdown";
      await this.updateFullRDF(item);
      this.infoCommentBoxTitle = null;
      if (!item.stats) this.infoMarkdownContent = `No stats info available.`;
      else {
        let statsText = "";
        for (let k of Object.keys(item.stats)) {
          statsText += `\n * ${titleCase(k)}: ${item.stats[k]}`;
        }
        this.infoMarkdownContent = `# Statistics for ${item.name}` + statsText;
        this.infoMarkdownContent +=
          "\n\n[More info on how stats are collected](https://help.zenodo.org/#statistics)";
      }

      if (this.screenWidth < 700) this.infoDialogFullscreen = true;
      this.$modal.show("info-dialog");
    },
    async showAttachmentsDialog(item, focus) {
      await this.updateFullRDF(item);
      this.infoDialogTitle = focus
        ? item.name + ": " + focus
        : item.name + ": Attachments";
      item._focus = focus;
      this.selectedResourceItem = item;
      this.showInfoDialogMode = "attachments";
      if (this.screenWidth < 700) this.infoDialogFullscreen = true;
      this.$modal.show("info-dialog");
    },
    removePartner() {
      if (this.selectedPartner) {
        this.selectedPartner = null;
        this.updateQueryTags(this.searchTags);
      }
    },
    updateQueryTags(newTags) {
      if (!this.initialized) {
        return;
      }
      this.searchTags = newTags;
      if (newTags) {
        if (newTags.length > 0) {
          this.currentTags = newTags;
        } else {
          this.currentTags = null;
        }
      }

      const query = Object.assign({}, this.$route.query);
      if (this.selectedCategory) {
        // remove the default type in the query if that's the only query
        if (
          this.selectedCategory.type === "model" &&
          Object.keys(query).length <= 1
        )
          delete query.type;
        else {
          query.type = this.selectedCategory.type;
        }
      } else {
        query.type = "all";
      }

      if (this.currentTags) {
        query.tags = this.currentTags.join(",");
      } else {
        delete query.tags;
      }

      if (!this.selectedPartner) {
        delete query.partner;
      } else {
        // if no additional tags added, then hide the query from url
        if (
          this.selectedPartner.tags &&
          JSON.stringify(this.selectedPartner.tags) ==
            JSON.stringify(this.currentTags)
        ) {
          delete query.tags;
        }
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

    showLoader(enable) {
      if (enable)
        this.loadingComponent = this.$buefy.loading.open({ canCancel: true });
      else {
        if (this.loadingComponent) {
          this.loadingComponent.close();
          this.loadingComponent = null;
        }
      }
    },
    showAboutPartner(partner) {
      if (partner.about_url.startsWith("http")) {
        if (partner.about_url.endsWith(".md")) {
          this.infoDialogTitle = "About " + partner.name;
          this.infoMarkdownUrl = partner.about_url;
          this.showInfoDialogMode = "markdown";
          if (this.screenWidth < 700) this.infoDialogFullscreen = true;
          this.$modal.show("info-dialog");
        } else window.open(partner.about_url);
      } else if (partner.description) {
        this.$buefy.dialog.alert({
          title: "About " + partner.name,
          message: partner.description,
          confirmText: "OK"
        });
      } else {
        this.$buefy.dialog.alert({
          title: "Oops, no details about " + partner.name,
          message: "This partner is did not provide any details!",
          confirmText: "OK"
        });
      }
    },
    showSource(item) {
      if (
        item.rdf_source.endsWith(".yaml") ||
        item.rdf_source.endsWith(".yml")
      ) {
        this.infoDialogTitle = "Source: " + item.name;
        this.infoMarkdownUrl = item.rdf_source;
        this.infoCommentBoxTitle = item.name;
        this.showInfoDialogMode = "markdown";
        if (this.screenWidth < 700) this.infoDialogFullscreen = true;
        this.$modal.show("info-dialog");
      } else if (item.rdf_source.startsWith("http")) {
        window.open(item.rdf_source);
      } else {
        this.$buefy.dialog.alert({
          title: "Source: " + item.name,
          hasIcon: true,
          icon: "code-tags",
          message: item.rdf_source,
          confirmText: "OK"
        });
      }
    },
    async showResourceItemInfo(mInfo, focus) {
      this.showInfoDialogMode = "model";
      await this.updateFullRDF(mInfo);
      mInfo._focus = focus;
      this.selectedResourceItem = mInfo;
      this.infoDialogTitle = this.selectedResourceItem.name;
      if (this.screenWidth < 700) this.infoDialogFullscreen = true;
      this.$modal.show("info-dialog");
      if (mInfo.id && !window.location.href.includes("#/r/")) {
        const query = Object.assign({}, this.$route.query);
        query.id = mInfo.id;
        if (this.initialized)
          this.$router.replace({ query: query }).catch(() => {});
      }
    },
    updateStatus(status) {
      if (status.loading === true) this.showMessage("Loading...");
      if (status.loading === false) this.showMessage("Loading done.");
    },
    closeInfoWindow() {
      this.selectedResourceItem = null;
      this.showInfoDialogMode = null;
      this.infoMarkdownUrl = null;
      this.infoMarkdownContent = null;
      this.infoCommentBoxTitle = null;
      this.$modal.hide("info-dialog");
      const query = Object.assign({}, this.$route.query);
      delete query.id;
      delete query.show;
      if (this.initialized)
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
      this.$refs.search_anchor.scrollIntoView();
    },
    updateResourceItemList(models) {
      this.selectedItems = models;
    },
    updateViewByUrlQuery() {
      let hasQuery = false;
      if (this.$route.query.show) {
        if (this.$route.query.show === "about") {
          this.showAboutDialog();
        } else if (this.$route.query.show === "contribute") {
          this.showContributeDialog();
        } else if (this.$route.query.show === "join") {
          this.showJoinDialog();
        }
      }
      if (this.$route.query.id) {
        const m = this.resourceItems.filter(
          item => item.id === this.$route.query.id
        )[0];
        if (m) {
          this.showResourceItemInfo(m);
          hasQuery = true;
        } else {
          alert(
            "Oops, resource item not found: " +
              this.$route.query.id +
              ". Possibly because it has not been approved yet."
          );
        }
      } else if (this.$route.query.nickname) {
        const m = this.resourceItems.filter(
          item => item.nickname === this.$route.query.nickname
        )[0];
        if (m) {
          this.showResourceItemInfo(m);
          hasQuery = true;
        } else {
          alert("Oops, resource item not found: " + this.$route.query.nickname);
        }
      }
      if (this.$route.query.tags) {
        let tags = null;
        if (typeof this.$route.query.tags === "string")
          tags = this.$route.query.tags.split(",");
        else tags = this.$route.query.tags;
        setTimeout(() => {
          this.searchTags = tags;
        }, 0);

        hasQuery = true;
      }

      if (this.$route.query.type) {
        if (this.$route.query.type === "all") this.selectedCategory = null;
        else
          this.selectedCategory = this.resourceCategories.filter(
            item => item.type === this.$route.query.type
          )[0];

        hasQuery = true;
      }

      if (this.$route.query.partner) {
        if (this.siteConfig.partners) {
          this.selectedPartner = this.siteConfig.partners.filter(
            p => p.id === this.$route.query.partner
          )[0];
          if (this.selectedPartner) {
            this.$nextTick(() => {
              if (!this.searchTags) {
                this.searchTags = this.selectedPartner.tags;
              } else {
                this.searchTags = this.searchTags.concat(
                  this.selectedPartner.tags
                );
              }
            });

            hasQuery = false;
          }
        }
      }
      if (hasQuery) {
        this.enter();
      }
      this.initialized = true;
    },
    showProgress(p) {
      this.progress = p;
      this.$forceUpdate();
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
.pagination-list {
  list-style: none;
}
.pagination {
  width: 80%;
}
.modal-card-title {
  font-size: 1.1rem;
  line-height: 1;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  width: 100%;
}

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
  position: relative;
  color: white;
  top: 2px;
  font-family: "Lucida Console", Monaco, monospace;
}
.dialog-control-button:focus {
  outline: none;
}

.item-lists {
  padding-bottom: 2px;
  width: 110px;
  display: inline-block;
  margin: 10px;
  text-align: center;
  cursor: pointer;
  font-size: 1.2em;
  color: #4f5050;
  border-bottom: 2px solid;
  border-radius: 5px;
}

.item-lists:hover {
  font-weight: 500;
}

.item-lists.active {
  color: #2396f3;
  font-weight: 800;
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
  bottom: 142px;
  right: 0px;
  opacity: 0.8;
  width: 55%;
  transition: 0.9s ease;
  max-height: 30%;
  max-width: 100%;
  object-fit: contain;
}
.hero:hover .background-img {
  width: 45%;
  transition: 0.4s ease;
}
.feature-list {
  padding-left: 30px;
  font-size: 1.5em;
}
.explore-btn {
  font-size: 1.3rem;
}
.site-title {
  font-size: 2.2em;
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
@media screen and (max-width: 500px) {
  .feature-list {
    font-size: 1em;
  }
}

@media screen and (max-height: 700px) {
  .feature-list {
    display: none;
  }
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
    font-size: 1.8rem !important;
  }
  .subtitle {
    font-size: 1.5rem !important;
  }
  .feature-list {
    font-size: 1em !important;
  }
  .explore-btn {
    font-size: 1.1rem !important;
  }
  .hide-on-small-screen {
    display: none;
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

.markdown-container {
  padding: 20px;
  overflow: auto;
  overscroll-behavior: contain;
  height: calc(100% - 40px);
}

html,
body {
  overflow-x: hidden;
}

form {
  max-width: 100% !important;
}
</style>

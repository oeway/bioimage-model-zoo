import Vue from "vue";
import Vuex from "vuex";
import { randId } from "./utils";
import { ZenodoClient } from "./utils.js";
import siteConfig from "../site.config.json";

Vue.use(Vuex);

// set default values for table_view
siteConfig.table_view = siteConfig.table_view || {
  columns: ["name", "authors", "badges", "apps"]
};

let allTags = [];
for (let cat of siteConfig.resource_categories) {
  const tagCates = cat.tag_categories;
  if (tagCates)
    for (let cat in tagCates) {
      allTags = allTags.concat(tagCates[cat]);
    }
}
allTags = allTags.map(tag => tag.toLowerCase().replace(/ /g, "-"));

const zenodoBaseURL = siteConfig.zenodo_config.use_sandbox
  ? "https://sandbox.zenodo.org"
  : "https://zenodo.org";

const client_id = siteConfig.zenodo_config.use_sandbox
  ? siteConfig.zenodo_config.sandbox_client_id
  : siteConfig.zenodo_config.production_client_id;
export const store = new Vuex.Store({
  state: {
    loadedUrl: null,
    allApps: {},
    allTags: [...allTags],
    resourceItems: [],
    zenodoClient: siteConfig.zenodo_config.enabled
      ? new ZenodoClient(
          zenodoBaseURL,
          client_id,
          siteConfig.zenodo_config.use_sandbox
        )
      : null,
    zenodoBaseURL,
    siteConfig,
    showNavbar: true,
    devPlugins: []
  },
  actions: {
    async toggleNavbar(context, enable) {
      context.state.showNavbar = enable;
    },
    async login(context) {
      try {
        await context.state.client.login();
      } catch (e) {
        alert(`Failed to login: ${e}`);
      }
    },
    async addDevPlugin(context, plugin) {
      const plugins = context.state.devPlugins;
      let matched = false;
      for (let i = 0; i < plugins.length; i++) {
        if (plugins[i].name === plugin.name || plugins[i].id === plugin.id) {
          matched = i;
          break;
        }
      }
      if (matched !== false) {
        context.state.devPlugins.splice(matched, 1);
      }
      context.state.devPlugins.push(plugin);
    },
    async removeDevPlugin(context, plugin) {
      const plugins = context.state.devPlugins;
      let matched = false;
      for (let i = 0; i < plugins.length; i++) {
        if (plugins[i].name === plugin.name || plugins[i].id === plugin.id) {
          matched = i;
          break;
        }
      }
      if (matched !== false) {
        context.state.devPlugins.splice(matched, 1);
      }
    },
    async fetchResourceItems(context, { manifest_url, repo, transform }) {
      if (context.state.loadedUrl === manifest_url) {
        console.log("manifest already loaded");
        return;
      }
      // clear items
      context.state.resourceItems = [];
      context.state.allApps = {};
      context.state.allTags = [...allTags];
      const siteConfig = context.state.siteConfig;
      try {
        const items = await context.state.zenodoClient.getResourceItems({
          community: siteConfig.zenodo_config.community,
          size: 5000
        });
        context.state.totalItemCount = items.total;
        console.log("All items", items);
        items.map(item => context.commit("addResourceItem", item));
      } catch (e) {
        console.error(e);
        throw new Error(
          "It appears that we cannot reach to the Zenodo server (https://zenodo.org), please check whether you are connected to the internet, otherwise it might be because the Zenodo server is currently down."
        );
      }

      const response = await fetch(manifest_url + "?" + randId());
      const repo_manifest = JSON.parse(await response.text());
      if (repo_manifest.collections && siteConfig.partners) {
        for (let c of repo_manifest.collections) {
          const duplicates = siteConfig.partners.filter(p => p.id === c.id);
          duplicates.forEach(p => {
            siteConfig.partners.splice(siteConfig.partners.indexOf(p), 1);
          });
          siteConfig.partners.push(c);
        }
      }

      const resourceItems = repo_manifest.resources;
      const rawResourceItems = JSON.parse(JSON.stringify(resourceItems));
      for (let item of rawResourceItems) {
        item.repo = repo;
        // if (item.source && !item.source.startsWith("http"))
        //   item.source = concatAndResolveUrl(item.root_url, item.source);
        context.commit("addResourceItem", item);
      }
      context.commit("normalizeItems", transform);
      context.state.loadedUrl = manifest_url;
    }
  },
  mutations: {
    addResourceItem(state, item) {
      item.id = item.id || randId();
      item.id = item.id.toLowerCase();
      item.links = item.links || [];
      item.links = item.links.map(link => link.toLowerCase());
      item.authors = item.authors || [];
      item.authors = item.authors.map(author =>
        typeof author === "string" ? { name: author } : author
      );
      item.config = item.config || {};
      if (item.config._deposit) {
        const userId = state.zenodoClient && state.zenodoClient.getUserId();

        if (userId && item.config._deposit.owners.includes(userId)) {
          if (!item.tags.includes("editable")) item.tags.push("editable");
        }
      }
      item.config._rdf_file = item.config._rdf_file || item.source; // TODO: some resources current doesn't have a dedicated rdf_file
      if (item.type === "application" && item?.source?.endsWith(".imjoy.html"))
        state.allApps[item.id] = item;
      // index tags
      if (item.tags && item.tags.length > 0)
        item.tags = item.tags.map(tag => tag.toLowerCase().replace(/ /g, "-"));
      item.tags.map(tag => {
        if (!state.allTags.includes(tag)) {
          state.allTags.push(tag);
        }
      });
      state.resourceItems.push(item);
    },
    removeResourceItem(state, item) {
      if (item.type === "application") delete state.allApps[item.id];
      const index = state.resourceItems.indexOf(item);
      if (index >= 0) state.resourceItems.splice(index, 1);
    },
    normalizeItems(state, transform) {
      state.resourceItems = state.resourceItems.map(item => {
        // make sure the id and links are in lowercase
        item.id = item.id || randId();
        item.id = item.id.toLowerCase();
        item.links = item.links || [];
        item.tags = item.tags || [];
        item.links = item.links.map(link => link.toLowerCase());
        item.links = [...new Set(item.links)];
        item.tags = item.tags || [];
        item.tags = item.tags.map(tag => tag.toLowerCase().replace(/ /g, "-"));
        item.links = [...new Set(item.links)];
        if (transform) return transform(item);
        else return item;
      });
    }
  }
});

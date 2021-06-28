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

const zenodoBaseURL = siteConfig.zenodo_config.use_sandbox
  ? "https://sandbox.zenodo.org"
  : "https://zenodo.org";

export const store = new Vuex.Store({
  state: {
    allApps: {},
    allTags: [],
    resourceItems: [],
    zenodoClient: siteConfig.zenodo_config.enabled
      ? new ZenodoClient(
          zenodoBaseURL,
          siteConfig.zenodo_config.client_id,
          siteConfig.zenodo_config.use_sandbox
        )
      : null,
    zenodoBaseURL,
    siteConfig
  },
  actions: {
    async login(context) {
      try {
        await context.state.client.login();
      } catch (e) {
        alert(`Failed to login: ${e}`);
      }
    },

    async fetchResourceItems(context, { manifest_url, repo, transform }) {
      const items = await context.state.zenodoClient.getResourceItems({});
      items.map(item => context.commit("addResourceItem", item));

      const siteConfig = context.state.siteConfig;
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
    }
  },
  mutations: {
    addResourceItem(state, item) {
      item.authors = item.authors || [];
      item.authors = item.authors.map(author =>
        typeof author === "string" ? { name: author } : author
      );
      item.config = item.config || {};
      item.config._rdf_file = item.config._rdf_file || item.source; // TODO: some resources current doesn't have a dedicated rdf_file
      if (item.type === "application") state.allApps[item.id] = item;
      state.resourceItems.push(item);
      // index tags
      if (item.tags && item.tags.length > 0)
        item.tags.map(tag => {
          if (!state.allTags.includes(tag)) {
            state.allTags.push(tag);
          }
        });
    },
    removeResourceItem(state, item) {
      if (item.type === "application") delete state.allApps[item.id];
      const index = state.resourceItems.indexOf(item);
      if (index >= 0) state.resourceItems.splice(index, 1);
    },
    normalizeItems(state, transform) {
      state.resourceItems = state.resourceItems.map(transform);
    }
  }
});

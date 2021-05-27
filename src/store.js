import Vue from "vue";
import Vuex from "vuex";
import { randId } from "./utils";
Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    resourceItems: []
  },
  actions: {
    async getResourceItems(context, { siteConfig, manifest_url, repo }) {
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
    }
  },
  mutations: {
    addResourceItem(state, item) {
      state.resourceItems.push(item);
    },
    removeResourceItem(state, item) {
      const index = state.resourceItems.indexOf(item);
      if (index >= 0) state.resourceItems.splice(index, 1);
    }
  }
});

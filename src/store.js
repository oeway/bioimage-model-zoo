import Vue from "vue";
import Vuex from "vuex";
import { randId } from "./utils";
Vue.use(Vuex);

// eslint-disable-next-line no-unused-vars
async function getZenodoResourceItems(page, type) {
  page = page || 1;
  type = type || "all";
  const kw = type === "all" ? "bioimageio" : "bioimageio:type";
  const url = `https://sandbox.zenodo.org/api/records/?page=${page}&size=20&keywords=${kw}`;
  const response = await fetch(url);
  const results = JSON.parse(await response.text());
  const hits = results.hits.hits;

  const resourceItems = hits.map(item => {
    const metadata = item.metadata;
    let type = metadata.keywords.filter(k => k.startsWith("bioimageio:"))[0];
    if (!type) {
      console.warn(
        `RDF item ${metadata.name} does not contain a bioimageio type keyword starts with "bioimage:<TYPE>"`
      );
      return null;
    }
    type = type.replace("bioimageio:", "");
    const files = item.files;

    const source = item.links.doi;
    if (type === "model") {
      const modelYaml = files.filter(file => file.key === "model.yaml")[0];
      if (!modelYaml) {
        console.warn(
          `RDF item ${metadata.name} does not contain a model.yaml file`
        );
        return null;
      }
    }

    return {
      id: metadata.doi,
      type,
      authors: metadata.creators.map(author => author.name),
      tags: metadata.keywords.filter(
        k => k !== "bioimageio" || !k.startsWith("bioimageio:")
      ),
      description: metadata.description,
      license: metadata.license.id,
      source: source //TODO: fix for other RDF types
    };
  });
  return resourceItems.filter(item => item !== null);
}

export const store = new Vuex.Store({
  state: {
    resourceItems: []
  },
  actions: {
    async getResourceItems(context, { siteConfig, manifest_url, repo }) {
      // const items = await getZenodoResourceItems();
      // items.map(item => context.commit("addResourceItem", item));

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

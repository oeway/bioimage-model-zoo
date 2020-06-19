import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

function normalizeModel(model) {
  if (model.covers && model.covers.length > 0) {
    // resolve relative path to the cover image
    if (!model.covers[0].startsWith("http")) {
      model.cover_image = encodeURI(model.root_url + "/" + model.covers[0]);
    } else {
      model.cover_image = encodeURI(model.covers[0]);
    }
    if (model.cover_image.includes("(") || model.cover_image.includes(")")) {
      console.error("cover image file name cannot contain brackets.");
    }
    // TODO: show all the cover images
  } else {
    model.cover_image = "";
  }
  model.allLabels = model.labels || [];
  if (model.license) {
    model.allLabels.push(model.license);
  }
  if (model.tags) {
    model.allLabels = model.allLabels.concat(model.tags);
  }
}
export const store = new Vuex.Store({
  state: {
    models: [],
    fullLabelList: [],
    appSources: [],
    apps: {}
  },
  actions: {
    addModel(context, config) {
      context.commit("addModel", config);
    }
  },
  mutations: {
    addApp(state, app) {
      state.apps[app.name] = app;
    },
    setAppSources(state, appSources) {
      state.appSources = appSources;
    },
    setModels(state, models) {
      for (let model of models) {
        normalizeModel(model);
        model.allLabels.forEach(label => {
          if (state.fullLabelList.indexOf(label) === -1) {
            state.fullLabelList.push(label);
          }
        });
        state.fullLabelList.sort((a, b) =>
          a.toLowerCase() < b.toLowerCase() ? -1 : 1
        );
      }
    },
    addModel(state, model) {
      state.models.push(model);
      normalizeModel(model);
      model.allLabels.forEach(label => {
        if (state.fullLabelList.indexOf(label) === -1) {
          state.fullLabelList.push(label);
        }
      });
      state.fullLabelList.sort((a, b) =>
        a.toLowerCase() < b.toLowerCase() ? -1 : 1
      );
    },
    removeModel(state, layer) {
      layer.selected = false;
      const idx = state.models.indexOf(layer);
      if (idx >= 0) {
        state.models.splice(idx, 1);
      }
    }
  }
});

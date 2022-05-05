import { randId } from "./utils";

const cssPatch = `
.window>.titlebar {
  cursor: move;
}
.window>.titlebar>.title {
  font-size: 1rem!important;
}

.window>.titlebar>.title>div>.button {
  height: 18px!important;
  line-height: 18px!important;
}

/* hide the fullscreen button */
.window>.titlebar>.title>div>.button:nth-child(3){
  display:none!important;
}
.imjoy-windows > img {
  display: none;
}
`;

let resolveImJoy, rejectImJoy;
const imjoyReady = new Promise((resolve, reject) => {
  resolveImJoy = resolve;
  rejectImJoy = reject;
});
export async function setupBioEngine() {
  const queryString = window.location.href.split("#")[1].split("?")[1];
  const urlParams = new URLSearchParams(queryString);
  const devMode = urlParams.get("dev");
  if (devMode) {
    if (devMode) {
      const styleSheet = document.createElement("style");
      styleSheet.innerText = cssPatch;
      document.head.appendChild(styleSheet);

      const container = document.createElement("div");
      container.id = "window-container";
      document.body.appendChild(container);
    }
  }

  async function createWindow(_plugin, config) {
    let output;
    if (_plugin && _plugin.config.namespace) {
      if (_plugin.config.namespace) {
        const outputContainer = document.getElementById(
          "output_" + _plugin.config.namespace
        );
        if (
          !config.dialog &&
          (!config.window_id || !document.getElementById(config.window_id))
        ) {
          output = document.createElement("div");
          output.id = randId();
          output.classList.add("imjoy-window");
          outputContainer.style.height = "600px";
          outputContainer.appendChild(output);
          config.window_id = output.id;
        }
      }
    }
    let w;
    // fallback to grid
    if (
      (config.type && config.type.startsWith("imjoy/")) ||
      config.type === "joy"
    ) {
      const grid = await window.imjoy.pm.createWindow(_plugin, {
        src: "https://grid.imjoy.io/#/app",
        window_id: config.window_id,
        namespace: config.namespace
      });
      w = await grid.createWindow(config);
    } else {
      // w = await window.imjoy.pm.createWindow(_plugin, config)
      if (!config.window_manager_container) config.dialog = true;
      w = window.imjoy.pm.createWindow(_plugin, config);
    }

    return w;
  }

  const imjoy_api = {
    async getPlugin(_plugin, config, extra_config) {
      // pass the namespace to the created plugin
      extra_config = extra_config || {};
      if (!config || !config.namespace)
        extra_config.namespace =
          extra_config.namespace || (_plugin && _plugin.config.namespace);
      return await window.imjoy.pm.getPlugin(_plugin, config, extra_config);
    },
    async showStatus(_plugin, msg) {
      if (_plugin && _plugin.config.namespace) {
        if (_plugin.config.namespace) {
          const statusElem = document.getElementById(
            "status_" + _plugin.config.namespace
          );
          statusElem.innerHTML = `${msg.slice(0, 128)}`;
          return;
        }
      }
      window.app.showSnackbar(msg, 5);
    },
    async showProgress(_plugin, progress) {
      if (_plugin && _plugin.config.namespace) {
        if (_plugin.config.namespace) {
          const progressElem = document.getElementById(
            "progress_" + _plugin.config.namespace
          );
          if (progress < 1) progress = progress * 100;
          if (progress > 100) progress = 100;
          progressElem.style.width = `${progress}%`;
          return;
        }
      }
      progress = progress || 0;
      if (progress < 1) progress = progress * 100;
      window.app.progress = progress;
      window.app.$forceUpdate();
    },
    async showMessage(_plugin, msg, duration) {
      duration = duration || 5;
      if (_plugin && _plugin.config.namespace) {
        if (_plugin.config.namespace) {
          const statusElem = document.getElementById(
            "status_" + _plugin.config.namespace
          );
          statusElem.innerHTML = `${msg.slice(0, 128)}`;
        }
      }
      window.app.showSnackbar(msg, duration);
    },
    async showDialog(_plugin, config) {
      config.dialog = true;
      return await createWindow(_plugin, config);
    },
    createWindow
  };

  window
    .loadImJoyBasicApp({
      version: "0.14.3",
      process_url_query: true,
      show_window_title: false,
      show_progress_bar: true,
      show_empty_window: true,
      hide_about_imjoy: true,
      menu_style: {},
      window_style: {
        width: "100%",
        height: "100%"
      },
      main_container: null,
      menu_container: "imjoy-menu",
      window_manager_container: devMode ? "window-container" : null,
      imjoy_api
    })
    .then(async app => {
      // get the api object from the root plugin
      const api = app.imjoy.api;
      app.$on("window-size-pos-changing", changing => {
        const iframes = document.querySelectorAll(".reveal iframe");
        for (let iframe of iframes) {
          iframe.style.pointerEvents = changing ? "none" : "all";
        }
      });
      // if you want to let users to load new plugins, add a menu item
      app.addMenuItem({
        label: "➕ Load Plugin",
        callback() {
          const uri = prompt(
            `Please type a ImJoy plugin URL`,
            "https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/ImageAnnotator.imjoy.html"
          );
          if (uri) app.loadPlugin(uri);
        }
      });
      app.addMenuItem({
        label: "🎢 Playground",
        callback() {
          api.createWindow({ src: "https://if.imjoy.io" });
        }
      });
      app.addMenuItem({
        label: "📓 Notebooks",
        callback() {
          api.createWindow({ src: "https://jupyter.imjoy.io" });
        }
      });
      // expose global variables
      window.api = api;
      window.imjoy = app.imjoy;
      window.app = app;
      resolveImJoy(app.imjoy);
      // TODO: hacky solution, need further investigation
      // imjoy.event_bus.on("add_window", w => {
      //   if(imjoy.wm.windows.indexOf(w)<0){
      //     imjoy.wm.windows.push(w);
      //   }
      // });
      app.imjoy.pm.reloadPluginRecursively({
        uri:
          "https://raw.githubusercontent.com/imjoy-team/imjoy-core-plugins/master/docs/WebPythonWorker.imjoy.html"
      });
      app.imjoy.pm
        .reloadPluginRecursively({
          // uri: "http://localhost:9090/Jupyter-Engine-Manager.imjoy.html"
          uri:
            "https://imjoy-team.github.io/jupyter-engine-manager/Jupyter-Engine-Manager.imjoy.html"
        })
        .then(enginePlugin => {
          const engine = urlParams.get("engine");
          const spec = urlParams.get("spec");
          if (engine) {
            enginePlugin.api
              .createEngine({
                name: "MyCustomEngine",
                nbUrl: engine,
                url: engine.split("?")[0]
              })
              .then(() => {
                console.log("Jupyter Engine connected!");
              })
              .catch(e => {
                console.error("Failed to connect to Jupyter Engine", e);
              });
          } else {
            enginePlugin.api
              .createEngine({
                name: "MyBinder Engine",
                url: "https://mybinder.org",
                spec: spec || "oeway/imjoy-binder-image/master"
              })
              .then(() => {
                console.log("Binder Engine connected!");
              })
              .catch(e => {
                console.error("Failed to connect to MyBinder Engine", e);
              });
          }
        });
      app.addMenuItem({
        label: "ℹ️ Github",
        callback() {
          window.open("https://github.com/bioimage-io/bioimage.io");
        }
      });
    })
    .catch(e => {
      console.error(e);
      rejectImJoy();
    });
}

export async function setupDevMenu(updateDevMenu) {
  const queryString = window.location.href.split("#")[1].split("?")[1];
  const urlParams = new URLSearchParams(queryString);
  const devMode = urlParams.get("dev");
  if (!devMode) return;
  await imjoyReady;
  const app = window.app;
  app.loadPlugin("https://if.imjoy.io").then(() => {
    app.imjoy.event_bus.on("plugin_loaded", plugin => {
      updateDevMenu("add", plugin);
    });
    app.imjoy.event_bus.on("plugin_unloaded", plugin => {
      updateDevMenu("remove", plugin);
    });
    app.imjoy.event_bus.on("add_window", w => {
      window.scrollTo(0, 0);
      setTimeout(() => {
        if (!w.dialog) {
          const windowElem = document.getElementById(w.window_id).parentElement
            .parentElement;
          windowElem.style.top = "100px";
        }
      }, 200);
    });
  });
}

export async function runAppForAllItems(context, config, allItems) {
  console.log(config, allItems);
  context.showLoader(true);
  try {
    if (config.passive) {
      await window.api.createWindow({ src: config.source, passive: true });
      return;
    }
    const plugin = await window.api.getPlugin({ src: config.source });
    await plugin.run({
      config: { referer: window.location.href, mode: "all", type: "bioengine" },
      data: allItems
    });
    context.showLoader(false);
  } catch (e) {
    console.error(e);
  } finally {
    context.showLoader(false);
  }
  // }
}

export async function runAppForItem(context, config, item) {
  console.log(config, item);
  context.showLoader(true);
  try {
    if (config.passive) {
      await window.api.createWindow({ src: config.source, passive: true });
      return;
    }
    const plugin = await window.api.getPlugin({ src: config.source });
    await plugin.run({
      config: { referer: window.location.href, mode: "one", type: "bioengine" },
      data: item
    });
  } catch (e) {
    console.error(e);
  } finally {
    context.showLoader(false);
  }
}

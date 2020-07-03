import { reshape } from "mathjs";
import siteConfig from "../site.config.json";
import { version } from "../package.json";

const dtypeToTypedArray = {
  int8: "Int8Array",
  int16: "Int16Array",
  int32: "Int32Array",
  uint8: "Uint8Array",
  uint16: "Uint16Array",
  uint32: "Uint32Array",
  float32: "Float32Array",
  float64: "Float64Array",
  array: "Array"
};

const ArrayBufferView = Object.getPrototypeOf(
  Object.getPrototypeOf(new Uint8Array())
).constructor;

// eslint-disable-next-line no-unused-vars
function toArray(data) {
  if (
    typeof data === "number" ||
    typeof data === "string" ||
    typeof data === "boolean" ||
    data === null ||
    data === undefined
  ) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return Array.from(new Uint8Array(data));
  }
  if (data instanceof ArrayBufferView) {
    return Array.from(data);
  }
  if (Array.isArray(data)) return data.map(toArray);
  if (data.constructor === Object) {
    if (data._rtype) {
      if (data._rtype !== "ndarray") throw "Invalid input type: " + data._rtype;
      const arraytype = eval(dtypeToTypedArray[data._rdtype]);
      return reshape(Array.from(new arraytype(data._rvalue)), data._rshape);
    }
    const obj = {};
    Object.entries(data).forEach(arr => {
      obj[arr[0]] = toArray(arr[1]);
    });
    return obj;
  } else {
    throw new Error("Unsupported type conversion");
  }
}

export async function setupBioEngineAPI() {
  const imjoyRPC = await window.imjoyLoader.loadImJoyRPC({
    api_version: "0.2.3"
  });

  const api = await imjoyRPC.setupRPC({
    name: siteConfig.name,
    version: version,
    description: siteConfig.description,
    type: "rpc-window"
  });
  const service_api = {
    setup() {
      api.log(`${siteConfig.name} loaded successfully.`);
    },
    async run() {},
    getSelection() {
      return [];
    }
  };

  api.export(service_api);
}

export async function setupBioEngine(
  workspace,
  showMessage,
  showProgress,
  showDialog,
  closeDialog,
  updateStatus
) {
  const imjoyCore = await window.loadImJoyCore({ version: "0.13.19" });

  var imjoy_api = {
    showStatus(plugin, info) {
      showMessage(info);
    },
    showMessage(plugin, info, duration) {
      showMessage(info, duration);
    },
    showProgress(plugin, progress) {
      if (progress < 1) progress = progress * 100;
      showProgress(progress);
    },
    showDialog(_plugin, config) {
      return new Promise((resolve, reject) => {
        if (config.ui) {
          showDialog(config);
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
          config.window_container = "window-dialog-container";
          config.standalone = true;
          if (config.type.startsWith("imjoy/")) {
            config.render = () => {};
          }
          showDialog(config);
          setTimeout(() => {
            imjoy.pm
              .createWindow(null, config)
              .then(api => {
                const _close = api.close;
                api.close = async () => {
                  await _close();
                  closeDialog();
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
  imjoy.lazy_dependencies = {};
  imjoy.pm.imjoy_api.getPlugin = async (_plugin, plugin_name) => {
    const target_plugin = imjoy.pm.plugin_names[plugin_name];
    if (target_plugin) {
      return target_plugin.api;
    } else if (imjoy.pm.internal_plugins[plugin_name]) {
      try {
        updateStatus({ loading: true });
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
        updateStatus({ loading: false });
      }
    } else if (imjoy.lazy_dependencies[plugin_name]) {
      try {
        updateStatus({ loading: true });
        const p = await imjoy.pm.reloadPluginRecursively({
          uri: imjoy.lazy_dependencies[plugin_name]
        });
        console.log(`${p.name} loaded.`);
        return p.api;
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        updateStatus({ loading: false });
      }
    } else {
      throw `plugin with type ${plugin_name} not found.`;
    }
  };
  await imjoy.start({ workspace: workspace });
  console.log("ImJoy loaded successfully.");
  return imjoy;
}

export function validateBioEngineApp(name, api) {
  if (!api.runOneModel && !api.runManyModels) {
    return false;
  }
  return true;
}

export async function loadPlugins(imjoy, appSources) {
  console.log("ImJoy started: ", imjoy);
  await imjoy.pm.reloadPluginRecursively({
    uri:
      "https://imjoy-team.github.io/jupyter-engine-manager/Jupyter-Engine-Manager.imjoy.html"
  });
  const apps = {};
  // await imjoy.pm.reloadInternalPlugins()
  for (let ap of appSources) {
    try {
      const config = await imjoy.pm.getPluginFromUrl(ap.source);
      const p = await imjoy.pm.reloadPlugin(config);
      if (config.dependencies)
        for (let i = 0; i < config.dependencies.length; i++) {
          const d_config = await imjoy.pm.getPluginFromUrl(
            config.dependencies[i]
          );
          // TODO: use a better way to determin if it's an internal plugin type
          if (imjoy.pm.getBadges(d_config) === "🚀") {
            imjoy.lazy_dependencies[d_config.name] = config.dependencies[i];
          } else {
            await imjoy.pm.reloadPluginRecursively({
              uri: config.dependencies[i]
            });
          }
        }
      apps[ap.name] = p;
    } catch (e) {
      console.error(e);
    }
  }
  return apps;
}

export function loadCodeFromFile(imjoy, file) {
  return new Promise((resolve, reject) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const code = reader.result;

        const config = imjoy.pm.parsePluginCode(code);
        config.dependencies = config.dependencies || [];
        try {
          for (let i = 0; i < config.dependencies.length; i++) {
            await imjoy.pm.reloadPluginRecursively({
              uri: config.dependencies[i]
            });
          }
          const plugin = await imjoy.pm.reloadPlugin(config);
          console.log(plugin);
          if (plugin.type !== "window") {
            validateBioEngineApp(plugin.name, plugin.api);
          }
          resolve(plugin);
          console.log(`Plugin "${plugin.name}" loaded successfully.`);
        } catch (error) {
          reject(`Failed to load dependencies for ${config.name}: ${error}`);
        }
      } catch (e) {
        console.error(e);
        reject(`Failed to load plugin: ${e}`);
      }
    };
    reader.onerror = e => {
      console.error(e);
      reject(`Failed to load plugin: ${e}`);
    };
    reader.readAsText(file);
  });
}

export async function runManyModels(plugin, models) {
  if (plugin.type === "window") {
    const w = await plugin.api.run();
    if (!validateBioEngineApp(plugin.name, w)) {
      await w.run({ data: models });
    } else {
      await w.runManyModels(models);
    }
  } else {
    if (validateBioEngineApp(plugin.name, plugin))
      await plugin.api.runManyModels(models);
    else await plugin.api.run({ data: models });
  }
}

export async function runOneModel(plugin, model) {
  if (plugin.type === "window") {
    const w = await plugin.api.run();
    if (validateBioEngineApp(plugin.name, w)) {
      await w.runOneModel(model);
    } else {
      w.run({ data: model });
    }
  } else {
    if (plugin.api.runOneModel) {
      plugin.api.runOneModel(model);
    } else {
      plugin.api.run({ data: model });
    }
  }
}

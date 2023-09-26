import { randId } from "./utils";

const i18n = {
  runButtonText: "Run",
  editButtonText: "Edit",
  errorText: "Error",
  successText: "Done"
};

async function runCode(mode, config, code) {
  // make a copy of it
  if (config.lang === "js") config.lang = "javascript";
  if (config.lang === "py") config.lang = "python";
  if (config.lang === "ijm") config.lang = "javascript";

  const makePluginSource = (src, config) => {
    if (config.type && !config._parsed) {
      if (config.type === "macro") {
        config.passive = false;
        src = `
                    async function setup(){
                        const source = \`${src}\`;
                        let ij = await api.getWindow("ImageJ.JS-${config.namespace}")
                        if(!ij){
                            ij = await api.createWindow({src:"https://ij.imjoy.io", name:"ImageJ.JS-${config.namespace}"})
                        }
                        await ij.runMacro(source)
                    }
                    api.export({setup});                    
                    `;
        config.type = "web-worker";
      }
      const cfg = Object.assign({}, config);
      cfg.api_version = cfg.api_version || "0.1.8";
      cfg.name =
        cfg.name ||
        (config.id && "Plugin-" + config.id) ||
        "Plugin-" + randId();
      cfg.description =
        cfg.description || "[TODO: describe this plugin with one sentence.]";
      cfg.tags = cfg.tags || [];
      cfg.version = cfg.version || "0.1.0";
      cfg.ui = cfg.ui || "";
      cfg.cover = cfg.cover || "";
      cfg.icon = cfg.icon || "extension";
      cfg.inputs = cfg.inputs || null;
      cfg.outputs = cfg.outputs || null;
      cfg.env = cfg.env || "";
      cfg.permissions = cfg.permissions || [];
      cfg.requirements = cfg.requirements || [];
      cfg.dependencies = cfg.dependencies || [];
      if (config.type === "window") {
        cfg.defaults = {};
      }
      if (!config.lang) {
        if (cfg.type.includes("python")) {
          config.lang = "python";
        } else if (cfg.type.includes("javascript")) {
          config.lang = "javascript";
        } else {
          console.error(
            '"lang" is not specified, please make sure decorate the code block with the name of the language.'
          );
        }
      }
      if (config.lang !== "html")
        src = `<config lang="json">\n${JSON.stringify(
          cfg,
          null,
          1
          // eslint-disable-next-line no-useless-escape
        )}\n</config>\n<script lang="${config.lang}">\n${src}<\/script>`;
      else
        src = `<config lang="json">\n${JSON.stringify(
          cfg,
          null,
          1
        )}\n</config>\n${src}`;
    }
    return src;
  };

  const runPluginSource = async (code, initPlugin, windowId, config) => {
    config = Object.assign({}, config);
    // automatically set passive mode if there is no export statement
    if (config.passive === undefined) {
      if (code && !code.includes("api.export(")) {
        config.passive = true;
      }
    }
    const isHTML = code.trim().startsWith("<");
    if (isHTML || (config.lang === "html" && !config.type)) {
      const source_config = await window.imjoy.pm.parsePluginCode(code);
      delete source_config.namespace;
      for (const k of Object.keys(source_config)) {
        config[k] = source_config[k];
      }
      config.passive = source_config.passive || config.passive;
      config._parsed = true;
    } else {
      config._parsed = false;
    }
    const src = makePluginSource(code, config);
    const progressElem = document.getElementById(
      "progress_" + config.namespace
    );
    if (progressElem) progressElem.style.width = `0%`;
    // disable hot reloading for passive plugin
    if (config.passive) {
      config.hot_reloading = false;
    }

    try {
      if (config.type === "window") {
        const wElem = document.getElementById(windowId);
        if (wElem) wElem.classList.add("imjoy-window");
        await window.imjoy.pm.imjoy_api.createWindow(initPlugin, {
          src,
          namespace: config.namespace,
          tag: config.tag,
          window_id: windowId,
          w: config.w,
          h: config.h,
          hot_reloading: config.hot_reloading
        });
      } else {
        const plugin = await window.imjoy.pm.imjoy_api.getPlugin(initPlugin, {
          src,
          namespace: config.namespace,
          tag: config.tag,
          hot_reloading: config.hot_reloading
        });
        try {
          if (plugin.run) {
            await plugin.run(
              config.runButtonContext || {
                config: {},
                data: {}
              }
            );
          }
        } catch (e) {
          this.showMessage(e.toString());
        }
      }
    } finally {
      if (progressElem) progressElem.style.width = `100%`;
    }
  };
  if (mode === "edit") {
    const wElem = document.getElementById(config.window_id);
    if (wElem) wElem.classList.add("imjoy-window");
    const cfg = Object.assign({}, config);
    delete cfg.passive;
    delete cfg.editor_height;
    let editorWindow;
    let pluginInEditor;
    let stopped;
    const api = window.imjoy.pm.imjoy_api;
    cfg.ui_elements = {
      save: {
        _rintf: true,
        type: "button",
        label: "Save",
        visible: false,
        icon: "content-save",
        callback(content) {
          console.log(content);
        }
      },
      run: {
        _rintf: true,
        type: "button",
        label: "Run",
        icon: "play",
        visible: true,
        shortcut: "Shift-Enter",
        async callback(content) {
          try {
            editorWindow.setLoader(true);
            editorWindow.updateUIElement("stop", {
              visible: true
            });
            api.showProgress(editorWindow, 0);
            // make an exception for imagej macro and try to reuse existing app
            if (config.type !== "macro") {
              const outputContainer = document.getElementById(
                "output_" + config.namespace
              );
              outputContainer.innerHTML = "";
            }

            config.hot_reloading = true;
            pluginInEditor = await runPluginSource(
              content,
              editorWindow,
              null,
              config
            );
            if (stopped) {
              pluginInEditor = null;
              return;
            }
            if (pluginInEditor && pluginInEditor.run) {
              return await pluginInEditor.run(
                config.runButtonContext || {
                  config: {},
                  data: {}
                }
              );
            }
            if (stopped) {
              pluginInEditor = null;
              return;
            }
          } catch (e) {
            api.showMessage(
              editorWindow,
              "Failed to load plugin, error: " + e.toString()
            );
          } finally {
            editorWindow.updateUIElement("stop", {
              visible: false
            });
            editorWindow.setLoader(false);
            api.showProgress(editorWindow, 100);
          }
        }
      },
      stop: {
        _rintf: true,
        type: "button",
        label: "Stop",
        style: "color: #ff0080cf;",
        icon: "stop",
        visible: false,
        async callback() {
          stopped = true;
          await editorWindow.setLoader(false);
          await editorWindow.updateUIElement("stop", {
            visible: false
          });
        }
      },
      export: {
        _rintf: true,
        type: "button",
        label: "Export",
        icon: "file-download-outline",
        visible: true,
        async callback(content) {
          const fileName =
            (pluginInEditor &&
              pluginInEditor.config.name &&
              pluginInEditor.config.name + ".imjoy.html") ||
            config.name + ".imjoy.html" ||
            "myPlugin.imjoy.html";
          await api.exportFile(
            editorWindow,
            makePluginSource(content, config),
            fileName
          );
        }
      }
    };
    editorWindow = await window.imjoy.pm.imjoy_api.createWindow(null, {
      src: "https://if.imjoy.io/",
      config: cfg,
      data: {
        code
      },
      window_id: cfg.window_id,
      namespace: cfg.namespace
    });

    if (config.editor_height)
      document.getElementById(editorWindow.config.window_id).style.height =
        config.editor_height;
  } else if (mode === "run") {
    await runPluginSource(code, null, config.window_id, config);
  } else {
    throw "Unsupported mode: " + mode;
  }
}

function execute(preElm, mode) {
  mode = mode || "run";
  var codeElm = preElm.querySelector("code");
  const code = codeElm.textContent || codeElm.innerText;
  const showCodeBtn = preElm.querySelector(".show-code-button");
  showCodeBtn.style.display = "none";

  try {
    const id = randId();
    preElm.pluginConfig = preElm.pluginConfig || {};
    preElm.pluginConfig.id = id;

    preElm.pluginConfig.namespace = id;
    preElm.pluginConfig.lang = preElm
      .querySelector("code")
      .classList[0].replace("language-", "");

    const outputFullscreenElm = preElm.querySelector(".fullscreen-button");
    outputFullscreenElm.onclick = () => {
      const outputElem = document.getElementById("output_" + id);
      if (outputElem.requestFullscreen) {
        outputElem.requestFullscreen();
      } else if (outputElem.webkitRequestFullscreen) {
        /* Safari */
        outputElem.webkitRequestFullscreen();
      } else if (outputElem.msRequestFullscreen) {
        /* IE11 */
        outputElem.msRequestFullscreen();
      }
    };
    let hideCodeBlock = preElm.pluginConfig.hide_code_block;
    if (mode === "edit") {
      // remove the github corner in edit mode
      const githubCorner = document.querySelector(".github-corner");
      if (githubCorner) githubCorner.parentNode.removeChild(githubCorner);
    }
    const customElements = preElm.querySelectorAll(":scope > div[id]");
    for (const elm of customElements) {
      preElm.removeChild(elm);
    }

    if (mode === "edit") {
      const customElements = preElm.querySelectorAll(":scope > button");
      for (const elm of customElements) {
        elm.style.display = "none";
      }
      preElm.pluginConfig.window_id = "code_" + id;
      preElm.insertAdjacentHTML(
        "afterBegin",
        `<div id="${"code_" + id}"></div><div id="${"output_" + id}"></div>`
      );
      preElm.insertAdjacentHTML(
        "afterBegin",
        `<button class="docsify-close-button" id="${"close_" + id}">x</button>`
      );
      preElm.insertAdjacentHTML(
        "afterBegin",
        `<button class="docsify-fullscreen-button" id="${"fullscreen_" +
          id}">+</button>`
      );
      preElm.insertAdjacentHTML(
        "afterBegin",
        `<div id="${"progress_container_" +
          id}" style="top: 1px;" class="docsify-progressbar-container"><div class="docsify-progressbar" style="background-color:#2196F3!important;height:3px;" id="${"progress_" +
          id}"> </div></div>`
      );
      preElm.insertAdjacentHTML(
        "beforeEnd",
        `<div class="docsify-status" style="font-size:13px;left: 4px;" id="${"status_" +
          id}"></div>`
      );
      const closeElem = document.getElementById("close_" + id);
      const fullscreenElm = document.getElementById("fullscreen_" + id);
      const statusElem = document.getElementById("status_" + id);
      const editorElem = document.getElementById("code_" + id);
      const outputElem = document.getElementById("output_" + id);
      const editorHeight = parseInt(
        preElm.pluginConfig.editor_height || "600px"
      );
      statusElem.style.top = `${editorHeight - 20}px`;
      editorElem.style.height = `${editorHeight}px`;
      editorElem.style.paddingBottom = "10px";
      closeElem.onclick = function() {
        editorElem.parentNode.removeChild(editorElem);

        outputElem.parentNode.removeChild(outputElem);
        if (hideCodeBlock) {
          showCodeBtn.style.display = "block";
          codeElm.style.display = "none";
        } else {
          showCodeBtn.style.display = "none";
          codeElm.style.display = "block";
        }

        for (const elm of customElements) {
          elm.style.display = "inline-block";
        }
        this.parentNode.removeChild(this);
        fullscreenElm.parentNode.removeChild(fullscreenElm);
      };
      fullscreenElm.onclick = function() {
        if (preElm.requestFullscreen) {
          preElm.requestFullscreen();
        } else if (preElm.webkitRequestFullscreen) {
          /* Safari */
          preElm.webkitRequestFullscreen();
        } else if (preElm.msRequestFullscreen) {
          /* IE11 */
          preElm.msRequestFullscreen();
        }
      };

      preElm.style.overflow = "hidden";
      outputElem.style.overflow = "auto";
    } else {
      // run mode
      preElm.pluginConfig.window_id = "output_" + id;
      preElm.insertAdjacentHTML(
        "beforeEnd",
        `<div id="${"progress_container_" +
          id}" class="docsify-progressbar-container"><div class="docsify-progressbar" style="background-color:#2196F3!important;height:3px;" id="${"progress_" +
          id}"> </div></div>`
      );
      preElm.insertAdjacentHTML(
        "beforeEnd",
        `<div class="docsify-status" style="margin-top: 8px;" id="${"status_" +
          id}"/>`
      );
      preElm.insertAdjacentHTML(
        "beforeEnd",
        `<div id="${"code_" + id}"></div><div id="${"output_" + id}"></div>`
      );
      codeElm.style.display = "block";
      showCodeBtn.style.display = "none";
      const outputElem = document.getElementById("output_" + id);
      outputElem.style.overflow = "auto";
    }
    const loader = preElm.querySelector(".docsify-loader");
    loader.style.display = "inline-block";
    const runBtn = preElm.querySelector(".docsify-run-button");
    if (runBtn) runBtn.innerHTML = "&nbsp; &nbsp; &nbsp; ";
    if (window.app) {
      runCode(mode, preElm.pluginConfig, code).finally(() => {
        loader.style.display = "none";
        const runBtn = preElm.querySelector(".docsify-run-button");
        if (runBtn)
          runBtn.innerHTML =
            preElm.pluginConfig.run_button_text || i18n.runButtonText;
        const outputElem = document.getElementById("output_" + id);
        if (outputElem && outputElem.children.length > 0)
          outputFullscreenElm.style.display = "inline-block";
      });
    } else {
      window.document.addEventListener("imjoy_app_started", () => {
        runCode(mode, preElm.pluginConfig, code).finally(() => {
          loader.style.display = "none";
          const runBtn = preElm.querySelector(".docsify-run-button");
          if (runBtn)
            runBtn.innerHTML =
              preElm.pluginConfig.run_button_text || i18n.runButtonText;
        });
      });
    }

    if (hideCodeBlock || mode === "edit") {
      codeElm.style.display = "none";
      if (mode !== "edit") {
        showCodeBtn.style.display = "block";
      }
    }

    if (preElm.pluginConfig.minimal_ui) {
      showCodeBtn.style.display = "none";
      const progressBar = preElm.querySelector(".docsify-progressbar");
      progressBar.style.display = "none";
    }
    document.addEventListener("fullscreenchange", function(e) {
      const fullScreenMode =
        document.fullScreen ||
        document.mozFullScreen ||
        document.webkitIsFullScreen;
      if (e.target === preElm) {
        const closeElem = document.getElementById("close_" + id);
        const fullscreenElm = document.getElementById("fullscreen_" + id);
        const editorElem = document.getElementById("code_" + id);
        const outputElem = document.getElementById("output_" + id);
        const statusElem = document.getElementById("status_" + id);
        if (fullScreenMode) {
          closeElem.style.display = "none";
          fullscreenElm.style.display = "none";
          preElm.style.padding = "0";
          editorElem.style.height = "calc( 100vh - 4px )";
          editorElem.style.width = "50%";
          editorElem.style.display = "inline-block";
          outputElem.style.width = "50%";
          outputElem._oldHeight = outputElem.style.height;
          outputElem.style.height = "calc( 100vh - 4px )";
          outputElem.style.minHeight = "calc( 100vh - 4px )";
          outputElem.style.display = "inline-block";
          statusElem.style.top = null;
          statusElem.style.bottom = "1px";
        } else {
          closeElem.style.display = "inline-block";
          fullscreenElm.style.display = "inline-block";
          preElm.style.padding = "3px";
          delete outputElem.style.minHeight;
          editorElem.style.height =
            preElm.pluginConfig.editor_height || "600px";
          editorElem.style.width = "100%";
          editorElem.style.display = "block";
          outputElem.style.width = "100%";
          outputElem.style.height = outputElem._oldHeight || "600px";
          outputElem.style.display = "block";
          statusElem.style.bottom = null;
          const editorHeight = parseInt(
            preElm.pluginConfig.editor_height || "600px"
          );
          statusElem.style.top = `${editorHeight - 20}px`;
          preElm.scrollIntoView();
        }
        return;
      }
      const outputElem = document.getElementById("output_" + id);
      if (e.target === outputElem) {
        if (fullScreenMode) {
          outputElem.style.width = "100%";
          outputElem._oldHeight = outputElem.style.height;
          outputElem.style.height = "calc( 100vh - 4px )";
          outputElem.style.display = "block";
          // if(outputElem.children[0])outputElem.children[0].style.height = "100%";
        } else {
          outputElem.style.width = "100%";
          outputElem.style.height = outputElem._oldHeight || "600px";
          outputElem.style.display = "block";
          // if(outputElem.children[0]) outputElem.children[0].style.height = null
          outputElem.scrollIntoView();
        }
      }
    });
  } catch (err) {
    console.error("docsify-run-code: ".concat(err));
  }
}

export function initializeRunButtons(rootElement, runButtonContext) {
  var targetElms = Array.apply(null, rootElement.querySelectorAll("pre"));

  var template = [
    '<button class="docsify-run-button">',
    '<span class="label">'.concat(i18n.runButtonText, "</span>"),
    "</button>",
    '<button class="docsify-edit-button">',
    '<span class="label">'.concat(i18n.editButtonText, "</span>"),
    "</button>",
    '<div class="docsify-loader"></div>',
    '<button class="fullscreen-button" style="position:absolute; right:0px">+</button>'
  ].join("");

  targetElms.forEach(function(elm) {
    try {
      // patch for rouge syntax highlighter
      if (
        elm.parentElement &&
        elm.parentElement.parentElement &&
        elm.parentElement.classList.contains("highlight")
      ) {
        elm = elm.parentElement.parentElement;
      }

      let tmp = elm.previousSibling && elm.previousSibling.previousSibling;
      if (
        !tmp ||
        tmp.nodeName !== "#comment" ||
        !tmp.nodeValue.trim().startsWith("ImJoyPlugin")
      ) {
        // in case there is no empty line
        // the comment will be nested in the previous sibling
        if (
          tmp &&
          tmp.childNodes[tmp.childNodes.length - 1].nodeName === "#comment"
        ) {
          tmp = tmp.childNodes[tmp.childNodes.length - 1];
          if (!tmp.nodeValue.trim().startsWith("ImJoyPlugin")) return;
        } else {
          return;
        }
      }
      const ctrlStr = tmp.nodeValue.trim();
      if (ctrlStr === "ImJoyPlugin") {
        elm.pluginConfig = {};
      } else {
        elm.pluginConfig = JSON.parse(
          ctrlStr
            .split(":")
            .slice(1)
            .join(":") || "{}"
        );
      }
      elm.pluginConfig.runButtonContext = runButtonContext;
      elm.insertAdjacentHTML("beforeEnd", template);

      elm.querySelector(".docsify-loader").style.display = "none";
      elm.querySelector(".fullscreen-button").style.display = "none";
      elm.style.position = "relative";

      const codeElm = elm.querySelector("code");
      codeElm.insertAdjacentHTML(
        "beforeBegin",
        `<div class="show-code-button">+ show source code</div>`
      );
      const showCodeBtn = elm.querySelector(".show-code-button");
      showCodeBtn.onclick = () => {
        codeElm.style.display = "block";
        showCodeBtn.style.display = "none";
      };
      if (elm.pluginConfig.hide_code_block) {
        codeElm.style.display = "none";
      } else {
        showCodeBtn.style.display = "none";
      }
      if (elm.pluginConfig.startup_mode) {
        const mode = elm.pluginConfig.startup_mode;
        execute(elm, mode);
        delete elm.pluginConfig.startup_mode;
      }
      const editBtn = elm.querySelector(".docsify-edit-button");
      const runBtn = elm.querySelector(".docsify-run-button");
      const loader = elm.querySelector(".docsify-loader");
      if (elm.pluginConfig.minimal_ui) {
        editBtn.style.display = "none";
        showCodeBtn.style.display = "none";
        runBtn.style.width = "99%";
        loader.style.position = "absolute";
        loader.style.left = "49%";
      }
      if (runBtn)
          runBtn.innerHTML =
            elm.pluginConfig.run_button_text || i18n.runButtonText;
    } catch (e) {
      console.error(e);
    }
  });

  document.body.addEventListener("click", function(evt) {
    const isRunCodeButton = evt.target.classList.contains("docsify-run-button");
    const isEditCodeButton = evt.target.classList.contains(
      "docsify-edit-button"
    );
    if (isRunCodeButton || isEditCodeButton) {
      var buttonElm =
        evt.target.tagName === "BUTTON" ? evt.target : evt.target.parentNode;
      const mode = isEditCodeButton ? "edit" : "run";
      execute(buttonElm.parentNode, mode);
    }
  });
}

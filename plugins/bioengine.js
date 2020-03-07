import * as imjoyCore from './imjoy-core.js'
import { randId, getUrlParameter } from './utils.js'

class BioEngine {
  constructor (app) {
    this.app = app
    this.loadImJoy()
  }

  async getDocs (model) {
    if (model.docs) { return }
    model.docs = '@loading...'
    this.$forceUpdate()
    try {
      const response = await fetch(model.root_url + '/' + model.documentation + '?' + randId())
      if (response.status === 200) {
        const rawDocs = await response.text()
        if (rawDocs && window.marked && window.DOMPurify) {
          model.docs = window.DOMPurify.sanitize(window.marked(rawDocs))
        } else {
          model.docs = null
        }
      } else {
        model.docs = null
      }

      this.$forceUpdate()
    } catch (e) {
      model.docs = ''
      this.$forceUpdate()
    }
  }

  loadImJoy () {
    const me = this
    const lazyDependencies = {}
    const imjoyApi = {
      showStatus (plugin, info) {
        me.showMessage(info)
      },
      showMessage (plugin, info, duration) {
        me.showMessage(info, duration)
      },
      showProgress (plugin, progress) {
        if (progress < 1) { progress = progress * 100 }
        me.$refs.progressbar.setProgress(progress)
      },
      showDialog (_plugin, config) {
        return new Promise((resolve, reject) => {
          me.dialog_window = config
          me.$forceUpdate()
          if (config.ui) {
            if (!me.$refs.window_dialog.open) { me.$refs.window_dialog.showModal() }
            const joyConfig = {
              container: document.getElementById('window-dialog-container'),
              init: config.ui || '', // "{id:'localizationWorkflow', type:'ops'} " + // a list of ops
              data: config.data, // || Joy.loadFromURL(),
              modules: config.modules || ['instructions', 'math'],
              onexecute: config.onexecute,
              onupdate: config.onupdate
            }
            try {
              config.joy = new imjoyCore.Joy(joyConfig)
            } catch (e) {
              console.error('error occured when loading the workflow', e)
              joyConfig.data = ''
              config.joy = new imjoyCore.Joy(joyConfig)
              throw e
            }
          } else if (config.type) {
            if (!me.$refs.window_dialog.open) { me.$refs.window_dialog.showModal() }
            config.window_container = 'window-dialog-container'
            config.standalone = true
            if (config.type.startsWith('imjoy/')) {
              config.render = (wconfig) => {
              }
            }
            setTimeout(() => {
              imjoy.pm.createWindow(null, config)
                .then((api) => {
                  const _close = api.close
                  api.close = async () => {
                    await _close()
                    me.closeDialog()
                  }
                  resolve(api)
                })
                .catch(reject)
            }, 0)
          } else {
            alert('Unsupported dialog type.')
          }
        })
      }
    }

    const imjoy = new imjoyCore.ImJoy({
      imjoy_api: imjoyApi,
      show_message_callback: console.log,
      add_window_callback: (w) => {
        this.app.addWindow(w)
      },
      update_ui_callback: () => {},
      jailed_asset_url: 'https://imjoy.io/static/jailed'
    })
    imjoy.pm.imjoy_api.getPlugin = async (_plugin, pluginName) => {
      const targetPlugin = imjoy.pm.plugin_names[pluginName]
      if (targetPlugin) {
        return targetPlugin.api
      } else if (imjoy.pm.internal_plugins[pluginName]) {
        try {
          this.loading = true
          this.$forceUpdate()
          const p = await imjoy.pm.reloadPluginRecursively(
            {
              uri: imjoy.pm.internal_plugins[pluginName].uri
            },
            null,
            'eval is evil'
          )
          console.log(`${p.name} loaded.`)
          return p.api
        } catch (e) {
          console.error(e)
          throw e
        } finally {
          this.loading = false
          this.$forceUpdate()
        }
      } else if (lazyDependencies[pluginName]) {
        try {
          this.loading = true
          this.$forceUpdate()
          const p = await imjoy.pm.reloadPluginRecursively(
            {
              uri: lazyDependencies[pluginName]
            }
          )
          console.log(`${p.name} loaded.`)
          return p.api
        } catch (e) {
          console.error(e)
          throw e
        } finally {
          this.loading = false
          this.$forceUpdate()
        }
      } else {
        throw new Error(`plugin with type ${pluginName} not found.`)
      }
    }
    const workspace = getUrlParameter('workspace') || getUrlParameter('w')
    // const engine = getUrlParameter('engine') || getUrlParameter('e')

    imjoy.start({ workspace }).then(async () => {
      this.windows = imjoy.wm.windows
      console.log('ImJoy started: ', imjoy)
      this.loading = true
      await imjoy.pm.reloadPluginRecursively({ uri: 'https://raw.githubusercontent.com/imjoy-team/jupyter-engine-manager/bioengine/docs/Jupyter-Engine-Manager.imjoy.html' })
      // await imjoy.pm.reloadInternalPlugins()
      for (const k in this.apps_source) {
        try {
          const config = await imjoy.pm.getPluginFromUrl(this.apps_source[k])
          const p = await imjoy.pm.reloadPlugin(config)
          for (let i = 0; i < config.dependencies.length; i++) {
            const dConfig = await imjoy.pm.getPluginFromUrl(config.dependencies[i])
            // TODO: use a better way to determin if it's an internal plugin type
            if (imjoy.pm.getBadges(dConfig) === '🚀') {
              lazyDependencies[dConfig.name] = config.dependencies[i]
            } else {
              await imjoy.pm.reloadPluginRecursively(
                {
                  uri: config.dependencies[i]
                }
              )
            }
          }
          if (p.type !== 'window') {
            if (!this.validateBioEngineApp(p.name, p.api)) { continue }
          }
          this.apps[k] = p
        } catch (e) {
          console.error(e)
        }
      }
      this.loading = false
      this.$forceUpdate()
    })
      .catch((e) => {
        console.error(e)
        alert('Error: ' + e)
      })

    imjoy.event_bus.on('plugin_loaded', (plugin) => {

    })

    imjoy.event_bus.on('imjoy_ready', () => {

    })

    imjoy.event_bus.on('close_window', (w) => {
      if (w.window_container !== 'window-dialog-container') {
        this.show_models = true
        this.$forceUpdate()
      }
    })
    this.imjoy = imjoy
    console.log('ImJoy loaded successfully.')
  }

  async runManyModels (plugin) {
    try {
      this.loading = true
      if (plugin.type === 'window') {
        const w = await plugin.api.run()
        if (!this.validateBioEngineApp(plugin.name, w)) {
          w.runManyModels = w.run
        }
        await w.runManyModels(this.models)
      } else {
        plugin.api.runManyModels(this.models)
      }
    } catch (e) {
      this.showMessage(e)
      console.error(e)
    } finally {
      this.loading = false
    }
  }

  async runOneModel (plugin, model) {
    try {
      this.loading = true
      if (plugin.type === 'window') {
        const w = await plugin.api.run()
        this.validateBioEngineApp(plugin.name, w)
        await w.runOneModel(model)
      } else {
        plugin.api.runOneModel(model)
      }
    } catch (e) {
      this.showMessage(e)
      console.error(e)
    } finally {
      this.loading = false
    }
  }

  validateBioEngineApp (name, api) {
    if (!api.runOneModel && !api.runManyModels) {
      console.error(`${name}" has neither "runOneModel" nor "runManyModels":`, api)
      alert(`"${name}" is not a valid BioEngine App, it should define "runOneModel" and/or "runManyModels".`)
      return false
    }
    if (!api.testModel) {
      console.warn(`Please define a testModel function for "${name}".`)
    }
    return true
  }

  loadCodeFromFile (file) {
    file = file || this.local_file
    if (!file) { return }

    const reader = new FileReader()
    reader.onload = async () => {
      this.local_file = file
      try {
        const code = reader.result
        if (
          this.lastModified !== file.lastModified
        ) {
          this.lastModified = file.lastModified
          const config = this.imjoy.pm.parsePluginCode(code)
          config.dependencies = config.dependencies || []
          try {
            this.loading = true
            for (let i = 0; i < config.dependencies.length; i++) {
              await this.imjoy.pm.reloadPluginRecursively(
                {
                  uri: config.dependencies[i]
                }
              )
            }
            const plugin = await this.imjoy.pm.reloadPlugin(config)
            console.log(plugin)
            if (plugin.type !== 'window') {
              this.validateBioEngineApp(plugin.name, plugin.api)
            }
            this.apps[plugin.name] = plugin
            this.showMessage(`Plugin "${plugin.name}" loaded successfully.`)
            this.$forceUpdate()
            console.log(`Plugin "${plugin.name}" loaded successfully.`)
          } catch (error) {
            this.showMessage(`Failed to load dependencies for ${config.name}: ${error}`)
          } finally {
            this.loading = false
          }
        }
      } catch (e) {
        console.error(e)
        this.showMessage(`Failed to load plugin: ${e}`)
      }
    }
    reader.onerror = (e) => {
      console.error(e)
      this.showMessage(`Failed to load plugin: ${e}`)
      if (this.watch_timer) {
        clearInterval(this.watch_timer)
      }
      this.watch_file = false
      this.$forceUpdate()
    }
    reader.readAsText(file)
  }
}

export default ({ app }, inject) => {
  // Set the function directly on the context.app object
  app.bioengine = new BioEngine(app)
}

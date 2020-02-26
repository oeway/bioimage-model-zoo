Vue.component('label-selector', {
  props: ['all-labels'],
  template: document.getElementById('label-selector'),
});


function getThumbnail(url, tsize) {
  return new Promise((resolve, reject) => {
    var myCan = document.createElement('canvas');
    var img = new Image();
    img.src = url;
    img.crossorigin = "anonymous";
    img.onload = function () {
      myCan.width = Number(tsize);
      myCan.height = Number(tsize);
      if (myCan.getContext) {
        var cntxt = myCan.getContext("2d");
        cntxt.drawImage(img, 0, 0, myCan.width, myCan.height);
        var dataURL = myCan.toDataURL();
        resolve(dataURL)
      } else {
        reject('unable to get context')
      }
    }
    img.onerror = reject
  })

}

function randId() {
  return Math.random()
    .toString(36)
    .substr(2, 10);
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const app = new Vue({
  el: '#app',
  data: {
    models: [],
    apps_source: [],
    apps: {},
    allLabels: [],
    filters: [],
    selected_model: {},
    windows: [],
    imjoy: null,
    dialog_window: null,
    loading: false,
    lastModified: null,
    local_file: null,
    watch_timer: null,
    snack_message: null,
    snackbar: null,
    show_models: true,
    selected_window: null
  },
  computed: {
    filteredModels: function () {
      const covered = this.models.filter((model) => model.cover_image);
      const models = covered.concat(this.models.filter((model) => !model.cover_image))

      return models.filter((model) =>
        this.filters.every((label) =>
          model.allLabels.includes(label)
        )
      );

    }
  },
  created: async function () {
    
    const that = this;
    that.models = []
    try {
      let repo = 'bioimage-io/models'
      const query_repo = getUrlParameter('repo')
      let repository_url = `https://raw.githubusercontent.com/bioimage-io/models/master/manifest.model.json`
      if(query_repo){
        if(query_repo.startsWith('http') || query_repo.startsWith('/')){
          repository_url = query_repo;
        }
        else{
          repository_url = `https://raw.githubusercontent.com/${query_repo}/master/manifest.model.json`
        }
        repo = query_repo;
      }
      
      const response = await fetch(repository_url + '?' + randId())
      const repo_manifest = JSON.parse(await response.text());
      const models = repo_manifest.models;
      for (let model of models) {
        model.repo = repo;
        model.url = model.url;
        model.model_uri = `${repo}:${model.name}`;
        model.source_url = model.url;
        if(!model.config_url.startsWith('http'))
        model.config_url = model.root_url+'/'+model.config_url
      }
      that.models = that.models.concat(models);
      that.apps_source = repo_manifest.applications;
    } catch (e) {
      console.error(e)
      alert(`Failed to fetch manifest file from the repo: ${e}.`)
    }
    
    that.models.forEach((model) => {
      model.allLabels = model.labels || [];
      if (!!model.license) {
        model.allLabels.push(model.license);
      }
      if (model.tags) {
        model.allLabels = model.allLabels.concat(model.tags);
      }
      if (model.covers) {
        model.cover_image = model.covers[0]
      } else {
        model.cover_image = ''
      }
    });
    that.models.forEach((model) => {
      model.allLabels.forEach((label) => {
        if (that.allLabels.indexOf(label) === -1) {
          that.allLabels.push(label);
        }
      });
    });
    that.allLabels.sort((a, b) =>
      a.toLowerCase() < b.toLowerCase() ? -1 : 1
    );
    
    if (!that.$refs.model_info_dialog.showModal) {
      dialogPolyfill.registerDialog(that.$refs.model_info_dialog);
    }

    if (!that.$refs.window_dialog.showModal) {
      dialogPolyfill.registerDialog(that.$refs.window_dialog);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ()=>{
        console.log('Loading ImJoy...')
        that.loadImJoy();
        that.showModelInfo();
        this.snackbar = new window.PatchedMaterialSnackbar(this.$refs.message_snackbar)
      });
    } else {  // `DOMContentLoaded` already fired
      console.log('Loading ImJoy...')
      that.loadImJoy();
      that.showModelInfo();
      this.snackbar = new window.PatchedMaterialSnackbar(this.$refs.message_snackbar)
    }

  },
  mounted(){
    
  },
  methods: {
    showModelInfo(){
      const selected_model = getUrlParameter('model');
      if(selected_model){
        const m = this.models.filter(model=>model.name===selected_model)[0]
        if(m) this.showInfo(m)
      }
    },
    etAl: (authors) => {
      authors = authors.map((author)=>{
        return author.split(';')[0]
      })
      if (authors.length < 3) {
        return authors.join(", ");
      } else {
        return authors.slice(0, 3).join(", ") + " et al.";
      }
    },
    showMessage(message, duration){
      duration = duration || 5000;
      const data = {
        message: message,
        actionHandler: function(event) {},
        actionText: 'Close',
        timeout: duration
      };
      this.snackbar.hideSnackbar();
      setTimeout(()=>{
        this.snackbar.showSnackbar(data);
      }, 30)
    },
    async getDocs(model) {
      if (model.docs) return;
      model.docs = '@loading...';
      this.$forceUpdate();
      const response = await fetch(model.root_url+'/'+model.documentation+'?'+randId())
      const raw_docs = await response.text();
      if (raw_docs && window.marked && window.DOMPurify) {
        model.docs = window.DOMPurify.sanitize(window.marked(raw_docs))
        model.source_code = source_code;
      } else {
        model.docs = null;
        model.source_code = null;
      }
      this.$forceUpdate();
    },
    share(model) {
      prompt('Please copy and paste following URL for sharing:', 'https://bioimage.io/?model=' + model.model_uri)
    },
    showInfo(model) {
      this.selected_model = model;
      this.$refs.model_info_dialog.showModal();
      this.getDocs(model)
    },
    closeInfo() {
      this.$refs.model_info_dialog.close();
    },
    addRemoveToFilters(label) {
      if (this.filters.indexOf(label) === -1) {
        this.filters.push(label);
      } else {
        this.filters = this.filters
          .filter((x) => x !== label);
      }
    },
    checkActive(label) {
      return this.filters.indexOf(label) > -1;
    },
    clearAllFilters() {
      this.filters = [];
    },
    getLabelCount(label) {
      return this.filteredModels
        .filter((models) => models.allLabels.includes(label))
        .length;

    },
    getModelsCount() {
      return this.filteredModels.length
    },
    addWindow(w){
      this.selectWindow(w)
      this.show_models = false;
      this.selected_window = w;
    },
    async removeWindow(w){
      w.closing = true;
      await w.close()
      this.show_models = true;
      this.selected_window = null;
      this.$forceUpdate()
    },
    selectWindow(w){
      if(w.closing) return
      this.selected_window = w;
      this.show_models = false;
    },
    closeDialog(){
      this.$refs.window_dialog.close()
    },
    loadImJoy(){
      const me = this;
      var imjoy_api = {
        showStatus(plugin, info){
            me.showMessage(info)
        },
        showMessage(plugin, info, duration){
            me.showMessage(info, duration)
        },
        showProgress(plugin, progress){
            if (progress < 1) progress =  progress * 100;
            me.$refs.progressbar.setProgress(progress);
        },
        showDialog(_plugin, config) {
            return new Promise((resolve, reject) => {
                me.dialog_window = config;
                me.$forceUpdate()
                if (config.ui) {
                  if(!me.$refs.window_dialog.open)
                  me.$refs.window_dialog.showModal();
                  const joy_config = {
                      container:  document.getElementById('window-dialog-container'),
                      init: config.ui || "", //"{id:'localizationWorkflow', type:'ops'} " + // a list of ops
                      data: config.data, // || Joy.loadFromURL(),
                      modules: config.modules || ["instructions", "math"],
                      onexecute: config.onexecute,
                      onupdate: config.onupdate,
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
                  if(!me.$refs.window_dialog.open)
                  me.$refs.window_dialog.showModal();
                  config.window_container = "window-dialog-container";
                  config.standalone = true;
                  if (config.type.startsWith("imjoy/")) {
                      config.render = wconfig => {
                      };
                  }
                  setTimeout(() => {
                      imjoy.pm.createWindow(null, config)
                      .then(api => {
                          
                          const _close = api.close;
                          api.close = async () => {
                              await _close();
                              me.closeDialog();
                          };
                          resolve(api);
                      })
                      .catch(reject);
                  }, 0);
              } else {
                  alert("Unsupported dialog type.");
              }
            });
        },
      }

      const imjoy = new imjoyCore.ImJoy({
          imjoy_api: imjoy_api,
          show_message_callback: console.log,
          add_window_callback: async (w)=>{
              this.addWindow(w)
          },
          update_ui_callback: ()=>{},
          jailed_asset_url: 'https://imjoy.io/static/jailed'
      })
      const workspace = getUrlParameter('workspace') || getUrlParameter('w');
      const engine = getUrlParameter('engine') || getUrlParameter('e');

      imjoy.start({workspace: workspace}).then(async ()=>{
          this.windows = imjoy.wm.windows
          console.log('ImJoy started: ', imjoy)
          if (engine) {

          }
          this.loading = true;
          await imjoy.pm.reloadInternalPlugins()
          for(let k in this.apps_source){
            try{
              const p = await imjoy.pm.reloadPluginRecursively({uri: this.apps_source[k]})
              if(p.type !== 'window'){
                if(!p.api.runOneModel && !p.api.runManyModels){
                  console.error(`${p.name}" has neither "runOneModel" nor "runManyModels":`, p.api)
                  alert(`"${p.name}" is not a valid BioEngine App, it should define "runOneModel" and/or "runManyModels".`)
                  continue;
                }
                if(!p.api.testModel){
                  console.warn(`Please define a testModel function for "${p.name}".`)
                }
              }
              this.apps[k] = p
            }
            catch(e){
              console.error(e)
            }
          }
          this.loading = false;
          this.$forceUpdate()

          
      })
      .catch((e)=>{
          console.error(e)
          alert('Error: '+ e)
      })

      imjoy.event_bus.on("plugin_loaded", (plugin) => {

      })

      imjoy.event_bus.on("imjoy_ready", () => {

      })
      
      imjoy.event_bus.on("close_window", (w) => {
        if(w.window_container !== "window-dialog-container"){
          this.show_models = true;
          this.$forceUpdate()
        }
      })
      this.imjoy = imjoy;
      console.log('ImJoy loaded successfully.')
    },
    async runManyModels(plugin){
      if(plugin.type === 'window'){
        const w = await plugin.api.run()
        await w.runManyModels(this.models)
      }
      else{
        plugin.api.runManyModels(this.models)
      }
      
    },
    async runOneModel(plugin, model){
      if(plugin.type === 'window'){
        const w = await plugin.api.run()
        await w.runOneModel(model)
      }
      else{
        plugin.api.runOneModel(model)
      }
    },
    fileSelected(){
      this.lastModified = null;
      if (!this.$refs.file_select.files) return;
      this.local_file = this.$refs.file_select.files[0];
      this.lastModified = "old";
      this.showMessage('Loading App...');
      this.watch_timer = setInterval(() => {
        this.$forceUpdate();
        this.loadCodeFromFile(this.local_file);
      }, 1000);
      this.loadCodeFromFile(this.local_file);
    },
    loadCodeFromFile(file) {
      file = file || this.local_file;
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        this.local_file = file;
        try {
          const code = reader.result;
          if (
            this.lastModified != file.lastModified
          ) {
            this.lastModified = file.lastModified;
            const config = this.imjoy.pm.parsePluginCode(code);
            config.dependencies = config.dependencies || [];
            try {
              for (let i = 0; i < config.dependencies.length; i++) {
                await this.imjoy.pm.reloadPluginRecursively(
                  {
                    uri: config.dependencies[i]
                  }
                );
              }
              const plugin = await this.imjoy.pm.reloadPlugin(config)
              console.log(plugin)
              this.apps[plugin.name] = plugin;
              this.showMessage(`Plugin "${plugin.name}" loaded successfully.`)
              this.$forceUpdate()
              console.log(`Plugin "${plugin.name}" loaded successfully.`)
            } catch (error) {
              this.showMessage(`Failed to load dependencies for ${config.name}: ${error}`);
            }
          }
        } catch (e) {
          console.error(e)
          this.showMessage(`Failed to load plugin: ${error}`);
        }
      };
      reader.onerror = e => {
        console.error(e);
        this.showMessage(`Failed to load plugin: ${e}`);
        if (this.watch_timer) {
          clearInterval(this.watch_timer);
        }
        this.watch_file = false;
        this.$forceUpdate();
      };
      reader.readAsText(file);
    },
  }
});
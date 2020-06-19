<template>
  <div class="container content-wrapper">
    <section class="center ">
      <b-field style="max-width: calc(100vw - 10px);" @keyup.enter="search">
        <b-taginput
          :loading="loading"
          type="is-info"
          allow-new
          style="width:500px;"
          :data="filteredTags"
          :open-on-focus="true"
          autocomplete
          @input="updateSelectedTags"
          @typing="getFilteredTags"
          v-model="selectedTags"
          ellipsis
          icon="magnify"
          placeholder="Type a keyword and press enter"
        >
          <template slot-scope="props">
            {{ props.option }}
          </template>
        </b-taginput>
        <b-dropdown aria-role="list" position="is-bottom-left">
          <button class="button tags-button" slot="trigger">
            <span>Tags</span>
            <b-icon icon="menu-down"></b-icon>
          </button>

          <div class="dropdown-panel" aria-role="listitem">
            <div class="container" style="max-width:100%;">
              <div class="field">
                <b-switch v-model="matchingAll"
                  >Match: {{ matchingAll ? " All" : "Any" }}</b-switch
                >
              </div>

              <div
                class="column"
                v-for="(tags, name) in categories.grouped"
                :key="name"
              >
                {{ name }}: <br />
                <a @click="addTagSelection(t)" v-for="t in tags" :key="t">
                  <b-tag style="cursor: pointer;" rounded>{{ t }}</b-tag>
                </a>
              </div>

              <div class="column">
                other:
                <br />
                <b-tag
                  rounded
                  @click="addTagSelection(t)"
                  style="cursor: pointer;"
                  v-for="t in categories.other"
                  :key="t"
                  >{{ t }}</b-tag
                >
              </div>
            </div>
          </div>
        </b-dropdown>
        <!-- <button style="height:36px;" class="button is-primary">Search</button> -->
      </b-field>
      <b-field> </b-field>
    </section>
    <br />

    <section style="width:600px;"></section>
  </div>
</template>

<script>
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
const categories = {
  modality: ["widefield", "confocal", "SR", "EM", "TEM", "cryoEM"],
  content: [
    "extracellular vesicles",
    "platynereis",
    "arabidopsis",
    "platynereis",
    "vasculature",
    "plant tissue",
    "cell membrane",
    "brain"
  ],
  framework: ["Tensorflow", "PyTorch", "Tensorflow.js"],
  software: ["Ilastik", "ImageJ", "Fiji", "ImJoy", "DeepImageJ", "n2v"],
  network: [
    "UNet",
    "UNet2D",
    "UNet3D",
    "DenseNet",
    "ResNet",
    "Inception",
    "Shufflenet"
  ],
  task: [
    "segmentation",
    "nucleus-segmentation",
    "classification",
    "denoising",
    "in-silico-labeling"
  ]
};
export default {
  name: "ModelSelector",
  props: {
    models: {
      type: Array,
      default: null
    },
    fullLabelList: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      selectedTags: [],
      filteredTags: [],
      loading: false,
      matchingAll: true
    };
  },
  watch: {
    // whenever question changes, this function will run
    selectedTags: function(newTags) {
      if (!this.models) return;
      const knownTags = newTags.filter(
        tag => this.fullLabelList.indexOf(tag) >= 0
      );
      let selectedModels;
      if (newTags.length <= 0) {
        selectedModels = this.models;
      } else {
        selectedModels = this.models.filter(model => {
          let matched;
          if (this.matchingAll)
            matched =
              knownTags.length > 0 &&
              knownTags.every(label => model.allLabels.includes(label));
          else
            matched =
              knownTags.length > 0 &&
              knownTags.some(label => model.allLabels.includes(label));
          const matchText = label => {
            label = label.replace(/-/g, "").toLowerCase(); // remove dash for U-Net vs UNet
            return (
              model.name
                .replace(/-/g, "")
                .toLowerCase()
                .includes(label) ||
              model.description
                .replace(/-/g, "")
                .toLowerCase()
                .split(/[ .:;?!~,`"&|()<>{}[\]\r\n/\\]+/)
                .includes(label) ||
              model.authors.some(author => author.toLowerCase().includes(label))
            );
          };

          if (this.matchingAll)
            return (
              (knownTags.length <= 0 || matched) &&
              newTags.length > 0 &&
              newTags.every(matchText)
            );
          else
            return (
              (knownTags.length <= 0 || matched) &&
              newTags.length > 0 &&
              newTags.some(matchText)
            );
        });
      }
      this.loading = true;
      debounce(() => {
        this.$emit("selection-changed", selectedModels);
        this.loading = false;
        this.$forceUpdate();
      }, 400)();
    }
  },
  mounted() {
    this.filteredTags = this.fullLabelList;
  },
  computed: {
    categories() {
      const cate = {};
      const other = [];
      const lowerSelected = this.selectedTags.map(a => a.toLowerCase());
      for (let t of this.fullLabelList) {
        if (lowerSelected.indexOf(t.toLowerCase()) >= 0) continue;
        let found = false;
        for (let c of Object.keys(categories)) {
          for (let k of categories[c]) {
            if (k.toLowerCase() === t.toLowerCase()) {
              if (!cate[c]) cate[c] = [];
              cate[c].push(k);
              found = true;
              break;
            }
          }
        }
        if (!found) {
          other.push(t);
        }
      }

      return { grouped: cate, other: other };
    }
  },
  methods: {
    updateSelectedTags() {
      this.filteredTags = this.fullLabelList.filter(label => {
        return this.selectedTags.indexOf(label) < 0;
      });
    },
    getFilteredTags(text) {
      this.filteredTags = this.fullLabelList.filter(label => {
        return label.toLowerCase().indexOf(text.toLowerCase()) >= 0;
      });
    },
    addTagSelection(tag) {
      if (this.selectedTags.indexOf(tag) < 0) this.selectedTags.push(tag);
    }
  }
};
</script>
<style scoped>
.container {
  width: 800px;
}
.dropdown-panel {
  width: 100%;
  max-width: 580px;
  padding: 15px;
  height: 400px;
  overflow-y: scroll;
  max-height: 100vh;
}
.card {
  height: 360px;
}
.card-content {
  padding: 1rem;
}
.model-title {
  font-size: 1.2em;
  font-weight: 400;
}
.authors {
  font-size: 0.9em;
  font-weight: 600;
}
.model-description {
  font-size: 0.9em;
}
.action-btn {
  width: 33px;
}
.floating-buttons {
  position: absolute;
  left: 5px;
  top: 5px;
}
.app-icons {
  width: 26px !important;
  max-width: 26px;
  padding-top: 5px;
}
.button.is-small {
  border-radius: 30px;
  font-size: 1rem;
  background-color: #d2ebffc7;
  color: rgb(25, 25, 26);
}
.card-image {
  max-height: 200px;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.tag:hover {
  background: #2196f3 !important;
  color: white;
}
.tags-button {
  top: 1px;
  height: 34px;
  left: 4px;
  text-transform: none;
}
</style>

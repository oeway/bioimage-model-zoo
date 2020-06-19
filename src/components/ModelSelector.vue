<template>
  <div class="container content-wrapper">
    <section class="center ">
      <b-field>
        <b-taginput
          style="width:500px;"
          :data="filteredTags"
          :open-on-focus="true"
          autocomplete
          @add="updateSelectedTags"
          @typing="getFilteredTags"
          v-model="selectedTags"
          ellipsis
          icon="magnify"
          placeholder="Add keywords"
        >
          <template slot-scope="props">
            {{ props.option }}
          </template>
        </b-taginput>
        <b-dropdown aria-role="list">
          <button class="button" style="height:36px;" slot="trigger">
            <span>Tags</span>
            <b-icon icon="menu-down"></b-icon>
          </button>

          <div class="dropdown-panel" aria-role="listitem">
            <div class="container">
              <div
                class="columns"
                v-for="(tags, name) in categories.grouped"
                :key="name"
              >
                <div class="column">
                  {{ name }}: <br />
                  <a @click="addTagSelection(t)" v-for="t in tags" :key="t">
                    <b-tag style="cursor: pointer;" rounded>{{ t }}</b-tag>
                  </a>
                </div>
              </div>
              <div class="columns">
                <div class="column">
                  other:
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
      filteredTags: []
    };
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
  width: 300px;
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
</style>

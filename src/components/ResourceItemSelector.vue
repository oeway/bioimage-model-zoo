<template>
  <div class="container content-wrapper">
    <section class="center">
      <b-field
        style="max-width: calc(100vw - 10px); margin-bottom: 20px"
        @keyup.enter="search"
      >
        <div
          style="
            position: absolute;
            top: 36px;
            left: 50%;
            transform: translate3d(-50%, 0, 0);
          "
        >
          <a
            style="margin: 3px"
            @click="selectedTags = [tag]"
            v-for="(tag, k) in commonTags"
            :key="tag"
            >{{ tag }}{{ k === commonTags.length - 1 ? "" : "," }}</a
          >
        </div>
        <b-taginput
          :loading="loading"
          type="is-info"
          allow-new
          class="searchbar"
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
            <span>Tags & Filters</span>
            <b-icon icon="menu-down"></b-icon>
          </button>

          <div class="dropdown-panel" aria-role="listitem">
            <div class="container" style="max-width: 100%">
              <div class="field">
                <b-switch v-model="matchingAll"
                  >Match: {{ matchingAll ? " All" : "Any" }}</b-switch
                >
                <b-switch v-model="freeTextMode"
                  >Free text:
                  {{ freeTextMode ? " Enabled" : "Disabled" }}</b-switch
                >
                <b-tooltip
                  label="⚠️Include unverified resource items contributed by users on Zenodo."
                  position="is-bottom"
                >
                  <b-switch v-model="includeWilderness"
                    >Include wilderness:
                    {{ includeWilderness ? " Yes" : "No" }}</b-switch
                  >
                </b-tooltip>
              </div>

              <div
                class="column"
                v-for="(tags, name) in categories.grouped"
                :key="name"
              >
                {{ name }}: <br />
                <a
                  @click="addTagSelection(t)"
                  style="display: inline-block"
                  v-for="t in tags"
                  :key="t"
                >
                  <b-tag style="cursor: pointer" rounded>{{ t }}</b-tag>
                </a>
              </div>

              <div class="column">
                <span v-if="Object.keys(categories.grouped).length > 0"
                  >other: <br
                /></span>
                <a
                  @click="addTagSelection(t)"
                  v-for="t in categories.other"
                  :key="t"
                  style="display: inline-block"
                >
                  <b-tag rounded style="cursor: pointer">{{ t }}</b-tag>
                </a>
              </div>
            </div>
          </div>
        </b-dropdown>
        <b-field class="display-mode-btn" v-if="showDisplayMode">
          <p class="control">
            <b-tooltip label="Display mode: list" position="is-top">
              <button
                class="button"
                :class="{ 'is-primary': displayMode === 'list' }"
                @click="switchDisplayMode('list')"
                style="top: 1px; height: 34px"
              >
                <b-icon icon="format-list-bulleted"></b-icon>
              </button>
            </b-tooltip>
          </p>
          <p class="control">
            <b-tooltip label="Display mode: card" position="is-top">
              <button
                class="button"
                :class="{ 'is-primary': displayMode === 'card' }"
                @click="switchDisplayMode('card')"
                style="top: 1px; height: 34px"
              >
                <b-icon icon="view-grid"></b-icon>
              </button>
            </b-tooltip>
          </p>
        </b-field>
        <!-- <button style="height:36px;" class="button is-primary">Search</button> -->
      </b-field>
    </section>
  </div>
</template>

<script>
import { debounce } from "../utils";
import { mapState } from "vuex";
export default {
  name: "ResourceItemSelector",
  props: {
    allItems: {
      type: Array,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    fullLabelList: {
      type: Array,
      default: null,
    },
    tagCategories: {
      type: Object,
      default: null,
    },
    showDisplayMode: {
      type: Boolean,
      default: false,
    },
    searchTags: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      selectedTags: [],
      filteredTags: [],
      loading: false,
      matchingAll: true,
      freeTextMode: true,
      includeWilderness: true,
      displayMode: "card",
    };
  },
  watch: {
    type: function (newType) {
      if (!this.allItems) return;
      this.type = newType;
      this.applySearch(this.selectedTags);
    },
    selectedTags: function (newTags) {
      this.applySearch(newTags);
    },
    allItems: function () {
      this.applySearch(this.selectedTags);
    },
    searchTags: function (newTags) {
      if (!newTags) {
        this.selectedTags = [];
        return;
      }
      const is_same =
        newTags &&
        newTags.length == this.selectedTags.length &&
        newTags.every((element, index) => {
          return element === this.selectedTags[index];
        });
      if (is_same) return;
      newTags = newTags.filter((tag) => tag && tag.trim() != "");
      this.selectedTags = Array.from(new Set(newTags));
    },
  },
  mounted() {
    this.filteredTags = this.fullLabelList;
  },
  computed: {
    commonTags() {
      return (
        this.siteConfig.resource_categories.filter(
          (cat) => cat.type === this.type
        )[0]?.common_tags || []
      );
    },
    categories() {
      if (!this.tagCategories) {
        return { grouped: {}, other: this.fullLabelList };
      }
      const cate = {};
      const other = [];
      const lowerSelected = this.selectedTags.map((a) => a.toLowerCase());
      for (let t of this.fullLabelList) {
        if (lowerSelected.indexOf(t.toLowerCase()) >= 0) continue;
        let found = false;
        for (let c of Object.keys(this.tagCategories)) {
          for (let k of this.tagCategories[c]) {
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
    },
    ...mapState({
      siteConfig: (state) => state.siteConfig,
    }),
  },
  methods: {
    applySearch(newTags) {
      if (!this.allItems) return;
      this.$emit("tags-updated", newTags);
      this.loading = true;

      debounce(() => {
        let selectedItems;
        const items = this.type
          ? this.allItems.filter((m) => m.type === this.type)
          : this.allItems;
        if (newTags.length <= 0) {
          selectedItems = items;
        } else {
          const knownTags = newTags.filter(
            (tag) => this.fullLabelList.indexOf(tag.toLowerCase()) >= 0
          );
          selectedItems = items.filter((item) => {
            let matched;
            if (this.matchingAll)
              matched =
                knownTags.length > 0 &&
                knownTags.every((label) =>
                  item.allLabels.includes(label.toLowerCase())
                );
            else
              matched =
                knownTags.length > 0 &&
                knownTags.some((label) =>
                  item.allLabels.includes(label.toLowerCase())
                );
            const matchText = (label) => {
              label = label.replace(/-/g, "").toLowerCase(); // remove dash for U-Net vs UNet

              return (
                item.name.replace(/-/g, "").toLowerCase().includes(label) ||
                (item.description &&
                  item.description
                    .replace(/-/g, "")
                    .toLowerCase()
                    .split(/[ .:;?!~,`"&|()<>{}[\]\r\n/\\]+/)
                    .includes(label)) ||
                (item.authors &&
                  item.authors.some((author) =>
                    author.name.toLowerCase().includes(label)
                  )) ||
                (item.apps &&
                  item.apps.some(
                    (app) => app.name && app.name.toLowerCase().includes(label)
                  ))
              );
            };
            return (
              (!this.type || item.type === this.type) &&
              (matched || (this.freeTextMode && newTags.every(matchText)))
            );
          });
        }

        this.$emit("selection-changed", selectedItems);
        this.loading = false;
        this.$forceUpdate();
      }, 400)();
    },
    switchDisplayMode(mode) {
      if (this.displayMode !== mode) {
        this.displayMode = mode;
        this.$emit("display-mode-change", mode);
      }
    },
    updateSelectedTags() {
      this.$emit("input-change");
      this.filteredTags = this.fullLabelList.filter((label) => {
        return this.selectedTags.indexOf(label) < 0;
      });
    },
    getFilteredTags(text) {
      this.filteredTags = this.fullLabelList.filter((label) => {
        return label.toLowerCase().indexOf(text.toLowerCase()) >= 0;
      });
    },
    addTagSelection(tag) {
      if (this.selectedTags.indexOf(tag) < 0) this.selectedTags.push(tag);
    },
  },
};
</script>
<style scoped>
.container {
  width: 860px;
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
.searchbar {
  width: 500px;
  max-width: calc(100% - 110px);
  margin-left: 10px;
  border-style: solid;
  border-width: 3px;
  border-color: #2196f3;
  height: 42px;
  margin-top: -3px;
}
.display-mode-btn {
  top: 1px;
  margin-left: 7px;
  height: 34px;
}
</style>

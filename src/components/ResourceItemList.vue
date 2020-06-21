<template>
  <div class="resource-item-list">
    <div class="container content-wrapper">
      <div class="columns is-multiline">
        <div
          v-for="item in allItems"
          :key="item.name"
          class="column is-4-desktop is-3-widescreen is-half-tablet"
        >
          <resource-item-card
            @show-info="showResourceItemInfo"
            :resourceItem="item"
          ></resource-item-card>
        </div>
        <span
          style="text-align: center;"
          class="column"
          v-if="allItems && allItems.length === 0"
          >The list is empty.</span
        >
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import ResourceItemCard from "./ResourceItemCard";

Vue.component("label-selector", {
  props: ["all-labels"],
  template: document.getElementById("label-selector")
});

export default {
  name: "ResourceItemList",
  components: { "resource-item-card": ResourceItemCard },
  props: {
    allItems: {
      type: Array,
      default: null
    }
  },
  computed: {
    filteredItems: function() {
      const covered = this.allItems.filter(item => item.cover_image);
      const items = covered.concat(
        this.allItems.filter(item => !item.cover_image)
      );
      return items.filter(item =>
        this.filters.every(label => item.allLabels.includes(label))
      );
    }
  },
  data() {
    return {};
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    showResourceItemInfo(minfo) {
      this.$emit("show-resource-item-info", minfo);
    }
  }
};
</script>

<style lang="css">
.resource-item-list {
  min-height: 50vh;
}
</style>

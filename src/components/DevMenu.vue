<template>
  <b-dropdown
    :triggers="['hover']"
    v-if="devPlugins && devPlugins.length > 0"
    aria-role="list"
  >
    <template #trigger>
      <b-button rounded class="is-small action-btn">
        <b-icon icon="dev-to" size="is-small"> </b-icon>
      </b-button>
    </template>
    <b-dropdown-item
      aria-role="listitem"
      @click="runPlugin(p)"
      v-for="p in devPlugins"
      :key="p.id"
      >{{ p.name }}</b-dropdown-item
    >
  </b-dropdown>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "dev-menu",
  props: ["resourceItem"],
  computed: {
    ...mapState({
      devPlugins: (state) => state.devPlugins,
      resourceItems: (state) => state.resourceItems,
    }),
  },
  methods: {
    async runPlugin(plugin) {
      if (this.resourceItem) {
        await plugin.api.run({
          config: {
            referer: window.location.href,
            mode: "one",
            type: "bioengine",
          },
          data: this.resourceItem,
        });
      } else {
        await plugin.api.run({
          config: {
            referer: window.location.href,
            mode: "all",
            type: "bioengine",
          },
          data: this.resourceItems,
        });
      }
    },
    showLoader(enable) {
      if (enable)
        this.loadingComponent = this.$buefy.loading.open({
          canCancel: true,
          container: this.$el,
        });
      else {
        if (this.loadingComponent) {
          this.loadingComponent.close();
          this.loadingComponent = null;
        }
      }
    },
  },
};
</script>
<style scoped>
.action-btn {
  width: 33px;
}
.action-btn .icon {
  font-size: 1.4rem;
}
</style>

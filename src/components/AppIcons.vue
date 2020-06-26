<template>
  <div v-if="apps" class="app-icons">
    <template v-for="app in apps">
      <b-tooltip
        :class="{ 'hover-show': app.show_on_hover && enableHover }"
        :key="app.name"
        :label="app.name"
        position="is-bottom"
      >
        <b-button
          rounded
          tag="a"
          :href="app.url"
          target="_blank"
          @click="!app.url && app.run && app.run()"
          class="is-small action-btn"
        >
          <b-icon v-if="!app.icon" icon="puzzle" size="is-small"> </b-icon>
          <img
            v-else-if="app.icon.startsWith('http')"
            class="app-icon"
            :src="app.icon"
            :alt="app.name"
          />
          <b-icon v-else :icon="app.icon" size="is-small"> </b-icon>
        </b-button>
      </b-tooltip>
    </template>
  </div>
</template>

<script>
export default {
  name: "AppIcons",
  props: {
    apps: {
      type: Array,
      default: null
    },
    enableHover: {
      type: Boolean,
      default: false
    }
  }
};
</script>
<style scoped>
.app-icons {
  margin-top: 5px;
  margin-left: 5px;
  display: inline-block;
}
.app-icon {
  width: 20px !important;
  max-width: 20px;
  transform: translateY(2px);
}
.action-btn {
  width: 33px;
}
.action-btn .icon {
  font-size: 1.4rem;
}

.button.is-small {
  border-radius: 30px;
  font-size: 0.8rem;
  background-color: rgba(255, 255, 255, 0.85);
  color: #2196f3;
}
</style>

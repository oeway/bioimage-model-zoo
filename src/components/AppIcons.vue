<template>
  <div v-if="apps">
    <template v-for="app in apps">
      <b-tooltip
        :class="{ 'hover-show': app.show_on_hover && !isTouchDevice }"
        :key="app.name"
        :label="app.name"
        position="is-top"
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
const isTouchDevice = (function() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
})();
export default {
  name: "AppIcons",
  props: {
    apps: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      isTouchDevice: isTouchDevice
    };
  }
};
</script>
<style scoped>
.app-icon {
  width: 22px !important;
  max-width: 22px;
  margin-top: 3px;
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

<template>
  <div v-if="badges">
    <a
      class="badge"
      v-for="badge in badges"
      :key="badge.label"
      :href="badge.url"
      target="_blank"
      @click="!badge.url && badge.run && badge.run()"
    >
      <b-taglist v-if="!badge.icon" attached rounded>
        <b-tag :type="badge.label_type || 'is-dark'">{{ badge.label }}</b-tag>
        <b-tag :type="badge.ext_type || 'is-success'" v-if="badge.ext">{{
          badge.ext
        }}</b-tag>
      </b-taglist>

      <img v-else class="badge-img" :alt="badge.label" :src="badge.icon" />
    </a>
  </div>
</template>

<script>
export default {
  name: "Badges",
  props: {
    badges: {
      type: Array,
      default: null
    }
  }
};
</script>
<style scoped>
a.badge {
  display: inline-block;
  padding: 1px;
}

/* TODO: fix the badge position */
.badge-img {
  position: relative;
  transform: translateY(30%);
}

.badge {
  display: inline-block;
  padding: 1px;
  margin-top: -5px;
  margin-bottom: -5px;
}

.tags:not(:last-child) {
  margin-bottom: -10px;
}
</style>

<template>
  <div class="model-info">
    <div class="container" style="padding: 15px;">
      <h1>{{ model.name }}</h1>
      <p>{{ model.description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModelInfo",
  props: {
    model: {
      type: Object,
      default: null
    }
  },
  methods: {}
};
</script>
<style scoped></style>

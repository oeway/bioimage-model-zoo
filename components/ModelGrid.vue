<template>
  <div class="model-grid">
    <model-card v-for="model in models" :key="model.name" />
  </div>
</template>

<script>
import ModelCard from '~/components/ModelCard.vue'

export default {
  name: 'ModelGrid',
  components: { ModelCard },
  asyncData (context) {
    context.app.repository.init()
    return { models: context.app.repository.models }
  }
}
</script>

<style>

</style>

<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <model-grid />
    </v-flex>
  </v-layout>
</template>

<script>

import ModelGrid from '~/components/ModelGrid.vue'
export default {
  components: { ModelGrid }
}
</script>

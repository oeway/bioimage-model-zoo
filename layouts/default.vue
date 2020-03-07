<template>
  <v-app id="keep">
    <v-app-bar app clipped-left color="black">
      <v-app-bar-nav-icon />
      <span class="title ml-3 mr-5">BioImage.IO</span>
      <v-text-field
        solo-inverted
        flat
        hide-details
        label="Search"
        prepend-inner-icon="search"
      />

      <v-spacer />
    </v-app-bar>

    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  props: {},
  data: () => {
    return { drawer: false }
  }
}
</script>

<style>
#keep .v-navigation-drawer__border {
  display: none;
}
</style>

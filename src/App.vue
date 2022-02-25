<template>
  <div>
    <!-- Navigation bar -->
    <nav class="navbar is-link is-fixed-top">
      <div class="navbar-brand">
        <a href="#/">
          <img
            style="width: 264px; margin-left: 8px; margin-top: 6px"
            :src="siteConfig.site_logo"
          />
        </a>
        <!-- <span v-if="selectedPartner" class="site-title hide-on-small-screen"
          >| {{ selectedPartner.name }}</span
        > -->
        <div
          class="navbar-burger burger"
          :class="{ 'is-active': showMenu }"
          data-target="navbarExampleTransparentExample"
          @click="showMenu = !showMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div
        id="navbarExampleTransparentExample"
        :class="{ 'is-active': showMenu }"
        class="navbar-menu"
      >
        <div class="navbar-end">
          <!-- <a
            class="navbar-item"
            target="_blank"
            v-if="siteConfig.contribute_url"
            :href="siteConfig.contribute_url"
          >
            <b-icon icon="plus"></b-icon>
            <span>Contribute</span>
          </a> -->
          <a class="navbar-item" href="#/upload">
            <b-icon icon="plus"></b-icon>
            <span>Upload</span>
          </a>
          <a class="navbar-item" href="/docs">
            <b-icon icon="playlist-check"></b-icon>
            <span>Documentation</span>
          </a>
          <a class="navbar-item" href="#/about">
            <b-icon icon="information-outline"></b-icon>
            <span>About</span>
          </a>
          <a class="navbar-item" id="imjoy-menu"> </a>
        </div>
      </div>
    </nav>
    <!-- Header -->
    <router-view :style="{ marginTop: showNavbar ? '64px' : '0px' }" />
  </div>
</template>
<script>
import { mapState } from "vuex";
import { setupBioEngine } from "./bioEngine";

export default {
  name: "App",
  data() {
    return {
      showMenu: false,
    };
  },
  computed: {
    ...mapState({
      showNavbar: (state) => state.showNavbar,
      siteConfig: (state) => state.siteConfig,
    }),
  },
  mounted() {
    setupBioEngine()
      .then(() => {
        this.$store.commit("setBioEngineReady", true);
      })
      .catch((e) => {
        console.error(e);
        this.$store.commit("setBioEngineReady", false);
      });
  },
};
</script>

<style>
html,
body {
  overflow: auto !important;
  width: 100vw;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  background: #ffffff;
  overscroll-behavior-y: none;
}
#app {
  background: white;
}
.card {
  margin-bottom: 3rem;
}
.content-wrapper {
  margin-top: 3rem;
}
.card-footer-item {
  font-size: 12px;
  font-weight: normal;
}
.card-header-title {
  display: block;
}
.card-content p {
  margin-bottom: 2rem;
}
.container {
  max-width: 95%;
}
.fa-code,
.fa-search {
  margin-right: 0.5vw;
}

.width-limited {
  max-width: 1080px;
  margin-left: auto !important;
  margin-right: auto !important;
  float: none !important;
}
</style>

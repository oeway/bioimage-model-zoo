<template>
  <div class="about">
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">About {{ siteConfig.site_name }}</h1>
          <h2 class="subtitle">v{{ version }}</h2>
        </div>
      </div>
    </section>
    <img class="background-img" :src="siteConfig.background_image" />
    <br />

    <div class="columns is-mobile is-centered" v-if="siteConfig.footer">
      <div
        v-for="item in siteConfig.footer"
        :key="item.label"
        class="column is-one-quarter"
        style="text-align: center"
      >
        <b-tooltip :label="item.tooltip" position="is-top"
          ><a :href="item.url" target="_blank">
            <img :src="item.logo" style="height: 55px;" />
          </a>
        </b-tooltip>
      </div>
    </div>
    <div style="text-align: center" v-if="siteConfig.footnote">
      <p>{{ siteConfig.footnote }}</p>
    </div>
  </div>
</template>
<script>
import siteConfig from "../../site.config.json";
import { version } from "../../package.json";
export default {
  name: "About",
  data() {
    return {
      version,
      siteConfig
    };
  }
};
</script>
<style scoped>
.hero {
  max-width: 100%;
  width: 600px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
.background-img {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 90%;
  max-height: 50%;
  max-width: 100%;
  object-fit: contain;
}
</style>

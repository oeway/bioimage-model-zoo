<template>
  <div
    class="about"
    :style="{ 'background-image': 'url(' + siteConfig.background_image + ')' }"
  >
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">About {{ siteConfig.site_name }}</h1>
          <h2 class="subtitle">v{{ version }}</h2>
        </div>
      </div>
    </section>

    <br />
    <section style="text-align: center;">
      <b-button @click="$emit('contribute')" v-if="siteConfig.contribute_url"
        >Contribute Models</b-button
      >
      <b-button @click="$emit('join')" v-if="siteConfig.join_partners_url"
        >Join Community Partners</b-button
      >
    </section>
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
            <figure>
              <img :src="item.logo" style="max-height: 55px;" />
              <figcaption class="hide-on-small-screen">
                {{ item.label }}
              </figcaption>
            </figure>
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
.about {
  height: calc(100% - 40px);
  background-repeat: no-repeat;
  background-position: bottom;
}
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

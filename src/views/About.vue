<template>
  <div
    class="about width-limited"
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
    <section style="text-align: center">
      <b-button
        @click="openUrl(siteConfig.contact_form_url)"
        v-if="siteConfig.contact_form_url"
        >Contact Us</b-button
      >
      <b-button
        @click="openUrl(siteConfig.subscribe_url)"
        v-if="siteConfig.subscribe_url"
        >Subscribe</b-button
      >
    </section>
    <br />
    <section style="text-align: center">
      <b-button
        @click="openUrl('/docs#/contribute_models/README')"
        v-if="siteConfig.contribute_url"
        >Contribute Models</b-button
      >
      <b-button
        @click="openUrl('/docs#/community_partners/README')"
        v-if="siteConfig.join_partners_url"
        >Join Community Partners</b-button
      >
    </section>
    <br />
    <section class="hero" style="min-height: 100px">
      <markdown
        v-if="siteConfig.about_url"
        :url="siteConfig.about_url"
      ></markdown>
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
              <img :src="item.logo" style="max-height: 55px" />
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
      <p>
        The giraffe icon used in the BioImage logo is adapted from the
        <a href="https://twemoji.twitter.com/" target="_blank"
          >Twemoji project</a
        >
        maintained by Twitter and released under
        <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY 4.0</a>
        license.
      </p>
    </div>
    <br />
  </div>
</template>
<script>
import { mapState } from "vuex";
import { version } from "../../package.json";
import Markdown from "@/components/Markdown.vue";
export default {
  name: "About",
  computed: {
    ...mapState({
      siteConfig: (state) => state.siteConfig,
    }),
  },
  components: {
    markdown: Markdown,
  },
  data() {
    return {
      version,
    };
  },
  methods: {
    openUrl(url) {
      window.open(url);
    },
  },
};
</script>
<style scoped>
.about {
  background-repeat: no-repeat;
  background-position: bottom 50px;
  overflow: auto;
  background-color: white;
  max-width: 100%;
  overflow-x: hidden;
}
.hero {
  max-width: 100%;
  width: 600px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
button {
  margin: 2px;
}
.width-limited {
  max-width: 1000px;
  margin-left: auto !important;
  margin-right: auto !important;
  float: none !important;
}
</style>

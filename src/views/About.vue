<template>
  <div class="about">
    <section
      class="hero"
      style="max-width: 100%; width: 600px; text-align: center; margin-left: auto;
  margin-right: auto;"
    >
      <div class="hero-body">
        <div class="container">
          <h1 class="title">About {{ siteConfig.site_name }}</h1>
          <h2 class="subtitle">v{{ version }}</h2>
        </div>
      </div>
    </section>
    <img
      style="position:absolute; bottom: 0px; right:0px; width:90%;"
      :src="siteConfig.background_image"
    />
  </div>
</template>
<script>
import siteConfig from "../siteConfig";
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

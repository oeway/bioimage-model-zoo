<template>
  <div id="app">
    <router-view />
  </div>
  <br />
  <footer class="footer">
    <div class="columns is-moible is-centered" v-if="siteConfig.footer">
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
  </footer>
</template>

<style>
html,
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  background: #dcdcdc;
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
</style>

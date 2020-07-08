<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
html,
body {
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  background: #dcdcdc;
  overscroll-behavior-y: none;
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

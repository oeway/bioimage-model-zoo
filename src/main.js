import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import Buefy from "buefy";
import "buefy/dist/buefy.css";
import { store } from "./store";
import "./bulmaswatch.min.css";
import vmodal from "vue-js-modal";

Vue.use(vmodal);

Vue.use(Buefy);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
  store
}).$mount("#app");

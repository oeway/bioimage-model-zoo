import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import Buefy from "buefy";
import "./buefy.css";
import { store } from "./store";
import "./bulmaswatch.min.css";
import vmodal from "vue-js-modal";
import "@mdi/font/css/materialdesignicons.css";
import { extend, ValidationProvider } from "vee-validate";
import * as rules from "vee-validate/dist/rules";
import { messages } from "vee-validate/dist/locale/en.json";

// for vue-form-json
Vue.component("ValidationProvider", ValidationProvider);

Object.keys(rules).forEach((rule) => {
  extend(rule, {
    ...rules[rule],
    message: messages[rule],
  });
});

Vue.use(vmodal);

Vue.use(Buefy);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
  store,
}).$mount("#app");

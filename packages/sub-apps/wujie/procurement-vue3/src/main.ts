import { createApp } from "vue";
import ArcoVue from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";
import XingjiaUiPlugin from "@xingjia/ui";
import App from "./App.vue";
import router from "./router";

createApp(App).use(ArcoVue).use(XingjiaUiPlugin).use(router).mount("#app");

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import "@/styles/catalog-trash.css";
import "@/styles/catalog-media.css";
import "@/styles/catalog-detail-media.css";
import "@/styles/vod.css";
import "@/styles/vod-management.css";


createApp(App).use(router).mount("#app");

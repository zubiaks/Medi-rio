/**
 * Mediario
 * Copyright (c) 2026 Zubiaks.
 *
 * Source-available under the PolyForm Noncommercial License 1.0.0.
 * Commercial use requires prior written permission from Zubiaks.
 * See LICENSE.md.
 */
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
import "@/styles/vod-delete-dialog.css";
import "@/styles/podcasts.css";
import "@/styles/iptv.css";
import "@/styles/iptv-grid-control.css";


createApp(App).use(router).mount("#app");

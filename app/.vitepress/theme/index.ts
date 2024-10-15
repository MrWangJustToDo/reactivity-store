// https://vitepress.dev/guide/custom-theme
import { Suspense, h } from "vue";
import Theme from "vitepress/theme";
import Example from "./components/example.vue";
import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import "./style.css";

import "@shikijs/vitepress-twoslash/style.css";
import { EnhanceAppContext } from "vitepress";

export default {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      "home-hero-image": () => h(Suspense, null, h(Example)),
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app }: EnhanceAppContext) {
    // @ts-ignore
    app.use(TwoslashFloatingVue);
  },
};

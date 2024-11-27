import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Reactivity Store",
  base: "/reactivity-store/",
  description: "A React state-management tool power by Reactive api",
  markdown: {
    codeTransformers: [transformerTwoslash()],
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Usage", link: "/createStore" },
      { text: "Projects", items: [{ text: "git-diff-view", target: "_blank", link: "https://github.com/MrWangJustToDo/git-diff-view" }] },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is RStore?", link: "/what" },
          { text: "Why need RStore?", link: "/why" },
        ],
      },
      {
        text: "Usage",
        items: [
          { text: "Create Store", link: "/createStore" },
          { text: "Create Store with lifeCycle", link: "/createStoreWithLifeCycle" },
          { text: "Create State", link: "/createState" },
        ],
      },
      {
        text: "Example",
        items: [
          { text: "TodoList", link: "/todoList" },
          { text: "Reactive Hook", link: "/reactiveHook" },
        ],
      },
      {
        text: "TODO",
      },
      // {
      //   text: "Examples",
      //   items: [
      //     { text: "Markdown Examples", link: "/markdown-examples" },
      //     { text: "Runtime API Examples", link: "/api-examples" },
      //   ],
      // },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/MrWangJustToDo/r-store" }],
  },
  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    ["link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Outfit:wght@100..900&display=swap" }],
    ["link", { rel: "icon", href: "/reactivity-store/favicon.png" }],
  ],
});

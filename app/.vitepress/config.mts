import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "RStore",
  base: "/reactivity-store/",
  description: "Vue-inspired Reactive State Management for React - Bring Vue's reactivity system to React with zustand-like simplicity",
  markdown: {
    codeTransformers: [transformerTwoslash()],
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/what" },
      { text: "API Reference", link: "/api-reference" },
      { text: "Examples", link: "/use-cases" },
      {
        text: "More",
        items: [
          { text: "git-diff-view", link: "https://github.com/MrWangJustToDo/git-diff-view", target: "_blank" }
        ]
      },
    ],

    sidebar: [
      {
        text: "Getting Started",
        collapsed: false,
        items: [
          { text: "What is RStore?", link: "/what" },
          { text: "Why RStore?", link: "/why" },
          { text: "Installation", link: "/install" },
        ],
      },
      {
        text: "Core Concepts",
        collapsed: false,
        items: [
          { text: "createStore", link: "/createStore" },
          { text: "createState", link: "/createState" },
          { text: "createStoreWithComponent", link: "/createStoreWithLifeCycle" },
          { text: "Subscriptions", link: "/subscribe" },
          { text: "Reactive Hooks", link: "/reactiveHook" },
        ],
      },
      {
        text: "Examples",
        collapsed: false,
        items: [
          { text: "Use Cases", link: "/use-cases" },
          { text: "TodoList", link: "/todoList" },
        ],
      },
      {
        text: "Reference",
        collapsed: false,
        items: [
          { text: "API Reference", link: "/api-reference" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/MrWangJustToDo/r-store" }
    ],

    search: {
      provider: "local"
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present MrWangJustToDo"
    },

    editLink: {
      pattern: "https://github.com/MrWangJustToDo/r-store/edit/main/app/:path",
      text: "Edit this page on GitHub"
    }
  },
  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Outfit:wght@100..900&display=swap",
      },
    ],
    ["link", { rel: "icon", href: "/reactivity-store/favicon.png" }],
  ],
});

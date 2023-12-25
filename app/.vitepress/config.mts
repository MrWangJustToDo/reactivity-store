import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "RStore",
  base: "/reactivity-store/",
  description: "A React state-management tool power by Reactive api",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Usage", link: "/createStore" },
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
        items: [{ text: "TodoList", link: "/todoList" }],
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
});

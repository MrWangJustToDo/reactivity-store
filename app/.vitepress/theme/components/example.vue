<template>
  <div class="wrapper">
    <div ref="codeRef" class="code-wrapper code vp-code" :data-theme="isDark ? 'dark' : 'light'" v-html="str" />
    <div ref="wrapperRef">
      <p class="text">Reactive count component:</p>
      <button class="button">Counter is: 0</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { createState } from "reactivity-store";
import { hydrateRoot, Root } from "react-dom/client";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { createElement } from "react";
import { codeToHtml } from "shiki";

import { useData } from "vitepress";
import { StrictMode } from "react";
import { Fragment } from "react";

const { isDark } = useData();

const wrapperRef = ref<HTMLDivElement>();

const codeRef = ref<HTMLDivElement>();

const useCount = createState(() => ({ count: 0 }), {
  withActions: (s) => ({ add: () => s.count++ }),
  withNamespace: "example_count",
  withStableSelector: true,
});

const source = `
import { createState } from 'reactivity-store';

const useCount = createState(
  () => ({ count: 0 }), 
  { withActions: (s) => ({ add: () => s.count++ }) 
});
`.trim();

let app: Root;

let str = await codeToHtml(source, {
  lang: "ts",
  themes: {
    dark: "github-dark",
    light: "github-light",
  },
  defaultColor: false,
});

onMounted(() => {
  const App = () => {
    const { count, add } = useCount((s) => s);

    return createElement(
      Fragment,
      null,
      createElement("p", { className: "text" }, "Reactive count component: "),
      createElement(
        "button",
        {
          className: "button",
          onClick: add,
        },
        `Counter is: ${count}`
      )
    );
  };

  app = hydrateRoot(wrapperRef.value!, createElement(StrictMode, null, createElement(App)));
});

onBeforeUnmount(() => app.unmount());
</script>

<style scoped>
@media screen and (width < 600px) {
  .code {
    display: none;
  }
}

.wrapper {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  padding: 15px 16px;
  width: 90%;
  transform: translateX(-50%) translateY(-50%);
  border-radius: 8px;
  border: 1px solid rgba(240, 240, 240, 0.8);
  background-color: var(--vp-c-bg);
  box-sizing: border-box;
  font-family: Menlo, Consolas, monospace;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.code-wrapper {
  overflow: auto;
}

.text {
  font-size: 1.2em;
  font-weight: 600;
}

.button {
  margin-top: 20px;
  background-color: #fafafa;
  transition: background-color 0.5s;
  padding: 5px 12px;
  border: 1px solid var(--vp-button-brand-border);
  border-radius: 8px;
  font-size: 1.1em;
  width: fit-content;
  color: black;
  font-weight: 600;
  transition: all 0.2s;
}

.button:hover {
  background-color: #eee;
}
</style>

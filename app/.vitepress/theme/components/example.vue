<template>
<div class="wrapper">
  <pre style="margin: 0;"><div class="code typescript" ref="codeRef" style="overflow: auto;"><code>const useCount = createState(
  () => ({ count: 0 }), 
  { withActions: (s) => ({ add: () => s.count++ }) 
})</code>
</div></pre>
  <div ref="wrapperRef">
    <p class="text">Reactive count component: </p>
    <button class="button">Counter is: 0</button>
  </div>
</div>
</template>

<script lang="ts" setup>
import { createState } from 'reactivity-store';
import { hydrateRoot, Root } from 'react-dom/client'
import highlight from 'highlight.js';
import { onBeforeUnmount, onMounted, ref, watchSyncEffect } from 'vue';
import { createElement, Fragment } from 'react';

import { useData } from 'vitepress'

const styleTag = ref<HTMLStyleElement>()

const { isDark } = useData();

const wrapperRef = ref<HTMLDivElement>();

const codeRef = ref<HTMLDivElement>();

const useCount = createState(() => ({ count: 0 }), { withActions: (s) => ({ add: () => s.count++ }), withNamespace: 'example_count' })

let app: Root;

onMounted(() => {
  const App = () => {
    const { count, add } = useCount(s => s);

    return createElement(Fragment, null,
      createElement('p', { className: 'text' }, 'Reactive count component: '),
      createElement('button', {
        className: 'button',
        onClick: add
      }, `Counter is: ${count}`))
  }

  app = hydrateRoot(wrapperRef.value!, createElement(App));
})

onMounted(() => {
  if (!codeRef.value) return;
  highlight.configure({ ignoreUnescapedHTML: true });
  highlight.highlightElement(codeRef.value);
})

onMounted(() => {
  if (!styleTag.value) {
    const style = document.createElement('style');
    style.setAttribute('data-style', 'highlight.js')
    document.head.appendChild(style);
    styleTag.value = style;
  }
})

watchSyncEffect(() => {
  const loadStyle = async (isDark?: boolean) => {
    const content = await import(isDark ? 'highlight.js/styles/github-dark.css?raw' : 'highlight.js/styles/github.css?raw');
    styleTag.value!.textContent = content.default;
  }
  const isDarValue = isDark.value;
  if (styleTag.value) {
    loadStyle(isDarValue);
  }
})

onBeforeUnmount(() => app.unmount())
</script>

<style scoped>
.code {
  padding: 4px;
  border-radius: 4px;
}

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
  padding: 15px 40px;
  width: 80%;
  transform: translateX(-50%) translateY(-50%);
  border-radius: 8px;
  border: 1px solid rgba(240, 240, 240, .8);
  background-color: var(--vp-c-bg);
  box-sizing: border-box;
  font-family: Menlo, Consolas, monospace;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.text {
  font-size: 1.2em;
  font-weight: 600;
}

.button {
  margin-top: 20px;
  background-color: #fafafa;
  transition: background-color .5s;
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
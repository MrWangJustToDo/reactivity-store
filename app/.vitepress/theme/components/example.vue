<template>
  <div class="wrapper" ref="wrapperRef">
    <button class="button">Counter is: 0</button>
  </div>
</template>

<script lang="ts" setup>
import { createState } from 'reactivity-store';
import { hydrateRoot, Root } from 'react-dom/client'
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createElement } from 'react';

const wrapperRef = ref<HTMLDivElement>();

const useCount = createState(() => ({ count: 0 }), { withActions: (s) => ({ add: () => s.count++ }) })

let app: Root;

onMounted(() => {
  const App = () => {
    const { count, add } = useCount();

    return createElement('button', {
      className: 'button',
      onClick: add
    }, `Counter is: ${count}`)
  }

  app = hydrateRoot(wrapperRef.value!, createElement(App));
})

onBeforeUnmount(() => app.unmount())
</script>

<style scoped>
.wrapper {
  position: relative;
  z-index: 1;
  margin: 20px;
  font-family: Menlo, Consolas, monospace;
}

.button {
  background-color: #fafafa;
  transition: background-color .5s;
  padding: 5px 12px;
  border: 1px solid var(--vp-button-brand-border);
  border-radius: 8px;
  font-size: 1.2em;
  color: black;
  font-weight: 600;
  transition: all 0.2s;
}

.button:hover {
  background-color: #eee;
}
</style>
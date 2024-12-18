<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createStore, reactive, ref as r_ref } from "reactivity-store";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
const divRef = ref<HTMLElement | null>(null);

const useCount = createStore(() => {
  const refCount = r_ref(0);

  const reactiveCount = reactive({ count: 0 });

  const changeCount = (s: number) => {
    reactiveCount.count = s;
  };

  return { reactiveCount, changeCount, refCount };
});

const App = () => {
  const { reactiveCount, changeCount, refCount } = useCount.useDeepStableSelector((state) => state);

  return React.createElement(
    "div",
    { className: "my-container" },
    React.createElement("p", { className: "my-title" }, "React Reactive Count"),
    React.createElement("p", { className: "my-text" }, "Count: " + reactiveCount.count),
    React.createElement("button", { className: "my-button", onClick: () => changeCount(reactiveCount.count + 1) }, "Add Count")
  );
};

let root: ReturnType<(typeof ReactDOM)["createRoot"]> | null = null;

onMounted(() => {
  root = ReactDOM.createRoot(divRef.value as HTMLElement);

  root.render(React.createElement(App));
});

onBeforeUnmount(() => {
  root?.unmount();
});
</script>

<template>
  <div ref="divRef"></div>
</template>

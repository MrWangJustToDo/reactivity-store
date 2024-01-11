<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createState, withPersist } from "reactivity-store";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
const divRef = ref<HTMLElement | null>(null);

const useCountState = createState(withPersist(() => ({ data: { count: 1 } }), { key: 'count', devLog: true }));

const App = () => {
  const count = useCountState((state) => state.data);

  return React.createElement(
    "div",
    { className: "my-container" },
    React.createElement("p", { className: 'my-title' }, "React Reactive Count"),
    React.createElement("p", { className: 'my-text' }, "Count: " + count.count),
    React.createElement("button", { className: "my-button", onClick: () => useCountState.getReactiveState().data.count++ }, "Add Count")
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

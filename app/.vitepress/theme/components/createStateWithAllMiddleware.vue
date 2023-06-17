<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createState, withActions, withPersist } from "reactivity-store";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
const divRef = ref<HTMLElement | null>(null);

const useCountState = createState(withPersist(withActions(() => ({ data: { count: 1 } }), { generateActions: (state) => ({ add: () => state.data.count++, del: () => state.data.count-- }) }), { key: 'foo' }));

const useCountState_v2 = createState(withActions(withPersist(() => ({ data: { count: 1 } }), { key: 'foo' }), { generateActions: (state) => ({ add: () => state.data.count++, del: () => state.data.count-- }) }));

const App = () => {
  const { count, add } = useCountState((state) => {
    return { count: state.data.count, add: state.add }
  });

  return React.createElement(
    "div",
    { className: "react_container" },
    React.createElement("p", null, "React Reactive Count"),
    React.createElement("p", { style: { color: "red" } }, "count: " + count),
    React.createElement("button", { className: "react_button", onClick: add }, "Add button")
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

<style>
.react_container {
  padding: 20px;
  overflow: hidden;
  border-radius: 4px;
  background-color: RGBA(100, 100, 100, 0.4);
}

.react_button {
  border: 1px solid rgba(100, 100, 100, 0.8);
  padding: 6px 10px;
  border-radius: 4px;
}
</style>

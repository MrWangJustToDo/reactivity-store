<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createState, withActions } from "reactivity-store";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
const divRef_1 = ref<HTMLElement | null>(null);

const divRef_2 = ref<HTMLDivElement | null>(null);

const useCountState_1 = createState(withActions(() => ({ data: { count: 1 } }), { generateActions: (state) => ({ add: () => state.data.count++, del: () => state.data.count-- }) }));

const useCountState_2 = createState(withActions(() => ({ data: { count: 1 } }), { generateActions: (state) => ({ add: () => state.data.count++, del: () => state.data.count-- }) }), { withDeepSelector: false });

const App_1 = () => {
  const { data, add } = useCountState_1((state) => ({ data: state.data, add: state.add }));

  return React.createElement(React.StrictMode, null, React.createElement(
    "div",
    { className: "react_container" },
    React.createElement("p", null, "React Reactive Count with DeepSelector, the component will update when the button click"),
    React.createElement("p", { style: { color: "red" } }, "count: " + data.count),
    React.createElement("button", { className: "react_button", onClick: () => add() }, "Add button")
  ));
};

const App_2 = () => {
  const { data, add } = useCountState_2((state) => ({ data: state.data, add: state.add }));

  return React.createElement(React.StrictMode, null, React.createElement(
    "div",
    { className: "react_container" },
    React.createElement("p", null, "React Reactive Count without DeepSelector, the component will never update when the button click"),
    React.createElement("p", { style: { color: "red" } }, "count: " + data.count),
    React.createElement("button", { className: "react_button", onClick: () => add() }, "Add button")
  ));
};

let root: ReturnType<(typeof ReactDOM)["createRoot"]> | null = null;

onMounted(() => {
  root = ReactDOM.createRoot(divRef_1.value as HTMLElement);

  root.render(React.createElement(App_1));

  root = ReactDOM.createRoot(divRef_2.value as HTMLElement);

  root.render(React.createElement(App_2));
});

onBeforeUnmount(() => {
  root?.unmount();
});
</script>

<template>
  <div ref="divRef_1"></div>
  <div ref="divRef_2"></div>
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

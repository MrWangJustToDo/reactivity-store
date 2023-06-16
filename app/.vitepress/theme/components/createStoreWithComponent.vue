<script lang="ts" setup>
import { createStoreWithComponent, onMounted, onBeforeUpdate, onBeforeUnmount, onUnmounted } from "reactivity-store";
import { onMounted as vue_OnMounted, onBeforeUnmount as vue_OnBeforeUnmount, ref } from "vue";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

const divRef = ref<HTMLElement | null>(null);

const Time = createStoreWithComponent({
  setup: ({ ref }) => {
    const timeRef = ref(new Date().toString());
    const updateCountRef = ref(0);

    let id;

    onMounted(() => {
      id = setInterval(() => (timeRef.value = new Date().toString()), 1000);
    });

    onBeforeUpdate(() => {
      updateCountRef.value++
    });

    onUnmounted(() => {
      clearInterval(id);
    });

    return { timeRef, updateCountRef };
  },
});

const App = () => {
  return React.createElement(React.StrictMode, null, React.createElement(
    "div",
    { className: "react_container" },
    React.createElement(Time, {
      children: ({ timeRef, updateCountRef }) => {
        return React.createElement(
          React.Fragment,
          null,
          React.createElement("p", null, "React Reactive Time"),
          React.createElement("p", null, "Time: ", React.createElement("span", { style: { color: "red" } }, timeRef)),
          React.createElement("p", null, "Update count: ", React.createElement("span", { style: { color: "red" } }, updateCountRef))
        );
      },
    })
  ));
};

let root: ReturnType<(typeof ReactDOM)["createRoot"]> | null = null;

vue_OnMounted(() => {
  root = ReactDOM.createRoot(divRef.value as HTMLElement);

  root.render(React.createElement(App));
});

vue_OnBeforeUnmount(() => {
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
</style>

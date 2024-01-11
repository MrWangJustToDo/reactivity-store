<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createState, withActions, withNamespace, withPersist } from "reactivity-store";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
const divRef = ref<HTMLElement | null>(null);

// const useCountState = createState(withPersist(withActions(() => ({ data: { count: 1 } }), { generateActions: (state) => ({ add: () => state.data.count++, del: () => state.data.count-- }) }), { key: 'foo' }));

const useCountState = createState(withNamespace(withActions(() => ({ data: { count: 1 } }), { generateActions: (state) => ({ add: () => state.data.count++, del: () => state.data.count-- }) }), { namespace: 'foo1', reduxDevTool: true }));

const App = () => {
  const { count, add } = useCountState((state) => {
    return { count: state.data.count, add: state.add }
  });

  return React.createElement(
    "div",
    { className: "my-container" },
    React.createElement("p", { className: 'my-title' }, "React Reactive Count"),
    React.createElement("p", { className: 'my-text' }, "Count: " + count),
    React.createElement("button", { className: "my-button", onClick: add }, "Add Count")
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

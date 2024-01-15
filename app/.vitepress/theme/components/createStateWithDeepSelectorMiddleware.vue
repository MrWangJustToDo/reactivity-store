<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createState, withActions } from "reactivity-store";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
const divRef_1 = ref<HTMLElement | null>(null);

const divRef_2 = ref<HTMLDivElement | null>(null);

const useCountState_1 = createState(withActions(() => ({ data: { count: 1 } }), { generateActions: (state) => ({ add: () => state.data.count++, del: () => state.data.count-- }) }));

const useCountState_2 = createState(withActions(() => ({ data: { count: 1 } }), { generateActions: (state) => ({ add: () => state.data.count++, del: () => state.data.count-- }) }), { withDeepSelector: false });

// const useCountState_3 = createState(() => ({ count: 1 }), { withActions: (state) => ({ add: () => state.count++, del: () => state.count-- }), withDeepSelector: false });

const App_1 = () => {
  const { data, add } = useCountState_1((state) => ({ data: state.data, add: state.add }));

  // const { count, add } = useCountState_3(s => s);

  return React.createElement(React.StrictMode, null, React.createElement(
    "div",
    { className: "my-container" },
    React.createElement("p", { className: 'my-title' }, "React Reactive Count with DeepSelector, the component will update when the button click"),
    React.createElement("p", { className: 'my-text' }, "Count: " + data.count),
    React.createElement("button", { className: "my-button", onClick: () => add() }, "Add Count (work)")
  ));
};

const App_2 = () => {
  const { data, add } = useCountState_2((state) => ({ data: state.data, add: state.add }));

  return React.createElement(React.StrictMode, null, React.createElement(
    "div",
    { className: "my-container" },
    React.createElement("p", { className: 'my-title' }, "React Reactive Count without DeepSelector, the component will never update when the button click"),
    React.createElement("p", { className: 'my-text' }, "Count: " + data.count),
    React.createElement("button", { className: "my-button", onClick: () => add() }, "Add Count (not work)")
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
  <br />
  <div ref="divRef_2"></div>
</template>

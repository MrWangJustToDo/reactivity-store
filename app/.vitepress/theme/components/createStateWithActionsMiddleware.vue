<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createState, withActions, withNamespace } from "reactivity-store";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
const divRef = ref<HTMLElement | null>(null);

const useCountState = createState(withActions(() => ({ data: { count: 1 } }), { generateActions: (state) => ({ add: () => state.data.count++, del: () => state.data.count-- }) }));

const useCountState_v2 = createState(withActions(() => ({ count: 1 }), { generateActions: (state) => { return { add: () => { state.count++ }, del: () => state.count-- } } }));

const useCountState_v3 = createState(withActions(() => ({ count: 1 }), { generateActions: (state) => { return { add: (v) => { console.log(v); state.count++ }, del: () => state.count-- } } }));

const useCountState_v4 = createState(withNamespace(() => ({ count: 1 }), { namespace: 'foo_2', reduxDevTool: true }), { withActions: (state) => { return { add: async (v) => { console.log(v); state.count++ }, del: async () => state.count-- } }, withNamespace: 'count_4' });

const App = () => {
  const { count, add } = useCountState_v4();

  return React.createElement(React.StrictMode, null, React.createElement(
    "div",
    { className: "my-container" },
    React.createElement("p", { className: 'my-title' }, "React Reactive Count"),
    React.createElement("p", { className: 'my-text' }, "Count: " + count),
    React.createElement("button", { className: "my-button", onClick: () => add('args') }, "Add Count")
  ));
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

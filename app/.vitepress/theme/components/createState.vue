<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createState, useReactiveEffect, useReactiveState, withNamespace } from "reactivity-store";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
const divRef = ref<HTMLElement | null>(null);

const usePosition = () => {
  const [state, setState] = useReactiveState({ x: 0, y: 0 });

  const [xPosition, setXPosition] = useReactiveState({ x: 0 });

  useReactiveEffect(() => {
    const listener = (e: MouseEvent) => {
      setState({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", listener);

    return () => window.removeEventListener("mousemove", listener);
  });

  // no need deps for current effect
  useReactiveEffect(() => {
    setXPosition({ x: state.x });
  });

  return { y: state.y, x: xPosition.x };
};


const useCountState = createState(withNamespace(() => ({ data: { count: 1 } }), { namespace: "count", reduxDevTool: true }));

const App = () => {
  const count = useCountState((state) => state.data);

  // const { x, y } = usePosition();

  return React.createElement(React.StrictMode, null, React.createElement(
    "div",
    { className: "my-container" },
    React.createElement("p", { className: 'my-title' }, "React Reactive Count"),
    React.createElement("p", { className: 'my-text' }, "Count: " + count.count),
    React.createElement("button", { className: "my-button", onClick: () => useCountState.getReactiveState().data.count++ }, "Add Count"),
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

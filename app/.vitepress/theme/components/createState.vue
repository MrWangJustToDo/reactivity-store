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

  return React.createElement(
    "div",
    { className: "react_container" },
    React.createElement("p", null, "React Reactive Count"),
    React.createElement("p", { style: { color: "red" } }, "count: " + count.count),
    React.createElement("button", { className: "react_button", onClick: () => useCountState.getReactiveState().data.count++ }, "Add button"),
    // React.createElement('div', null, `React Reactive Hook`),
    // React.createElement("p", null, `x: ${x}, y: ${y}`)
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

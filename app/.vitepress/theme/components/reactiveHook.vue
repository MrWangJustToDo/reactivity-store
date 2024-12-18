<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useReactiveState, useReactiveEffect } from "reactivity-store";
import { createElement, StrictMode } from "react";
import ReactDOM from "react-dom/client";

const usePosition = () => {
  const [state, setState] = useReactiveState({ x: 0, y: 0 });

  const [xPosition, setXPosition] = useReactiveState(() => ({ x: 0 }));

  useReactiveEffect(() => {
    const listener = (e: MouseEvent) => {
      setState({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", listener);

    return () => window.removeEventListener("mousemove", listener);
  });

  useReactiveEffect(() => {
    setXPosition({ x: state.x });
  });

  return { y: state.y, x: xPosition.x };
};

const divRef = ref<HTMLDivElement>();

const App = () => {
  const { x, y } = usePosition();

  return createElement(
    StrictMode,
    null,
    createElement(
      "div",
      { className: "my-container" },
      createElement("p", { className: "my-title" }, "React Reactive Hook"),
      createElement("p", { className: "my-text" }, `position: ${x}, ${y}`)
    )
  );
};

let root: ReturnType<(typeof ReactDOM)["createRoot"]> | null = null;

onMounted(() => {
  root = ReactDOM.createRoot(divRef.value as HTMLElement);

  root.render(createElement(App));
});

onBeforeUnmount(() => {
  root?.unmount();
});
</script>

<template>
  <div ref="divRef"></div>
</template>

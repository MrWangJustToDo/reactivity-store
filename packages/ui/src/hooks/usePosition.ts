import { useReactiveEffect, useReactiveState } from "reactivity-store";

export const usePosition = () => {
  const state = useReactiveState({ x: 0, y: 0 });

  const xPosition = useReactiveState({ x: 0 });

  useReactiveEffect(() => {
    const listener = (e: MouseEvent) => {
      state.x = e.clientX;
      state.y = e.clientY;
    };

    window.addEventListener("mousemove", listener);

    return () => window.removeEventListener("mousemove", listener);
  });

  useReactiveEffect(() => {
    xPosition.x = state.x;
  });

  return { y: state.y, x: xPosition.x };
};

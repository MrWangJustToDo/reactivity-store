import { useReactiveEffect, useReactiveState } from "reactivity-store";

export const usePosition = () => {
  const [state, setState] = useReactiveState({ x: 0, y: 0 });

  const [xPosition, setXPosition] = useReactiveState({ x: 0 });

  useReactiveEffect(() => {
    const listener = (e: MouseEvent) => {
      setState((state) => {
        state.x = e.clientX;
        state.y = e.clientY;
      });
    };

    window.addEventListener("mousemove", listener);

    return () => window.removeEventListener("mousemove", listener);
  });

  useReactiveEffect(() => {
    setXPosition((xPosition) => {
      xPosition.x = state.x;
    });
  });

  return { y: state.y, x: xPosition.x };
};

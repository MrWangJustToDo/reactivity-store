# Reactive Hook

## Reactive Hook example

```tsx
import { useReactiveState, useReactiveEffect } from "reactivity-store";

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
```

## Example

<script setup>
  import Hook from '@theme/components/reactiveHook.vue'
</script>

<Hook />

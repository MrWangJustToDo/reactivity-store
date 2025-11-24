---
layout: home

hero:
  name: "RStore"
  text: "Vue-inspired Reactive State Management for React"
  tagline: Bring Vue's reactivity system to React with zustand-like simplicity
  actions:
    - theme: brand
      text: Get Started
      link: /what
    - theme: alt
      text: Quick Examples
      link: /createStore
    - theme: alt
      text: View on GitHub
      link: https://github.com/MrWangJustToDo/r-store

features:
  - icon: ⚡
    title: Vue Reactivity API
    details: Built on @vue/reactivity - use ref(), reactive(), computed() in React with automatic UI updates
  - icon: 🎯
    title: Zustand-like Simplicity
    details: Clean, minimal API design inspired by zustand. Simple to learn, easy to use
  - icon: 🔌
    title: Powerful Middleware
    details: Built-in middleware for persistence, actions, Redux DevTools, and performance optimization
  - icon: 📘
    title: TypeScript First
    details: Full type safety with excellent IntelliSense support. Written in TypeScript
  - icon: 🪝
    title: Lifecycle Hooks
    details: Vue-like component lifecycle support with onMounted, onUpdated, and reactive effects
  - icon: 🚀
    title: Zero Manual Subscriptions
    details: No setState, no manual subscriptions. Just mutate and the UI updates automatically
---

## Two Approaches, One Library

RStore adapts to your background:

::: code-group

```tsx [🟢 Vue Approach] twoslash
import React from "react";
import { createStore, ref } from "reactivity-store";

// Use Vue APIs: ref, reactive, computed
const useCounter = createStore(() => {
  const count = ref(0);
  const increment = () => count.value++;

  return { count, increment };
});

function App() {
  const { count, increment } = useCounter();
  return <button onClick={increment}>Count: {count}</button>;
}
```

```tsx [🔵 React Approach] twoslash
import React from "react";
import { createState } from "reactivity-store";

// Use actions - no Vue APIs needed
const useCounter = createState(
  () => ({ count: 0 }),
  {
    withActions: (state) => ({
      increment: () => state.count++
    })
  }
);

function App() {
  const { count, increment } = useCounter();
  return <button onClick={increment}>Count: {count}</button>;
}
```

:::

### Choose Your Path

| | Vue Approach | React Approach |
|---|--------------|----------------|
| **Best for** | Vue developers | React developers |
| **APIs** | `ref`, `reactive`, `computed` | Plain objects + actions |
| **Features** | Auto-computed, lifecycle hooks | Middleware: persist, DevTools |
| **Learn more** | [createStore](/createStore) | [createState](/createState) |

---

<div style="text-align: center; margin-top: 2rem; margin-bottom: 2rem;">
  <a href="https://www.npmjs.com/package/reactivity-store" target="_blank" rel="noopener">
    <img src="https://img.shields.io/npm/dm/reactivity-store?style=flat&logo=npm&label=downloads&color=blue" alt="npm downloads" style="display: inline-block; margin: 0 0.5rem;" />
  </a>
  <a href="https://www.npmjs.com/package/reactivity-store" target="_blank" rel="noopener">
    <img src="https://img.shields.io/npm/v/reactivity-store?style=flat&logo=npm&label=version&color=green" alt="npm version" style="display: inline-block; margin: 0 0.5rem;" />
  </a>
  <a href="https://github.com/MrWangJustToDo/r-store" target="_blank" rel="noopener">
    <img src="https://img.shields.io/github/stars/MrWangJustToDo/r-store?style=flat&logo=github&label=stars&color=yellow" alt="GitHub stars" style="display: inline-block; margin: 0 0.5rem;" />
  </a>
</div>

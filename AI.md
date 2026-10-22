# AI Guide — reactivity-store (RStore)

> A concise, machine-readable guide for AI coding agents that integrate `reactivity-store`
> (also branded "RStore") into React apps. Human-readable docs live on the
> [documentation site](https://mrwangjusttodo.github.io/reactivity-store/).

- **Package**: `reactivity-store`
- **Runtime deps**: `@vue/reactivity`, `@vue/shared`, `use-sync-external-store` (the latter is inlined into the build output)
- **Peer dependency**: `react` (required); `octane` only for the `reactivity-store/octane` entry
- **License**: MIT

## 1. What it is (TL;DR)

A **state management library for React** built on Vue's reactivity system (`@vue/reactivity`).
You **mutate reactive state directly** (no `setState`, no reducer, no manual subscriptions);
the UI updates automatically via fine-grained dependency tracking. API feels like Vue
Composition API inside React, with zustand-like simplicity.

Two entry styles:

| Entry | Use when | Key APIs |
| --- | --- | --- |
| `createStore` | You like Vue APIs (`ref`, `reactive`, `computed`) | `createStore`, lifecycle-free global/component state |
| `createState` | You want plain objects + middleware | `createState`, `withActions`, `withPersist`, `withNamespace`, etc. |
| `reactivity-store/octane` | You are building an **Octane** (Glimmer) app | `createStore` only (framework-neutral, no React) |

## 2. Capabilities

- **Direct mutation reactivity**: mutate a `ref`/`reactive` object → subscribing components re-render automatically.
- **`createStore`**: `ref`, `reactive`, `computed`, `watch` inside a `setup()`; returned values are auto-unwrapped in the hook.
- **`createState`**: plain-object state + actions; built-in middleware for **persistence**, **Redux DevTools**, **namespacing**, and **selector performance**.
- **Selectors**: `useSelector((s) => s.field, compare?)` to limit re-renders; variants `useShallowSelector`, `useDeepSelector`, `useShallowStableSelector`, `useDeepStableSelector`.
- **Subscribe outside components**: `useSelector.subscribe(selector, cb, shallow?)`.
- **Wait for a value**: `useSelector.waitingValueTo({ key, value, single?, compare? })` (async/abortable).
- **Lifecycle hooks** (only via `createStoreWithComponent`, deprecated): `onMounted`, `onUpdated`, `onBeforeMount`, `onBeforeUpdate`, `onBeforeUnmount`, `onUnmounted`.
- **Component-level state**: `useReactiveState(initial)` → `[state, setState]`; side effects with `useReactiveEffect(cb)`.
- **Non-browser support**: `configureEnv({ allowNonBrowserUpdates: true })` for terminal/CLI UI; `createStorageAdapter()` for custom persistence; `isBrowser`/`isServer`.
- **TypeScript-first**: full type inference, `DeepReadonly`, `UnwrapNestedRefs`.

## 3. Recommended usage (decision guide)

1. **Global, shared state → `createState`** with plain objects (simpler, middleware available):
   `const useStore = createState(() => ({ ... }), { withActions: (s) => ({ ... }) });`
2. **Vue-style reactive store / derived values → `createStore`** with `ref`/`reactive`/`computed`.
3. **Persist state** → `withPersist` (uses `localStorage` in browser; pass `getStorage`/`createStorageAdapter()` for non-browser).
4. **Redux DevTools** → `withNamespace({ namespace, reduxDevTool: true })`.
5. **Component-local state** → `useReactiveState` (or just React `useState` for trivial cases).
6. **Side effects on reactive state in a component** → `useReactiveEffect(cb)`.
7. **Performance**: prefer `useShallowSelector`/`useDeepStableSelector` for large state; always use a selector that returns the minimal slice.

**Do NOT** reach for the deprecated `createStoreWithComponent` (see Anti-patterns).

## 4. Core API cheatsheet (verified against source)

```ts
// createState — plain object + middleware
const useStore = createState(
  () => ({ count: 0, name: "" }),
  {
    withActions: (s) => ({
      increment: () => s.count++,
      rename: (n: string) => (s.name = n),
    }),
    withPersist: "app-key",             // or { key, version, getStorage, ... }
    withNamespace: { namespace: "app", reduxDevTool: true },
    withDeepSelector: true,             // default true
    withStableSelector: false,          // default false
  }
);

const { count, increment } = useStore();               // full state + actions
const count = useStore((s) => s.count);                // selector slice
const shallowCount = useStore.useShallowSelector((s) => s.count);

useStore.getReactiveState();                            // mutable reactive state
useStore.getReadonlyState();                            // readonly state
useStore.subscribe((s) => s.count, () => console.log("count changed"));
```

```ts
// createStore — Vue reactivity API
const useCounter = createStore(() => {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);
  return { count, doubled, increment: () => count.value++ };
});

function App() {
  const { count, doubled, increment } = useCounter();   // refs auto-unwrapped
  return <button onClick={increment}>{count} ({doubled})</button>;
}
```

```ts
// component-local state + effect
const [state, setState] = useReactiveState(() => ({ count: 0 }));
useReactiveEffect(() => console.log(state.count));
```

## 5. Anti-patterns & gotchas (IMPORTANT)

- ❌ **Do not use `createStoreWithComponent`** — it is **deprecated**. Use `createStore` + React hooks (`useState`/`useEffect`) instead.
- ❌ **Do not return a cleanup from lifecycle callbacks** — lifecycle callbacks are `() => void`; returned functions are **discarded** (timers leak). Clean up inside `onUnmounted`.
- ❌ **Do not return a `Promise`, a `reactive` object, or a function field from a `setup`/state creator** — the store expects a plain (or middleware-wrapped) object.
- ❌ **Do not duplicate keys between `state` and `actions`** (e.g. same key in `createState` setup and `withActions`) — triggers dev warnings.
- ❌ **Do not use reserved internal namespaces** (`$$__ignore__$$`, `$$__persist__$$`, `$$__subscribe__$$`, `$$__redux_dev_tool__$$`) as your namespace.
- ❌ **`withPersist` without storage** (non-browser, no `getStorage`) cannot persist — either run in a browser or pass a custom storage adapter.
- ❌ **Do not mix middleware and `createStore`** — `createStore` does **not** support middleware (`withActions`, etc.); use `createState`.
- ⚠️ `getState()` on the hook is **deprecated** — use `getReactiveState()` / `getReadonlyState()`.
- ⚠️ `withDeepSelector` and `withSelectorOptions` default `deepSelector` to **`true`** and `stableSelector` to **`false`**.

## 6. Troubleshooting — common `[reactivity-store]` errors

| Error | Meaning | Fix |
| --- | --- | --- |
| `expects to receive a plain object but got a promise` | `setup`/creator returned a `Promise` | Return a plain object / sync state |
| `has a function field in state` | Plain state contains a function | Move functions into `withActions` (or `createStore` return) |
| `duplicate key [...] in 'state' and 'actions'` | Key collision between state and actions | Rename one of them |
| `duplicate namespace` | Reused namespace | Use a unique namespace string |
| `withPersist can't find storage` | No storage available in env | Run in browser or pass `getStorage: () => createStorageAdapter({...})` |
| `selector should be a pure function` | Selector returned a `Promise` (async) | Make the selector synchronous |
| `unexpected update ... on the server` | State updated on server | Guard updates, or `configureEnv({ allowNonBrowserUpdates: true })` for terminal UIs |

## 7. Links

- Docs site: <https://mrwangjusttodo.github.io/reactivity-store/>
- Source / issues: <https://github.com/MrWangJustToDo/reactivity-store>

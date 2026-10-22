# AI Guide — reactivity-store (RStore)

> A concise, machine-readable guide for AI coding agents that integrate `reactivity-store`
> (also branded "RStore") into React apps.

- **Package**: `reactivity-store`
- **Runtime deps**: `@vue/reactivity`, `@vue/shared`, `use-sync-external-store` (inlined into the build output)
- **Peer dependency**: `react` (required); `octane` only for the `reactivity-store/octane` entry

::: tip How to use this page
This is a **concise, machine-readable** guide for AI coding assistants (and a quick human reference).
- **AI agents**: point your context at this page — it lists capabilities, recommended usage, and pitfalls.
- **Humans**: for the full docs browse the [documentation site](https://mrwangjusttodo.github.io/reactivity-store/).
- **Site index**: a machine-readable [`llms.txt`](/llms.txt) is also available at the site root.
:::

## What it is (TL;DR)

A **state management library for React** built on Vue's reactivity system (`@vue/reactivity`).
You **mutate reactive state directly** (no `setState`, no reducer, no manual subscriptions);
the UI updates automatically via fine-grained dependency tracking.

Two entry styles:

| Entry | Use when | Key APIs |
| --- | --- | --- |
| `createStore` | You like Vue APIs (`ref`, `reactive`, `computed`) | `createStore` |
| `createState` | You want plain objects + middleware | `createState`, `withActions`, `withPersist`, `withNamespace` |
| `reactivity-store/octane` | You are building an **Octane** (Glimmer) app | `createStore` only (no React) |

## Capabilities

- **Direct mutation reactivity**: mutate a `ref`/`reactive` object → subscribing components re-render.
- **`createStore`**: `ref`, `reactive`, `computed`, `watch` inside `setup()`; returned values auto-unwrap in the hook.
- **`createState`**: plain-object state + actions; middleware for **persistence**, **Redux DevTools**, **namespacing**, **selector performance**.
- **Selectors**: `useSelector((s) => s.field, compare?)`; variants `useShallowSelector`, `useDeepSelector`, `useShallowStableSelector`, `useDeepStableSelector`.
- **Subscribe outside components**: `useSelector.subscribe(selector, cb, shallow?)`.
- **Wait for a value**: `useSelector.waitingValueTo({ key, value, single?, compare? })`.
- **Component-level state**: `useReactiveState(initial)`; effects with `useReactiveEffect(cb)`.
- **Non-browser support**: `configureEnv({ allowNonBrowserUpdates: true })`; `createStorageAdapter()`; `isBrowser`/`isServer`.
- **TypeScript-first**: `DeepReadonly`, `UnwrapNestedRefs`.

## Recommended usage

1. **Global/shared state → `createState`** (plain objects, middleware).
2. **Vue-style / derived state → `createStore`** (`ref`/`reactive`/`computed`).
3. **Persist** → `withPersist` (localStorage in browser; `getStorage`/`createStorageAdapter()` otherwise).
4. **Redux DevTools** → `withNamespace({ namespace, reduxDevTool: true })`.
5. **Component-local state** → `useReactiveState`.
6. **Side effects** → `useReactiveEffect(cb)`.
7. **Performance** → `useShallowSelector`/`useDeepStableSelector`; select the minimal slice.

**Do NOT** use the deprecated `createStoreWithComponent`.

## Core API cheatsheet

```ts
const useStore = createState(
  () => ({ count: 0, name: "" }),
  {
    withActions: (s) => ({ increment: () => s.count++, rename: (n: string) => (s.name = n) }),
    withPersist: "app-key",
    withNamespace: { namespace: "app", reduxDevTool: true },
    withDeepSelector: true,   // default true
    withStableSelector: false, // default false
  }
);

const { count, increment } = useStore();
const count = useStore((s) => s.count);
useStore.getReactiveState();
useStore.getReadonlyState();
useStore.subscribe((s) => s.count, () => console.log("count changed"));
```

```ts
const useCounter = createStore(() => {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);
  return { count, doubled, increment: () => count.value++ };
});
// refs auto-unwrap: const { count, doubled, increment } = useCounter();
```

## Anti-patterns & gotchas

- ❌ **`createStoreWithComponent` is deprecated** — use `createStore` + React hooks.
- ❌ **Do not return a cleanup from lifecycle callbacks** — returned functions are discarded (timers leak); clean up in `onUnmounted`.
- ❌ **Do not return a `Promise`, a `reactive` object, or a function field from a state creator.**
- ❌ **Do not duplicate keys between state and actions.**
- ❌ **Do not use reserved internal namespaces** (`$$__ignore__$$`, `$$__persist__$$`, `$$__subscribe__$$`, `$$__redux_dev_tool__$$`).
- ❌ **`withPersist` without storage** (non-browser, no `getStorage`) cannot persist.
- ❌ **Do not mix middleware with `createStore`** — use `createState`.
- ⚠️ `getState()` is **deprecated** — use `getReactiveState()` / `getReadonlyState()`.
- ⚠️ `withDeepSelector`/`withSelectorOptions` default `deepSelector` to `true`, `stableSelector` to `false`.

## Troubleshooting — common errors

| Error | Meaning | Fix |
| --- | --- | --- |
| `expects to receive a plain object but got a promise` | `setup` returned a Promise | Return a plain/sync object |
| `has a function field in state` | Plain state contains a function | Move to `withActions` |
| `duplicate key [...] in 'state' and 'actions'` | Key collision | Rename one |
| `duplicate namespace` | Reused namespace | Use a unique namespace |
| `withPersist can't find storage` | No storage available | Browser or `getStorage` adapter |
| `selector should be a pure function` | Async selector | Make it synchronous |
| `unexpected update ... on the server` | Server-side update | Guard, or `configureEnv({ allowNonBrowserUpdates: true })` |

## Links

- Docs: <https://mrwangjusttodo.github.io/reactivity-store/>
- Source / issues: <https://github.com/MrWangJustToDo/reactivity-store>

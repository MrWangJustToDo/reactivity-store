# AGENTS.md

Guidelines for AI agents working in the `reactivity-store` codebase.

## Project Overview

This is a React state management library built on Vue's reactivity system (`@vue/reactivity`). It's a TypeScript monorepo using pnpm workspaces.

- **Package name**: `reactivity-store`
- **Main source**: `packages/r-store/src/`
- **Documentation**: `app/` (VitePress)

## Build/Lint/Test Commands

```bash
# Development
pnpm run dev:packages          # Watch mode build

# Build
pnpm run build                 # Full build (packages + types)
pnpm run build:packages        # Build packages with Rollup
pnpm run build:type            # Generate TypeScript declarations

# Lint & Format
pnpm run lint                  # Run ESLint
pnpm run lint:fix              # ESLint with auto-fix
pnpm run prettier              # Format with Prettier

# Documentation
pnpm run docs:dev              # VitePress dev server
pnpm run docs:build            # Build docs

# Maintenance
pnpm run clean                 # Remove dist/dev/.cache
pnpm run purge                 # Remove node_modules
```

### Running Tests

**No runtime test framework is configured.** The project uses compile-time type testing only:

```bash
# Type checking (validates type tests in packages/r-store/src/__test__/)
pnpm run build:type
```

## Code Style Guidelines

### Formatting (Prettier)

- Semi: true, TrailingComma: es5, SingleQuote: false
- TabWidth: 2, UseTabs: false, PrintWidth: 160

### TypeScript

- Strict mode enabled, Target: ESNext/ES6, JSX: react-jsx

### Import Organization

External packages first, blank line, then internal imports:

```typescript
import { effectScope, reactive } from "@vue/reactivity";
import { isPromise } from "@vue/shared";

import { createHook } from "../shared/hook";
import type { LifeCycle } from "../shared/lifeCycle";
```

### Naming Conventions

| Category       | Convention     | Examples                                |
| -------------- | -------------- | --------------------------------------- |
| Files          | camelCase      | `createStore.ts`, `useReactiveState.ts` |
| Public APIs    | camelCase      | `createStore`, `createState`            |
| Hooks          | `use` prefix   | `useReactiveState`, `useReactiveEffect` |
| Middleware     | `with` prefix  | `withActions`, `withPersist`            |
| Lifecycle      | `on` prefix    | `onMounted`, `onUnmounted`              |
| Types          | PascalCase     | `LifeCycle`, `Controller`               |
| Config types   | `Props` suffix | `WithPersistProps`                      |
| Internal keys  | `$$__name__$$` | `$$__state__$$`, `$$__middleware__$$`   |
| Internal props | `_` prefix     | `_effect`, `_isActive`, `_devState`     |

### Error Handling

Always use `[reactivity-store]` prefix. Guard dev-only code with `__DEV__`:

```typescript
if (__DEV__ && isPromise(state)) {
  console.error(`[reactivity-store] '${name}' got a promise instead of object`);
}
throw new Error("[reactivity-store] invalid usage");
console.error(`[reactivity-store/withPersist] middleware failed`);
```

Use `void 0` for silent catch: `catch { void 0; }`

### Type Patterns

Use function overloads for different call signatures:

```typescript
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>
): UseSelectorWithState<T, P>;

export function createState<T extends Record<string, unknown>>(setup: Setup<T>): UseSelectorWithState<T, {}>;
```

Use JSDoc for API visibility: `/** @public */` or `/** @internal */`

### Global Variables

Defined at build time (see `global.d.ts`):

- `__DEV__: boolean` - Development mode flag
- `__VERSION__: string` - Package version
- `__VUE_VERSION__: string` - Vue reactivity version

## Directory Structure

```
packages/r-store/src/
├── __test__/           # Type test files (compile-time only)
├── hook/               # React hooks (useReactiveState, useReactiveEffect)
├── shared/             # Internal utilities (controller, lifeCycle, tools)
├── state/              # createState API
│   └── middleware/     # State middleware (withActions, withPersist, etc.)
├── store/              # createStore API
└── index.ts            # Public exports
```

## Key APIs

- `createStore`: Component-scoped reactive store with lifecycle hooks
- `createState`: Global reactive state with middleware support
- `useReactiveState`: Hook for consuming reactive state
- `useReactiveEffect`: Hook for reactive side effects

## Build Output

- **CJS**: `dist/cjs/index.js`
- **ESM**: `dist/esm/index.mjs`
- **UMD**: `dist/umd/index.development.js`

## Common Tasks

### Adding a new middleware

1. Create file in `packages/r-store/src/state/middleware/`
2. Follow `withActions.ts` or `withPersist.ts` patterns
3. Export from `packages/r-store/src/index.ts`
4. Add type tests in `__test__/type.tsx`

### Modifying public API

1. Update implementation in `src/state/` or `src/store/`
2. Add function overloads if needed for different call signatures
3. Update type tests
4. Run `pnpm run build:type` to verify types
5. Run `pnpm run lint` before committing

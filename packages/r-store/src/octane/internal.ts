const subSlotCache = new Map<symbol, Map<string, symbol>>();

let bareSlotCount = 0;

/**
 * Fallback slot root for a store whose hooks are invoked without a compiler
 * slot. Octane resolves composed hook paths from slot DESCRIPTIONS (see
 * `resolveSlot`), so the description must be globally unique per store —
 * otherwise two stores would silently share hook state inside one component.
 *
 * @internal
 */
export function createBareSlotRoot(name: string): symbol {
  return Symbol(`reactivity-store/octane:${name}#${bareSlotCount++}`);
}

/**
 * Octane identifies hooks by compiler-provided call-site slots. A composed hook
 * must give each hook it calls a stable child slot of its own.
 *
 * @internal
 */
export function subSlot(slot: symbol, tag: string): symbol {
  let children = subSlotCache.get(slot);
  if (children === undefined) {
    children = new Map();
    subSlotCache.set(slot, children);
  }

  let child = children.get(tag);
  if (child === undefined) {
    child = Symbol.for(`${slot.description ?? "reactivity-store"}:${tag}`);
    children.set(tag, child);
  }
  return child;
}

/** @internal */
export function splitSlot(args: unknown[]): [unknown[], symbol | undefined] {
  const tail = args[args.length - 1];
  const slot = typeof tail === "symbol" ? tail : undefined;
  return [slot === undefined ? args : args.slice(0, -1), slot];
}

import { isProxy, isReactive, isRef, ReactiveFlags } from "@vue/reactivity";
import { isArray, isMap, isObject, isPlainObject, isSet } from "@vue/shared";

/**
 * @internal
 */
export function traverse(value: unknown, seen?: Set<unknown>) {
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP]) {
    return value;
  }
  seen = seen || new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      traverse(v, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse((value as any)[key], seen);
    }
  }
  return value;
}

/**
 * @internal
 */
export function checkHasReactive(value: unknown) {
  let hasReactive = false;

  function traverse(value: unknown, seen?: Set<unknown>) {
    if (!isObject(value)) return;
    if (hasReactive) return;
    if (isReactive(value) || isRef(value) || isProxy(value)) {
      hasReactive = true;
      return;
    }
    seen = seen || new Set();
    if (seen.has(value)) {
      return;
    }
    seen.add(value);
    if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        traverse(value[i], seen);
      }
    } else if (isSet(value) || isMap(value)) {
      value.forEach((v: any) => {
        traverse(v, seen);
      });
    } else if (isPlainObject(value)) {
      for (const key in value) {
        traverse((value as any)[key], seen);
      }
    }
    return;
  }

  traverse(value);

  return hasReactive;
}

/**
 * @internal
 */
export function checkHasMiddleware(value: unknown) {
  if (value && value?.["$$__middleware__$$"]) {
    return true;
  }
}

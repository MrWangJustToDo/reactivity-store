/* eslint-disable @typescript-eslint/ban-types */
import { isProxy, isReactive, isRef, ReactiveFlags } from "@vue/reactivity";
import { isArray, isFunction, isMap, isObject, isPlainObject, isSet } from "@vue/shared";
import { isValidElement } from "react";

function _traverse(value: unknown, seen?: Set<unknown>) {
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP] || isValidElement(value)) {
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

export function traverseShallow(value: unknown) {
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP] || isValidElement(value)) {
    return value;
  }
  if (isRef(value)) {
    value.value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i];
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      v;
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      value[key];
    }
  }
  return value;
}

/**
 * @internal
 */
export function traverse(value: unknown, seen?: Set<unknown>) {
  if (__DEV__) {
    const start = Date.now();
    const re = _traverse(value, seen);
    const end = Date.now();
    if (end - start > 5) {
      console.warn(`[reactivity-store] 'traverse' current data: %o take a lot of time`, re);
    }
    return re;
  } else {
    return _traverse(value, seen);
  }
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
export function checkHasFunction(value: unknown) {
  let hasFunction = false;

  function traverse(value: unknown, seen?: Set<unknown>) {
    if (hasFunction) return;
    if (isFunction(value)) {
      hasFunction = true;
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

  return hasFunction;
}

/**
 * @internal
 */
export function checkHasSameField(source: Record<string, unknown>, target: Record<string, unknown>) {
  return Object.keys(source).filter((key) => key in target);
}

/**
 * @internal
 */
export function checkHasMiddleware(value: unknown) {
  if (value && value?.["$$__state__$$"] && value?.["$$__middleware__$$"]) {
    return true;
  }
}

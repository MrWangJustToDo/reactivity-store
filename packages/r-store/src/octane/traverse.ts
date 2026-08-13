/* eslint-disable @typescript-eslint/no-unused-expressions */
import { isProxy, isReactive, isRef, ReactiveFlags } from "@vue/reactivity";
import { isArray, isMap, isObject, isPlainObject, isSet } from "@vue/shared";
import { isValidElement } from "octane";

function traverseValue(value: unknown, seen?: Set<unknown>) {
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP] || isValidElement(value)) {
    return value;
  }
  seen = seen || new Set();
  if (seen.has(value)) return value;
  seen.add(value);

  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (isArray(value)) {
    for (let index = 0; index < value.length; index++) traverse(value[index], seen);
  } else if (isSet(value) || isMap(value)) {
    value.forEach((item: unknown) => traverse(item, seen));
  } else if (isPlainObject(value)) {
    for (const key in value) traverse((value as any)[key], seen);
  }
  return value;
}

/** @internal */
export function traverseShallow(value: unknown) {
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP] || isValidElement(value)) return value;

  if (isRef(value)) {
    value.value;
  } else if (isArray(value)) {
    for (let index = 0; index < value.length; index++) value[index];
  } else if (isSet(value) || isMap(value)) {
    value.forEach((item: unknown) => item);
  } else if (isPlainObject(value)) {
    for (const key in value) value[key];
  }
  return value;
}

/** @internal */
export function traverse(value: unknown, seen?: Set<unknown>) {
  if (!__DEV__) return traverseValue(value, seen);

  const start = Date.now();
  const result = traverseValue(value, seen);
  if (Date.now() - start > 5) {
    console.warn(`[reactivity-store] 'traverse' current data: %o take a lot of time`, result);
  }
  return result;
}

/** @internal */
export function checkHasReactive(value: unknown) {
  let hasReactive = false;

  const visit = (item: unknown, seen = new Set<unknown>()) => {
    if (!isObject(item) || hasReactive || seen.has(item)) return;
    if (isReactive(item) || isRef(item) || isProxy(item)) {
      hasReactive = true;
      return;
    }
    seen.add(item);
    if (isArray(item)) {
      for (const child of item) visit(child, seen);
    } else if (isSet(item) || isMap(item)) {
      item.forEach((child: unknown) => visit(child, seen));
    } else if (isPlainObject(item)) {
      for (const key in item) visit((item as any)[key], seen);
    }
  };

  visit(value);
  return hasReactive;
}

import { useMemo, useEffect, useState } from "react";

import { createLifeCycle } from "../shared/lifeCycle";
import { checkHasSameField } from "../shared/tools";

import { internalCreateStore, setGlobalStoreLifeCycle } from "./_internal";

import type { Creator } from "./_internal";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";
import type { ReactNode, ReactElement } from "react";

/**
 * @public
 */
export type CreateStoreWithComponentProps<P extends Record<string, unknown>, T extends Record<string, unknown>> = {
  setup: Creator<T>;
  render?: (props: P & DeepReadonly<UnwrapNestedRefs<T>>) => ReactNode;
};

// TODO
/**
 * @public
 * @deprecated
 * not recommend to use this function, use `createStore` instead
 */
export function createStoreWithComponent<T extends Record<string, unknown>>(
  props: CreateStoreWithComponentProps<NonNullable<unknown>, T>
): ({ children }: { children?: (p: DeepReadonly<UnwrapNestedRefs<T>>) => ReactNode }) => ReactElement;
/**
 * @public
 * @deprecated
 * not recommend to use this function, use `createStore` instead
 */
export function createStoreWithComponent<P extends Record<string, unknown>, T extends Record<string, unknown>>(
  props: CreateStoreWithComponentProps<P, T>
): ({ children }: { children?: (p: P & DeepReadonly<UnwrapNestedRefs<T>>) => ReactNode } & P) => ReactElement;
/**
 * @public
 * @deprecated
 * not recommend to use this function, use `createStore` instead
 */
export function createStoreWithComponent<P extends Record<string, unknown>, T extends Record<string, unknown>>(props: CreateStoreWithComponentProps<P, T>) {
  const { setup, render } = props;

  const ComponentWithState = (props: P & { children?: CreateStoreWithComponentProps<P, T>["render"] }) => {
    const useSelector = useMemo(() => {
      const lifeCycleInstance = createLifeCycle();

      setGlobalStoreLifeCycle(lifeCycleInstance);

      const useSelector = internalCreateStore(setup, "createStoreWithComponent", lifeCycleInstance);

      setGlobalStoreLifeCycle(null);

      return useSelector;
    }, []);

    const [isMount, setIsMount] = useState(false);

    const state = useSelector.getReadonlyState();

    if (__DEV__) {
      const sameField = checkHasSameField(state, props);
      sameField.forEach((key) => console.warn(`[reactivity-store] duplicate key: [${key}] in Component props and RStore state, this is a unexpected usage`));
    }

    const lifeCycleInstance = useSelector.getLifeCycle();

    const { children, ...last } = props;

    const _targetRender = render || props.children;

    const targetRender =
      _targetRender ??
      (() => {
        lifeCycleInstance.canUpdateComponent = false;
        if (__DEV__) {
          console.warn(`[reactivity-store] current reactive component not have a render function`);
        }
      });

    // subscribe reactivity-store update
    useSelector();

    useEffect(() => {
      if (lifeCycleInstance.hasHookInstall) {
        if (!isMount) {
          lifeCycleInstance.onBeforeMount.forEach((f) => f());
          lifeCycleInstance.onMounted.forEach((f) => f());
          setIsMount(true);
        } else {
          const lastSync = lifeCycleInstance.syncUpdateComponent;
          lifeCycleInstance.syncUpdateComponent = true;
          lifeCycleInstance.canUpdateComponent = false;
          lifeCycleInstance.onBeforeUpdate.forEach((f) => f());
          lifeCycleInstance.canUpdateComponent = true;
          lifeCycleInstance.syncUpdateComponent = lastSync;
          lifeCycleInstance.onUpdated.forEach((f) => f());
        }
      }
    });

    useEffect(() => {
      return () => {
        if (lifeCycleInstance.hasHookInstall) {
          lifeCycleInstance.onBeforeUnmount.forEach((f) => f());
          lifeCycleInstance.onUnmounted.forEach((f) => f());
        }
      };
    }, [lifeCycleInstance]);

    useEffect(() => () => useSelector.scope?.stop(), [useSelector]);

    const renderedChildren = targetRender({ ...last, ...state } as P & DeepReadonly<UnwrapNestedRefs<T>>) || null;

    return renderedChildren;
  };

  return ComponentWithState;
}

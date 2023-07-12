import { Component, Fragment, createElement, useMemo } from "react";

import { createLifeCycle } from "../shared/lifeCycle";

import { createStoreWithLifeCycle, setGlobalStoreLifeCycle } from "./internal";

import type { Creator } from "./internal";
import type { LifeCycle } from "../shared/lifeCycle";
import type { ShallowUnwrapRef } from "@vue/reactivity";
import type { ReactNode, ReactElement } from "react";

export type CreateStoreWithComponentProps<P extends Record<string, unknown>, T extends Record<string, unknown>> = {
  setup: Creator<T>;
  render?: (props: P & ShallowUnwrapRef<T>) => ReactNode;
};

// TODO
export function createStoreWithComponent<T extends Record<string, unknown>>(
  props: CreateStoreWithComponentProps<never, T>
): ({ children }: { children?: (p: ShallowUnwrapRef<T>) => ReactNode }) => ReactElement;
export function createStoreWithComponent<P extends Record<string, unknown>, T extends Record<string, unknown>>(
  props: CreateStoreWithComponentProps<P, T>
): ({ children }: { children?: (p: P & ShallowUnwrapRef<T>) => ReactNode } & P) => ReactElement;
export function createStoreWithComponent<P extends Record<string, unknown>, T extends Record<string, unknown>>(props: CreateStoreWithComponentProps<P, T>) {
  const { setup, render } = props;

  class ForBeforeUnmount extends Component<{ ["$$__instance__$$"]: LifeCycle; children: ReactNode }> {
    componentWillUnmount(): void {
      this.props.$$__instance__$$.onBeforeUnmount.forEach((f) => f());
    }

    render(): ReactNode {
      return this.props.children;
    }
  }

  class ForBeforeMount extends Component<{ ["$$__instance__$$"]: LifeCycle; children: ReactNode }> {
    componentDidMount(): void {
      this.props.$$__instance__$$.onBeforeMount.forEach((f) => f());
    }

    render(): ReactNode {
      return this.props.children;
    }
  }

  type RenderWithLifeCycleProps = {
    ["$$__instance__$$"]: LifeCycle;
    children: ReactNode;
  };

  class RenderWithLifeCycle extends Component<RenderWithLifeCycleProps> {
    componentDidMount(): void {
      this.props.$$__instance__$$.onMounted.forEach((f) => f());
    }

    componentDidUpdate(): void {
      this.props.$$__instance__$$.onUpdated.forEach((f) => f());
    }

    componentWillUnmount(): void {
      this.props.$$__instance__$$.onUnmounted.forEach((f) => f());
    }

    shouldComponentUpdate(): boolean {
      this.props.$$__instance__$$.canUpdateComponent = false;
      this.props.$$__instance__$$.onBeforeUpdate.forEach((f) => f());
      this.props.$$__instance__$$.canUpdateComponent = true;
      return true;
    }

    render(): ReactNode {
      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.props.children });
    }
  }

  const ComponentWithState = (props: P & { children?: CreateStoreWithComponentProps<P, T>["render"] }) => {
    const useSelector = useMemo(() => {
      const lifeCycleInstance = createLifeCycle();

      setGlobalStoreLifeCycle(lifeCycleInstance);

      const useSelector = createStoreWithLifeCycle(setup, "createStoreWithComponent", lifeCycleInstance);

      setGlobalStoreLifeCycle(null);

      return useSelector;
    }, []);

    const state = useSelector.getFinalState();

    if (__DEV__) {
      for (const key in props) {
        if (key in state) {
          console.warn(`[reactivity-store] duplicate key ${key} in Component props and RStore state, please fix this usage`);
        }
      }
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

    const renderedChildren = targetRender({ ...last, ...state } as P & ShallowUnwrapRef<T>) || null;

    if (lifeCycleInstance.hasHookInstall) {
      return createElement(ForBeforeUnmount, {
        ["$$__instance__$$"]: lifeCycleInstance,
        children: createElement(RenderWithLifeCycle, {
          children: createElement(Fragment, null, renderedChildren),
          ["$$__instance__$$"]: lifeCycleInstance,
        }),
      });
    } else {
      return createElement(Fragment, null, renderedChildren);
    }
  };

  return ComponentWithState;
}

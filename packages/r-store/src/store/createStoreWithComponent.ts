import { Component, createElement, useMemo } from "react";

import { createLifeCycle } from "../shared/lifeCycle";

import { createStoreWithLifeCycle, setGlobalStoreLifeCycle } from "./internal";

import type { Creator } from "./internal";
import type { LifeCycle } from "../shared/lifeCycle";
import type { ShallowUnwrapRef } from "@vue/reactivity";
import type { ReactNode } from "react";

export type CreateStoreWithComponentProps<P extends Record<string, unknown>, T extends Record<string, unknown>> = {
  setup: Creator<T>;
  render?: (props: P & ShallowUnwrapRef<T>) => JSX.Element;
};

export const createStoreWithComponent = <P extends Record<string, unknown> = any, T extends Record<string, unknown> = any>(
  props: CreateStoreWithComponentProps<P, T>
) => {
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
    children: JSX.Element;
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

  const ComponentWithState = <Q extends P>(props: Q & { children?: CreateStoreWithComponentProps<P, T>["render"] }) => {
    const useSelector = useMemo(() => {
      const lifeCycleInstance = createLifeCycle();

      setGlobalStoreLifeCycle(lifeCycleInstance);

      const useSelector = createStoreWithLifeCycle(setup, "createStoreWithComponent", lifeCycleInstance);

      setGlobalStoreLifeCycle(null);

      return useSelector;
    }, []);

    if (__DEV__) {
      const state = useSelector.getState();
      for (const key in props) {
        if (key in state) {
          console.warn(`[reactivity-store] duplicate key ${key} in Component props and RStore state, please fix this usage`);
        }
      }
    }

    const lifeCycleInstance = useSelector.getLifeCycle();

    const { children, ...last } = props;

    const targetRender = render || props.children;

    const renderedChildren = useSelector((state) => targetRender({ ...last, ...state } as P & ShallowUnwrapRef<T>)) || null;

    if (lifeCycleInstance.hasHookInstall) {
      return createElement(ForBeforeUnmount, {
        ["$$__instance__$$"]: lifeCycleInstance,
        children: createElement(RenderWithLifeCycle, {
          children: renderedChildren,
          ["$$__instance__$$"]: lifeCycleInstance,
        }),
      });
    } else {
      return renderedChildren;
    }
  };

  return ComponentWithState;
};

import { Component, createElement, useMemo } from "react";

import { internalCreateStore } from "./core";

import type { LifeCycle } from "./core";
import type { ShallowUnwrapRef } from "@vue/reactivity";
import type { ReactNode } from "react";

export const createStore = <T extends Record<string, unknown>>(creator: () => T) => {
  const { useSelector, updateStateWithoutReactiveUpdate } = internalCreateStore(creator);

  const typedUseSelector = useSelector as typeof useSelector & { updateStateWithoutReactiveUpdate: typeof updateStateWithoutReactiveUpdate };

  typedUseSelector.updateStateWithoutReactiveUpdate = updateStateWithoutReactiveUpdate;

  return typedUseSelector;
};

export type CreateStoreWithComponentProps<P extends Record<string, unknown>, T extends Record<string, unknown>> = {
  setup: () => T;
  render?: (props: P & ShallowUnwrapRef<T>) => JSX.Element;
};

export const createStoreWithComponent = <P extends Record<string, unknown>, T extends Record<string, unknown>>(props: CreateStoreWithComponentProps<P, T>) => {
  const { setup, render } = props;

  const ComponentWithState = <Q extends P>(props: Q & { children?: CreateStoreWithComponentProps<Q, T>["render"] }) => {
    const { useSelector, lifeCycleInstance } = useMemo(() => internalCreateStore(setup), []);

    const state = useSelector();

    if (__DEV__) {
      for (const key in props) {
        if (key in state) {
          console.warn(`duplicate key ${key} in Component props and RStore state, please fix this usage`);
        }
      }
    }

    if (lifeCycleInstance.hasHookInstall) {
      return createElement(ForBeforeUnmount, {
        ["$$__instance__$$"]: lifeCycleInstance,
        children: createElement(ComponentWithLifeCycle, { ...props, ...state, ["$$__instance__$$"]: lifeCycleInstance }),
      });
    } else {
      const { children, ...last } = props;

      const targetRender = (render || children) as CreateStoreWithComponentProps<P, T>["render"];

      return targetRender?.({ ...last, ...state } as P & ShallowUnwrapRef<T>) || null;
    }
  };

  type ClassProps = P & ShallowUnwrapRef<T> & { children?: CreateStoreWithComponentProps<P, T>["render"] } & { ["$$__instance__$$"]: LifeCycle };

  class ComponentWithLifeCycle extends Component<ClassProps> {
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
      const { children, $$__instance__$$, ...props } = this.props;

      const targetRender = render || children;

      return createElement(ForBeforeMount, { ["$$__instance__$$"]: $$__instance__$$, children: targetRender?.(props as P & ShallowUnwrapRef<T>) || null });
    }
  }

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

  return ComponentWithState;
};

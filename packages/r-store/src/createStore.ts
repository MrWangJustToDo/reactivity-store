import { Component, createElement, memo } from "react";

import { internalCreateStore } from "./core";

import type { ShallowUnwrapRef } from "@vue/reactivity";
import type { ReactNode } from "react";

export const createStore = <T extends Record<string, unknown>>(creator: () => T) => {
  const { useSelector } = internalCreateStore(creator);

  return useSelector;
};

export type CreateStoreWithComponentProps<P extends Record<string, unknown>, T extends Record<string, unknown>> = {
  setup: () => T;
  render?: (props: P & ShallowUnwrapRef<T>) => JSX.Element;
};

export const createStoreWithComponent = <P extends Record<string, unknown>, T extends Record<string, unknown>>(props: CreateStoreWithComponentProps<P, T>) => {
  const { setup, render } = props;
  const { useSelector, lifeCycleInstance, canUpdateComponent } = internalCreateStore(setup);

  const ComponentWithState = (props: P) => {
    const state = useSelector();

    if (__DEV__) {
      for (const key in props) {
        if (key in state) {
          console.warn(`duplicate key ${key} in Component props and RStore state, please fix this usage`);
        }
      }
    }

    if (lifeCycleInstance.hasHookInstall) {
      return createElement(ForBeforeUnmount, null, createElement(ComponentWithLifeCycle, { ...props, ...state }));
    } else {
      const { children, ...last } = props;

      const targetRender = (render || children) as CreateStoreWithComponentProps<P, T>["render"];

      return targetRender?.({ ...last, ...state } as P & ShallowUnwrapRef<T>) || null;
    }
  };

  type ClassProps = P & ShallowUnwrapRef<T> & { children?: CreateStoreWithComponentProps<P, T>["render"] };

  class ComponentWithLifeCycle extends Component<ClassProps> {
    componentDidMount(): void {
      lifeCycleInstance.onMounted.forEach((f) => f());
    }

    componentDidUpdate(): void {
      lifeCycleInstance.onUpdated.forEach((f) => f());
    }

    componentWillUnmount(): void {
      lifeCycleInstance.onUnmounted.forEach((f) => f());
    }

    shouldComponentUpdate(): boolean {
      canUpdateComponent.flag = false;
      lifeCycleInstance.onBeforeUpdate.forEach((f) => f());
      canUpdateComponent.flag = true;
      return true;
    }

    render(): ReactNode {
      const { children, ...props } = this.props;

      const targetRender = render || children;

      return createElement(ForBeforeMount, { children: targetRender?.(props as P & ShallowUnwrapRef<T>) || null });
    }
  }

  // parent component unmount will be invoked before children
  class ForBeforeUnmount extends Component<{ children: ReactNode }> {
    componentWillUnmount(): void {
      lifeCycleInstance.onBeforeUnmount.forEach((f) => f());
    }

    render(): ReactNode {
      return this.props.children;
    }
  }

  // child component didMount will be invoked before parent
  class ForBeforeMount extends Component<{ children: ReactNode }> {
    componentDidMount(): void {
      lifeCycleInstance.onBeforeMount.forEach((f) => f());
    }

    render(): ReactNode {
      return this.props.children;
    }
  }

  return memo(ComponentWithState);
};

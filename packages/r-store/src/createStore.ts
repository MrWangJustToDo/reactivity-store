import { Component, createElement, Fragment, memo } from "react";

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

    return createElement(ComponentWithLifeCycle, { ...props, ...state });
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

      return typeof targetRender === "function"
        ? createElement(Fragment, null, targetRender(props as P & ShallowUnwrapRef<T>), createElement(OnlyForLifeCycle))
        : null;
    }
  }

  class OnlyForLifeCycle extends Component {
    componentDidMount(): void {
      lifeCycleInstance.onBeforeMount.forEach((f) => f());
    }

    componentWillUnmount(): void {
      lifeCycleInstance.onBeforeUnmount.forEach((f) => f());
    }

    render(): ReactNode {
      return null;
    }
  }

  return memo(ComponentWithState);
};

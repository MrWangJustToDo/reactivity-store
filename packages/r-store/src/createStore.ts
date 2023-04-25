import { ReactiveEffect, proxyRefs } from "@vue/reactivity";
import { Component, createElement, useCallback, useMemo, useState } from "react";

import { internalCreateStore, ueForceUpdate } from "./core";

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

  type RenderWithLifeCycleProps = P & {
    ["$$__state__$$"]: ShallowUnwrapRef<T>;
    ["$$__trigger__$$"]: () => void;
    ["$$__instance__$$"]: LifeCycle;
    children?: CreateStoreWithComponentProps<P, T>["render"];
  };

  type RenderProps = P & {
    ["$$__state__$$"]: ShallowUnwrapRef<T>;
    ["$$__trigger__$$"]: () => void;
    children?: CreateStoreWithComponentProps<P, T>["render"];
  };

  class RenderWithLifeCycle extends Component<RenderWithLifeCycleProps> {
    componentDidMount(): void {
      this.effect.active = true;
      this.effect.run();
      this.props.$$__instance__$$.onMounted.forEach((f) => f());
    }

    componentDidUpdate(): void {
      this.props.$$__instance__$$.onUpdated.forEach((f) => f());
    }

    componentWillUnmount(): void {
      this.props.$$__instance__$$.onUnmounted.forEach((f) => f());
      this.effect.stop();
    }

    shouldComponentUpdate(): boolean {
      this.props.$$__instance__$$.canUpdateComponent = false;
      this.props.$$__instance__$$.onBeforeUpdate.forEach((f) => f());
      this.props.$$__instance__$$.canUpdateComponent = true;
      return true;
    }

    effect = new ReactiveEffect(() => {
      const { children, $$__trigger__$$, $$__state__$$, $$__instance__$$, ...last } = this.props;
      const targetRender = render || children;
      const element = targetRender?.({ ...last, ...$$__state__$$ } as P & ShallowUnwrapRef<T>) || null;
      return element;
    }, this.props.$$__trigger__$$);

    render(): ReactNode {
      return createElement(ForBeforeMount, { ["$$__instance__$$"]: this.props.$$__instance__$$, children: this.effect.run() });
    }
  }

  class Render extends Component<RenderProps> {
    componentWillUnmount(): void {
      this.effect.stop();
    }

    effect = new ReactiveEffect(() => {
      const { children, $$__trigger__$$, $$__state__$$, $$__instance__$$, ...last } = this.props;
      const targetRender = render || children;
      const element = targetRender?.({ ...last, ...$$__state__$$ } as P & ShallowUnwrapRef<T>) || null;
      return element;
    }, this.props.$$__trigger__$$);

    render(): ReactNode {
      return this.effect.run();
    }
  }

  const ComponentWithState = <Q extends P>(props: Q & { children?: CreateStoreWithComponentProps<P, T>["render"] }) => {
    const [{ lifeCycleInstance, getState }] = useState(() => internalCreateStore(setup));

    const state = useMemo(() => proxyRefs(getState()), []);

    const update = ueForceUpdate();

    const forceUpdate = useCallback(() => {
      if (lifeCycleInstance.canUpdateComponent) {
        update();
      }
    }, [lifeCycleInstance]);

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
        children: createElement(RenderWithLifeCycle, {
          ...props,
          ["$$__state__$$"]: state,
          ["$$__trigger__$$"]: forceUpdate,
          ["$$__instance__$$"]: lifeCycleInstance,
        }),
      });
    } else {
      return createElement(Render, { ...props, ["$$__state__$$"]: state, ["$$__trigger__$$"]: forceUpdate });
    }
  };

  return ComponentWithState;
};

import { ReactiveEffect, proxyRefs } from "@vue/reactivity";
import { Component, createElement, useCallback, useMemo } from "react";

import { isServer } from "../shared/env";
import { useForceUpdate } from "../shared/hook";
import { createLifeCycle } from "../shared/lifeCycle";
import { checkHasMiddleware, checkHasReactive } from "../shared/tools";

import { setGlobalStoreLifeCycle } from "./internal";

import type { Creator} from "./internal";
import type { LifeCycle } from "../shared/lifeCycle";
import type { ShallowUnwrapRef } from "@vue/reactivity";
import type { ReactNode } from "react";

export type CreateStoreWithComponentProps<P extends Record<string, unknown>, T extends Record<string, unknown>> = {
  setup: Creator<T>;
  render?: (props: P & ShallowUnwrapRef<T>) => JSX.Element;
};

export const createStoreWithComponent = <P extends Record<string, unknown> = any, T extends Record<string, unknown> = any>(props: CreateStoreWithComponentProps<P, T>) => {
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
    const { lifeCycleInstance, proxyState: state } = useMemo(() => {
      const lifeCycleInstance = createLifeCycle();

      setGlobalStoreLifeCycle(lifeCycleInstance);

      const state = setup();

      setGlobalStoreLifeCycle(null);

      if (__DEV__ && checkHasMiddleware(state)) {
        console.error(`[reactivity-store] 'createStoreWithComponent' not support middleware usage, please change to use 'createState'`);
      }

      if (__DEV__ && !checkHasReactive(state)) {
        console.error(`[reactivity-store] 'createStoreWithComponent' expect receive a reactive object but got a plain object, this is a unexpected usage`);
      }

      const proxyState = proxyRefs(state);

      return {
        proxyState,
        lifeCycleInstance,
      };
    }, []);

    const update = useForceUpdate();

    const forceUpdate = useCallback(() => {
      if (lifeCycleInstance.canUpdateComponent) {
        if (__DEV__ && isServer) {
          console.error(`[reactivity-store] unexpected update for reactivity-store, should not update a state on the server`);
        }
        update();
      }
    }, [lifeCycleInstance]);

    if (__DEV__) {
      for (const key in props) {
        if (key in state) {
          console.warn(`[reactivity-store] duplicate key ${key} in Component props and RStore state, please fix this usage`);
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
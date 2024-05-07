import { useEffect } from "react";

import { Controller } from "../shared/controller";
import { InternalNameSpace } from "../shared/env";
import { useCallbackRef } from "../shared/hook";
import { createLifeCycle } from "../shared/lifeCycle";

const temp = new Set<Controller>();

/**
 * @public
 */
export const useReactiveEffect = (effectCallback: () => void | (() => void)) => {
  const memoCallback = useCallbackRef(effectCallback);

  useEffect(() => {
    let cleanCb = () => void 0;

    const subscribe = () => {
      const clean = memoCallback();
      if (typeof clean === "function") {
        cleanCb = clean;
      } else {
        cleanCb = () => void 0;
      }
    };

    const controller = new Controller(subscribe, createLifeCycle(), temp, InternalNameSpace.$$__subscribe__$$, () => {
      // run the effect when the subscribed state change
      cleanCb();
      controller.run();
    });

    // run the effect on the component mount
    controller.run();

    return () => {
      cleanCb();
      controller.stop();
    };
  }, []);
};

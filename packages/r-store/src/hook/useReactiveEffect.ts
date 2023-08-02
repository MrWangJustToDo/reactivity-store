import { useEffect } from "react";

import { Controller } from "../shared/controller";
import { useCallbackRef } from "../shared/hook";
import { createLifeCycle } from "../shared/lifeCycle";

export const useReactiveEffect = (effectCallback: () => void | (() => void)) => {
  const memoCallback = useCallbackRef(effectCallback);

  useEffect(() => {
    let cleanCb = () => void 0;

    const subscribe = () => {
      const clean = memoCallback();
      if (typeof clean === "function") {
        cleanCb = clean;
      }
    };

    const controller = new Controller(subscribe, createLifeCycle(), "$$__ignore__$$", () => {
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

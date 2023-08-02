import { useState } from "react";

import { createState } from "../state/createState";

export const useReactiveState = <T extends Record<string, unknown>>(initialState: T | (() => T)) => {
  const [useSelector] = useState(() => {
    const setup = typeof initialState === "function" ? initialState : () => initialState;
    return createState(setup);
  });

  // subscribe reactive store update
  useSelector();

  return useSelector.getFinalState();
};

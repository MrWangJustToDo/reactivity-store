import { useState } from "react";

import { internalCreateState } from "../state/_internal";

export const useReactiveState = <T extends Record<string, unknown>>(initialState: T | (() => T)) => {
  const [useSelector] = useState(() => {
    const setup = typeof initialState === "function" ? initialState : () => initialState;
    return internalCreateState(setup, "useReactiveState");
  });

  // subscribe reactive store update
  useSelector();

  return useSelector.getFinalState();
};

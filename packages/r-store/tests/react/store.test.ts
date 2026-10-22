import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

import { createStore, ref } from "reactivity-store";

describe("default React entry", () => {
  it("still subscribes and renders updates after the shim is bundled", async () => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    const count = ref(0);
    const useCounter = createStore(() => ({ count }));
    const Counter = () =>
      createElement(
        "span",
        { id: "count" },
        useCounter((state) => state.count)
      );
    const container = document.createElement("div");
    const root = createRoot(container);

    await act(async () => root.render(createElement(Counter)));
    expect(container.querySelector("#count")?.textContent).toBe("0");

    await act(async () => {
      useCounter.getReactiveState().count++;
      await Promise.resolve();
    });
    expect(container.querySelector("#count")?.textContent).toBe("1");

    await act(async () => root.unmount());
  });
});

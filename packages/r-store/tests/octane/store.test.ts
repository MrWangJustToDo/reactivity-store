import { createRoot, delegateEvents, drainPassiveEffects, flushSync } from "octane";
import { beforeAll, describe, expect, it } from "vitest";

import { resetCounter, StoreView, useCounter } from "./store.tsrx";

beforeAll(() => delegateEvents(["click"]));

const nextUpdate = async () => {
  await Promise.resolve();
  flushSync(() => {});
  drainPassiveEffects();
};

describe("reactivity-store/octane", () => {
  it("keeps selector call sites independent and updates from native events", async () => {
    resetCounter();
    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(StoreView);
    flushSync(() => {});
    drainPassiveEffects();

    expect(container.querySelector("#count")?.textContent).toBe("0");
    expect(container.querySelector("#other")?.textContent).toBe("10");

    flushSync(() => (container.querySelector("#increment") as HTMLButtonElement).click());
    await nextUpdate();
    expect(useCounter.getReadonlyState().count).toBe(1);
    expect(container.querySelector("#count")?.textContent).toBe("1");
    expect(container.querySelector("#other")?.textContent).toBe("10");

    flushSync(() => (container.querySelector("#increment-other") as HTMLButtonElement).click());
    await nextUpdate();
    expect(container.querySelector("#count")?.textContent).toBe("1");
    expect(container.querySelector("#other")?.textContent).toBe("11");

    root.unmount();
  });

  it("preserves the external subscribe and cleanup contract", async () => {
    resetCounter();
    let updates = 0;
    const unsubscribe = useCounter.subscribe(
      (state) => state.count,
      () => updates++
    );

    useCounter.getReactiveState().count++;
    await nextUpdate();
    expect(updates).toBe(1);

    unsubscribe();
    useCounter.getReactiveState().count++;
    await nextUpdate();
    expect(updates).toBe(1);
  });
});

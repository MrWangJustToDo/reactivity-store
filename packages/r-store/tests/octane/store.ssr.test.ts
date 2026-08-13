import { renderToStaticMarkup } from "octane/server";
import { describe, expect, it } from "vitest";

import { resetCounter, StoreView } from "./store.tsrx";

describe("reactivity-store/octane SSR", () => {
  it("reads the same selector surface without a DOM", () => {
    resetCounter(7, 11);
    const { html, css } = renderToStaticMarkup(StoreView);
    expect(html).toContain('<span id="count">7</span>');
    expect(html).toContain('<span id="other">11</span>');
    expect(css).toBe("");
  });
});

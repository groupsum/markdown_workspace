import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  defaultFirstViewportMotionPolicy,
  isCompositedLanderMotionProperty,
} from "../dist/index.js";

const css = readFileSync(resolve("src/styles/default.css"), "utf8");

for (const selector of [
  ".lander-breadcrumbs",
  ".lander-breadcrumbs__list",
  ".lander-breadcrumbs__item",
  ".lander-breadcrumbs__link",
  ".lander-breadcrumbs__current",
  '[data-lander-theme="lander-dark"] .lander-breadcrumbs',
  '[data-lander-theme="dark"] .lander-breadcrumbs',
  ".dark .lander-breadcrumbs",
]) {
  assert.ok(css.includes(selector), `missing breadcrumb selector: ${selector}`);
}

assert.ok(css.includes("var(--lander-panel)"));
assert.ok(css.includes("var(--lander-fg-muted)"));
assert.ok(css.includes("var(--lander-heading-fg)"));
assert.ok(css.includes("var(--lander-accent-soft)"));
assert.deepEqual(defaultFirstViewportMotionPolicy.allowedAnimatedProperties, ["opacity", "transform"]);
assert.equal(defaultFirstViewportMotionPolicy.reducedMotionRequired, true);
assert.equal(isCompositedLanderMotionProperty("transform"), true);
assert.equal(isCompositedLanderMotionProperty("left"), false);

import type { FeatureLifecycle, ScreenId } from "./contracts";

/** Owns one mounted screen. Feature factories retain only their own local UI state. */
export function createScreenRegistry(features: Record<ScreenId, FeatureLifecycle>) {
  let current: ScreenId | null = null;
  return Object.freeze({
    show(id: ScreenId) {
      if (current !== null && current !== id) features[current].destroy();
      current = id;
      features[id].mount();
    },
    update() {
      if (current !== null) features[current].update();
    },
    destroy() {
      if (current !== null) features[current].destroy();
      current = null;
    },
    current: () => current
  });
}

export type ScreenId = "today" | "train" | "nutrition" | "wellbeing" | "recovery" | "routines" | "progress" | "settings";
export type ThemeId = "emerald-ivory" | "night-emerald";
export type PrimaryTab = "home" | "train" | "food" | "wellbeing" | "insights";
export interface FeatureLifecycle {
  mount(): void;
  update(): void;
  destroy(): void;
}
export interface RouteDefinition {
  id: string;
  path: string;
  title: string;
  aliases?: string[];
  activate(): void;
}

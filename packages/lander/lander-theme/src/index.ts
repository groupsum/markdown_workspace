export * from "./version.js";

export interface LanderThemeTokens {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  panel: string;
  border: string;
  radius: string;
  maxWidth: string;
}

export const defaultLightLanderTokens: LanderThemeTokens = {
  background: "#ffffff",
  foreground: "#111111",
  muted: "#5f6368",
  accent: "#2454d6",
  panel: "#f6f7f9",
  border: "#d9dde4",
  radius: "8px",
  maxWidth: "1120px",
};

export const defaultDarkLanderTokens: LanderThemeTokens = {
  background: "#101214",
  foreground: "#f4f6f8",
  muted: "#aeb6c2",
  accent: "#7aa2ff",
  panel: "#191d22",
  border: "#303741",
  radius: "8px",
  maxWidth: "1120px",
};

export type LanderCompositedMotionProperty = "opacity" | "transform";

export interface LanderFirstViewportMotionPolicy {
  allowedAnimatedProperties: readonly LanderCompositedMotionProperty[];
  reducedMotionRequired: boolean;
}

export const defaultFirstViewportMotionPolicy: LanderFirstViewportMotionPolicy = {
  allowedAnimatedProperties: ["opacity", "transform"],
  reducedMotionRequired: true,
};

export function isCompositedLanderMotionProperty(
  property: string,
): property is LanderCompositedMotionProperty {
  return defaultFirstViewportMotionPolicy.allowedAnimatedProperties.includes(
    property.trim().toLowerCase() as LanderCompositedMotionProperty,
  );
}

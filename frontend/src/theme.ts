import { Platform } from "react-native";

export const colors = {
  surface: "#F4F4F4",
  onSurface: "#111111",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#111111",
  surfaceTertiary: "#EAEAEA",
  surfaceInverse: "#111111",
  onSurfaceInverse: "#FFFFFF",
  brand: "#FF3B00",
  brandSecondary: "#E63500",
  onBrand: "#FFFFFF",
  success: "#00CC44",
  warning: "#FFD600",
  onWarning: "#111111",
  error: "#FF0033",
  onError: "#FFFFFF",
  border: "#111111",
  muted: "#7A7A7A",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const fontMono = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export const fontDisplay = Platform.select({
  ios: "Helvetica",
  android: "sans-serif",
  default: "System",
});

export const type = {
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 48,
};

export const BORDER = 2;

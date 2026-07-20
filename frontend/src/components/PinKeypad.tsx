import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BORDER, colors, fontDisplay, fontMono, spacing } from "@/src/theme";

type Props = {
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
  testIDPrefix?: string;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export function PinKeypad({
  value,
  onChange,
  maxLength = 4,
  testIDPrefix = "pin",
}: Props) {
  const press = useCallback(
    (k: string) => {
      Haptics.selectionAsync();
      if (k === "⌫") {
        onChange(value.slice(0, -1));
        return;
      }
      if (!k) return;
      if (value.length >= maxLength) return;
      onChange(value + k);
    },
    [maxLength, onChange, value],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length: maxLength }).map((_, i) => {
          const filled = i < value.length;
          return (
            <View
              key={i}
              testID={`${testIDPrefix}-slot-${i}`}
              style={[styles.slot, filled && styles.slotFilled]}
            >
              <Text style={styles.slotDigit}>{filled ? value[i] : ""}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.pad}>
        {KEYS.map((k, i) => (
          <Pressable
            key={`${k}-${i}`}
            testID={k ? `${testIDPrefix}-key-${k}` : undefined}
            onPress={() => press(k)}
            disabled={!k}
            style={({ pressed }) => [
              styles.key,
              !k && styles.keyEmpty,
              pressed && k && styles.keyPressed,
            ]}
          >
            <Text style={styles.keyLabel}>{k}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", alignItems: "center" },
  dots: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  slot: {
    width: 56,
    height: 72,
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  slotFilled: { backgroundColor: colors.surfaceInverse },
  slotDigit: {
    fontFamily: fontMono,
    fontSize: 32,
    color: colors.onSurfaceInverse,
    fontWeight: "700",
  },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: spacing.lg,
  },
  key: {
    width: "33.333%",
    height: 72,
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -BORDER,
    marginLeft: -BORDER,
  },
  keyPressed: { backgroundColor: colors.surfaceInverse },
  keyEmpty: { backgroundColor: "transparent", borderColor: "transparent" },
  keyLabel: {
    fontFamily: fontDisplay,
    fontSize: 28,
    fontWeight: "800",
    color: colors.onSurface,
  },
});

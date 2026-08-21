import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { BORDER, colors, fontDisplay, fontMono, spacing } from "@/src/theme";

type Props = {
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
  testIDPrefix?: string;
  isError?: boolean;
};

const KEY_DETAILS: { key: string; sub: string }[] = [
  { key: "1", sub: "" },
  { key: "2", sub: "ABC" },
  { key: "3", sub: "DEF" },
  { key: "4", sub: "GHI" },
  { key: "5", sub: "JKL" },
  { key: "6", sub: "MNO" },
  { key: "7", sub: "PQRS" },
  { key: "8", sub: "TUV" },
  { key: "9", sub: "WXYZ" },
  { key: "", sub: "" },
  { key: "0", sub: "+" },
  { key: "⌫", sub: "" },
];

export function PinKeypad({
  value,
  onChange,
  maxLength = 4,
  testIDPrefix = "pin",
  isError = false,
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
      {/* 4-Digit Passcode Slot Indicator */}
      <View style={styles.dotsRow}>
        {Array.from({ length: maxLength }).map((_, i) => {
          const filled = i < value.length;
          const active = i === value.length;

          return (
            <View
              key={i}
              testID={`${testIDPrefix}-slot-${i}`}
              style={[
                styles.slot,
                filled && styles.slotFilled,
                active && styles.slotActive,
                isError && styles.slotError,
              ]}
            >
              {filled ? (
                <Text style={styles.slotDot}>●</Text>
              ) : (
                <View style={styles.slotEmptyInner} />
              )}
            </View>
          );
        })}
      </View>

      {/* 3x4 Tactile Keypad */}
      <View style={styles.padGrid}>
        {KEY_DETAILS.map((item, i) => {
          const { key, sub } = item;
          if (!key) {
            return <View key={`blank-${i}`} style={styles.keyEmpty} />;
          }

          const isDelete = key === "⌫";

          return (
            <Pressable
              key={`${key}-${i}`}
              testID={`${testIDPrefix}-key-${key}`}
              onPress={() => press(key)}
              style={({ pressed }) => [
                styles.key,
                pressed && styles.keyPressed,
                isDelete && styles.keyDelete,
              ]}
            >
              {({ pressed }) =>
                isDelete ? (
                  <Feather
                    name="delete"
                    size={22}
                    color={pressed ? colors.onBrand : colors.onSurface}
                  />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.keyNumber,
                        pressed && styles.keyPressedText,
                      ]}
                    >
                      {key}
                    </Text>
                    {sub ? (
                      <Text
                        style={[
                          styles.keySub,
                          pressed && styles.keyPressedSubText,
                        ]}
                      >
                        {sub}
                      </Text>
                    ) : null}
                  </>
                )
              }
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.xxl,
    justifyContent: "center",
    alignItems: "center",
  },
  slot: {
    width: 60,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  slotActive: {
    borderColor: colors.brand,
    backgroundColor: "#FFFFFF",
    transform: [{ scale: 1.05 }],
  },
  slotFilled: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  slotError: {
    borderColor: colors.error,
    backgroundColor: "#FFF0F2",
  },
  slotDot: {
    fontSize: 22,
    color: "#FFFFFF",
  },
  slotEmptyInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D0D0D0",
  },
  padGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
  key: {
    width: "30%",
    height: 72,
    borderRadius: 20,
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  keyPressed: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
    transform: [{ scale: 0.95 }],
  },
  keyPressedText: {
    color: colors.onBrand,
  },
  keyPressedSubText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  keyEmpty: {
    width: "30%",
    height: 72,
    backgroundColor: "transparent",
  },
  keyDelete: {
    backgroundColor: colors.surfaceTertiary,
  },
  keyNumber: {
    fontFamily: fontDisplay,
    fontSize: 26,
    fontWeight: "800",
    color: colors.onSurface,
  },
  keySub: {
    fontFamily: fontMono,
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    marginTop: 2,
    letterSpacing: 1,
  },
});

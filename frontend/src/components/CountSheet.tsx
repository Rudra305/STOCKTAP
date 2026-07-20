import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Product, updateCount } from "@/src/store/products";
import { BORDER, colors, fontDisplay, fontMono, spacing, type } from "@/src/theme";

export type CountSheetHandle = {
  open: (p: Product) => void;
  close: () => void;
};

type Props = {
  onSaved: (p: Product) => void;
};

export const CountSheet = forwardRef<CountSheetHandle, Props>(
  function CountSheet({ onSaved }, ref) {
    const sheetRef = useRef<BottomSheet>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [text, setText] = useState("0");
    const snapPoints = useMemo(() => ["75%"], []);

    useImperativeHandle(ref, () => ({
      open: (p: Product) => {
        setProduct(p);
        setText(String(p.count));
        sheetRef.current?.expand();
      },
      close: () => {
        Keyboard.dismiss();
        sheetRef.current?.close();
      },
    }));

    const commit = useCallback(
      async (nextValue: number) => {
        if (!product) return;
        const clamped = Math.max(0, Math.floor(nextValue));
        setText(String(clamped));
        const saved = await updateCount(product.id, clamped);
        if (saved) {
          setProduct(saved);
          onSaved(saved);
        }
      },
      [onSaved, product],
    );

    const bump = useCallback(
      (delta: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const current = parseInt(text, 10) || 0;
        commit(current + delta);
      },
      [commit, text],
    );

    const onManualBlur = useCallback(() => {
      const parsed = parseInt(text, 10);
      commit(Number.isFinite(parsed) ? parsed : 0);
    }, [commit, text]);

    const reset = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      commit(0);
    }, [commit]);

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
          pressBehavior="close"
        />
      ),
      [],
    );

    useEffect(() => {
      if (product) setText(String(product.count));
    }, [product]);

    const low = product
      ? product.count <= product.lowStockThreshold
      : false;

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBg}
      >
        <BottomSheetView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            {product && (
              <>
                <View style={styles.topRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sku}>{product.sku}</Text>
                    <Text style={styles.name} numberOfLines={2}>
                      {product.name}
                    </Text>
                  </View>
                  <Pressable
                    testID="count-sheet-reset"
                    onPress={reset}
                    style={styles.resetBtn}
                  >
                    <Text style={styles.resetLabel}>RESET</Text>
                  </Pressable>
                </View>

                <View
                  style={[
                    styles.numberBox,
                    low && { backgroundColor: colors.brand },
                  ]}
                  testID="count-sheet-number-box"
                >
                  <Text
                    style={[
                      styles.numberText,
                      low && { color: colors.onBrand },
                    ]}
                  >
                    {text || "0"}
                  </Text>
                  <Text
                    style={[
                      styles.numberLabel,
                      low && { color: colors.onBrand },
                    ]}
                  >
                    IN STOCK
                  </Text>
                </View>

                <View style={styles.manualRow}>
                  <Text style={styles.manualLabel}>MANUAL ENTRY</Text>
                  <TextInput
                    testID="count-sheet-manual-input"
                    value={text}
                    onChangeText={(v) => setText(v.replace(/[^0-9]/g, ""))}
                    onBlur={onManualBlur}
                    onSubmitEditing={onManualBlur}
                    keyboardType="number-pad"
                    style={styles.manualInput}
                    selectTextOnFocus
                    returnKeyType="done"
                  />
                </View>

                <View style={styles.buttonsRow}>
                  <Pressable
                    testID="count-sheet-decrement"
                    onPress={() => bump(-1)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.decBtn,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <Text style={styles.actionText}>−</Text>
                  </Pressable>
                  <Pressable
                    testID="count-sheet-increment"
                    onPress={() => bump(1)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.incBtn,
                      pressed && styles.actionPressed,
                    ]}
                  >
                    <Text style={[styles.actionText, styles.incText]}>+</Text>
                  </Pressable>
                </View>
              </>
            )}
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.surfaceSecondary,
    borderTopWidth: BORDER,
    borderColor: colors.border,
    borderRadius: 0,
  },
  handle: { backgroundColor: colors.border, width: 48 },
  container: { flex: 1, padding: spacing.lg },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  sku: {
    fontFamily: fontMono,
    fontSize: type.sm,
    letterSpacing: 1,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  name: {
    fontFamily: fontDisplay,
    fontSize: type.xl,
    fontWeight: "800",
    color: colors.onSurface,
  },
  resetBtn: {
    borderWidth: BORDER,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: spacing.md,
  },
  resetLabel: {
    fontFamily: fontMono,
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: type.sm,
    color: colors.onSurface,
  },
  numberBox: {
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
    paddingVertical: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  numberText: {
    fontFamily: fontMono,
    fontSize: type.xxxl + 16,
    fontWeight: "900",
    color: colors.onSurface,
    lineHeight: type.xxxl + 20,
  },
  numberLabel: {
    fontFamily: fontMono,
    fontSize: type.sm,
    letterSpacing: 2,
    color: colors.onSurface,
    marginTop: spacing.xs,
  },
  manualRow: { marginBottom: spacing.lg },
  manualLabel: {
    fontFamily: fontMono,
    fontSize: type.sm,
    letterSpacing: 2,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  manualInput: {
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    fontFamily: fontMono,
    fontSize: type.xl,
    fontWeight: "700",
    color: colors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 0,
    marginTop: "auto",
    marginBottom: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 96,
    borderWidth: BORDER,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  decBtn: {
    backgroundColor: colors.surfaceSecondary,
    marginRight: -BORDER,
  },
  incBtn: { backgroundColor: colors.surfaceInverse },
  actionPressed: { opacity: 0.85 },
  actionText: {
    fontFamily: fontDisplay,
    fontSize: 56,
    fontWeight: "900",
    color: colors.onSurface,
  },
  incText: { color: colors.onSurfaceInverse },
});

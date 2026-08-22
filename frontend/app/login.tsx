import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { PinKeypad } from "@/src/components/PinKeypad";
import { verifyPin } from "@/src/store/auth";
import { BORDER, colors, fontDisplay, fontMono, spacing, type } from "@/src/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [pin, setPinValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pin.length === 4) {
      (async () => {
        const ok = await verifyPin(pin);
        if (ok) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/inventory");
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError("INCORRECT PASSCODE. PLEASE TRY AGAIN.");
          setPinValue("");
        }
      })();
    }
  }, [pin, router]);

  const handleDemoFill = (demoPin: string) => {
    Haptics.selectionAsync();
    setError(null);
    setPinValue(demoPin);
  };

  return (
    <SafeAreaView style={styles.safe} testID="login-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Feather name="shield" size={28} color={colors.brand} />
            </View>
            <Text style={styles.logo}>STOCKTAP</Text>
            <Text style={styles.subtitle}>OWNER PASSCODE LOCK</Text>
            {error ? (
              <View style={styles.errorBanner} testID="login-error">
                <Feather name="alert-circle" size={16} color={colors.onError} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <View style={styles.instructionBanner}>
                <Text style={styles.instructionText}>Enter a 4-digit passcode for owner access</Text>
              </View>
            )}
          </View>

          <View style={styles.body}>
            <PinKeypad
              value={pin}
              onChange={(next) => {
                setError(null);
                setPinValue(next);
              }}
              isError={!!error}
              testIDPrefix="login"
            />

            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>QUICK TESTING DEMO PINS:</Text>
              <View style={styles.demoButtonsRow}>
                <Pressable style={styles.demoBtn} onPress={() => handleDemoFill("1234")}>
                  <Text style={styles.demoBtnText}>PIN: 1234</Text>
                </Pressable>
                <Pressable style={styles.demoBtn} onPress={() => handleDemoFill("0000")}>
                  <Text style={styles.demoBtnText}>PIN: 0000</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "web" ? spacing.md : spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: BORDER,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  logo: {
    fontFamily: fontDisplay,
    fontSize: type.xxl,
    fontWeight: "900",
    letterSpacing: -1,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fontMono,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 2,
    color: colors.muted,
  },
  instructionBanner: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontFamily: fontMono,
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: BORDER,
    borderColor: colors.error,
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontFamily: fontMono,
    color: colors.onError,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  body: { width: "100%", maxWidth: 360, alignItems: "center", marginTop: spacing.xs },
  demoBox: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  demoTitle: {
    fontFamily: fontMono,
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  demoButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  demoBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  demoBtnText: {
    fontFamily: fontMono,
    fontSize: 11,
    fontWeight: "800",
    color: colors.brand,
  },
});

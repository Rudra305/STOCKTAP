import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
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
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Feather name="shield" size={32} color={colors.brand} />
          </View>
          <Text style={styles.logo}>STOCKTAP</Text>
          <Text style={styles.subtitle}>OWNER PASSCODE LOCK</Text>
        </View>

        {error ? (
          <View style={styles.errorBanner} testID="login-error">
            <Feather name="alert-circle" size={18} color={colors.onError} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.instructionBanner}>
            <Text style={styles.instructionText}>Enter 4-Digit Security Passcode</Text>
          </View>
        )}

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, paddingHorizontal: spacing.lg },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: BORDER,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logo: {
    fontFamily: fontDisplay,
    fontSize: type.xxxl,
    fontWeight: "900",
    letterSpacing: -2,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fontMono,
    fontSize: type.sm,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: spacing.xs,
    color: colors.muted,
  },
  instructionBanner: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  instructionText: {
    fontFamily: fontMono,
    fontSize: type.sm,
    color: colors.muted,
    fontWeight: "600",
    letterSpacing: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: BORDER,
    borderColor: colors.error,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginVertical: spacing.sm,
  },
  errorText: {
    fontFamily: fontMono,
    color: colors.onError,
    fontWeight: "700",
    fontSize: type.sm,
    letterSpacing: 0.5,
  },
  body: { flex: 1, justifyContent: "center", alignItems: "center" },
  demoBox: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  demoTitle: {
    fontFamily: fontMono,
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  demoButtonsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  demoBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  demoBtnText: {
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "800",
    color: colors.brand,
  },
});

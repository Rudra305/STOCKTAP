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
import { setPin } from "@/src/store/auth";
import { BORDER, colors, fontDisplay, fontMono, spacing, type } from "@/src/theme";

export default function SetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (step === "create" && first.length === 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("confirm");
      setError(null);
    }
  }, [first, step]);

  useEffect(() => {
    if (step === "confirm" && second.length === 4) {
      (async () => {
        if (second !== first) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError("PINS DO NOT MATCH. PLEASE TRY AGAIN.");
          setSecond("");
          setFirst("");
          setStep("create");
          return;
        }
        setSaving(true);
        const ok = await setPin(second);
        setSaving(false);
        if (ok) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/inventory");
        } else {
          setError("COULD NOT SAVE PIN.");
        }
      })();
    }
  }, [second, first, step, router]);

  const value = step === "create" ? first : second;
  const onChange = step === "create" ? setFirst : setSecond;

  return (
    <SafeAreaView style={styles.safe} testID="setup-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Feather
              name={step === "create" ? "key" : "check-circle"}
              size={30}
              color={colors.brand}
            />
          </View>
          <Text style={styles.logo}>STOCKTAP</Text>
          <Text style={styles.subtitle}>
            {step === "create" ? "CREATE OWNER PASSCODE" : "CONFIRM PASSCODE"}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBanner} testID="setup-error">
            <Feather name="alert-triangle" size={18} color={colors.onError} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.instructionBanner}>
            <Text style={styles.instructionText}>
              {step === "create"
                ? "Enter a 4-digit passcode for owner access"
                : "Re-enter your passcode to verify"}
            </Text>
          </View>
        )}

        <View style={styles.body}>
          <PinKeypad
            value={value}
            onChange={onChange}
            isError={!!error}
            testIDPrefix={step === "create" ? "setup-create" : "setup-confirm"}
          />
        </View>

        {step === "confirm" && !saving && (
          <Pressable
            testID="setup-restart-button"
            style={styles.restart}
            onPress={() => {
              setFirst("");
              setSecond("");
              setStep("create");
              setError(null);
            }}
          >
            <Feather name="refresh-cw" size={14} color={colors.brand} style={{ marginRight: 6 }} />
            <Text style={styles.restartText}>START OVER</Text>
          </Pressable>
        )}
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
  restart: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  restartText: {
    fontFamily: fontMono,
    fontSize: type.sm,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.brand,
  },
});

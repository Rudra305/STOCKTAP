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
      setStep("confirm");
      setError(null);
    }
  }, [first, step]);

  useEffect(() => {
    if (step === "confirm" && second.length === 4) {
      (async () => {
        if (second !== first) {
          setError("PINS DO NOT MATCH. TRY AGAIN.");
          setSecond("");
          setFirst("");
          setStep("create");
          return;
        }
        setSaving(true);
        const ok = await setPin(second);
        setSaving(false);
        if (ok) {
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
          <Text style={styles.logo}>STOCKTAP</Text>
          <Text style={styles.subtitle}>
            {step === "create" ? "CREATE OWNER PIN" : "CONFIRM PIN"}
          </Text>
        </View>
        {error && (
          <View style={styles.errorBanner} testID="setup-error">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={styles.body}>
          <PinKeypad
            value={value}
            onChange={onChange}
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
    paddingBottom: spacing.lg,
    alignItems: "center",
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
    fontSize: type.base,
    letterSpacing: 2,
    marginTop: spacing.sm,
    color: colors.onSurface,
  },
  body: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorBanner: {
    borderWidth: BORDER,
    borderColor: colors.error,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontFamily: fontMono,
    color: colors.onError,
    fontWeight: "700",
    letterSpacing: 1,
  },
  restart: {
    alignSelf: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  restartText: {
    fontFamily: fontMono,
    letterSpacing: 2,
    color: colors.onSurface,
    textDecorationLine: "underline",
  },
});

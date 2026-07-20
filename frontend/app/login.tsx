import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

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
          setError("WRONG PIN. TRY AGAIN.");
          setPinValue("");
        }
      })();
    }
  }, [pin, router]);

  return (
    <SafeAreaView style={styles.safe} testID="login-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>STOCKTAP</Text>
          <Text style={styles.subtitle}>OWNER LOGIN</Text>
        </View>
        {error && (
          <View style={styles.errorBanner} testID="login-error">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={styles.body}>
          <PinKeypad
            value={pin}
            onChange={(next) => {
              setError(null);
              setPinValue(next);
            }}
            testIDPrefix="login"
          />
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
  body: { flex: 1, justifyContent: "center", alignItems: "center" },
});

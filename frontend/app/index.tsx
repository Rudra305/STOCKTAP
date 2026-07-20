import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { hasPin, isSessionActive } from "@/src/store/auth";
import { colors } from "@/src/theme";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const pinSet = await hasPin();
      const active = await isSessionActive();
      if (!mounted) return;
      if (!pinSet) {
        router.replace("/setup");
      } else if (active) {
        router.replace("/inventory");
      } else {
        router.replace("/login");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <View style={styles.container} testID="index-splash">
      <ActivityIndicator color={colors.onSurface} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});

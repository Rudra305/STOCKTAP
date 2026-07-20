import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import {
  Product,
  deleteProduct,
  listProducts,
  saveProduct,
} from "@/src/store/products";
import { BORDER, colors, fontDisplay, fontMono, spacing, type } from "@/src/theme";

export default function ProductFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = Boolean(id);

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [count, setCount] = useState("0");
  const [threshold, setThreshold] = useState("5");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      const items = await listProducts();
      const found = items.find((p) => p.id === id);
      if (found) {
        setName(found.name);
        setSku(found.sku);
        setCategory(found.category);
        setCount(String(found.count));
        setThreshold(String(found.lowStockThreshold));
        setImageUri(found.imageUri ?? null);
      }
      setLoading(false);
    })();
  }, [editing, id]);

  const pickImage = useCallback(async (source: "camera" | "gallery") => {
    Haptics.selectionAsync();
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setError("CAMERA PERMISSION DENIED.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });
      if (!res.canceled && res.assets[0]) {
        const a = res.assets[0];
        setImageUri(
          a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri,
        );
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError("GALLERY PERMISSION DENIED.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });
      if (!res.canceled && res.assets[0]) {
        const a = res.assets[0];
        setImageUri(
          a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri,
        );
      }
    }
  }, []);

  const validate = (): string | null => {
    if (!name.trim()) return "NAME IS REQUIRED.";
    if (!sku.trim()) return "SKU IS REQUIRED.";
    if (!category.trim()) return "CATEGORY IS REQUIRED.";
    const c = parseInt(count, 10);
    if (!Number.isFinite(c) || c < 0) return "COUNT MUST BE 0 OR MORE.";
    const t = parseInt(threshold, 10);
    if (!Number.isFinite(t) || t < 0) return "THRESHOLD MUST BE 0 OR MORE.";
    return null;
  };

  const onSubmit = useCallback(async () => {
    const v = validate();
    if (v) {
      setError(v);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError(null);
    setSaving(true);
    await saveProduct({
      id: editing ? (id as string) : undefined,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category.trim(),
      count: parseInt(count, 10),
      lowStockThreshold: parseInt(threshold, 10),
      imageUri,
    } as Partial<Product> as any);
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [category, count, editing, id, imageUri, name, router, sku, threshold]);

  const onDelete = useCallback(async () => {
    if (!editing || !id) return;
    setSaving(true);
    await deleteProduct(id as string);
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.back();
  }, [editing, id, router]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.onSurface} />
      </View>
    );
  }

  return (
    <View style={styles.safe} testID="product-form-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          testID="product-form-back"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backLabel}>← BACK</Text>
        </Pressable>
        <Text style={styles.title}>
          {editing ? "EDIT PRODUCT" : "NEW PRODUCT"}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>PHOTO</Text>
          <View style={styles.photoBox}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.photo}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.photoPlaceholder}>NO PHOTO</Text>
            )}
          </View>
          <View style={styles.photoActions}>
            <Pressable
              testID="product-form-photo-camera"
              onPress={() => pickImage("camera")}
              style={styles.photoBtn}
            >
              <Text style={styles.photoBtnLabel}>CAMERA</Text>
            </Pressable>
            <Pressable
              testID="product-form-photo-gallery"
              onPress={() => pickImage("gallery")}
              style={styles.photoBtn}
            >
              <Text style={styles.photoBtnLabel}>GALLERY</Text>
            </Pressable>
            {imageUri && (
              <Pressable
                testID="product-form-photo-clear"
                onPress={() => setImageUri(null)}
                style={[styles.photoBtn, styles.photoBtnDanger]}
              >
                <Text style={[styles.photoBtnLabel, styles.photoBtnLabelDanger]}>
                  CLEAR
                </Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.label}>NAME</Text>
          <TextInput
            testID="product-form-name-input"
            value={name}
            onChangeText={setName}
            placeholder="ETHIOPIA COFFEE 250G"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <Text style={styles.label}>SKU</Text>
          <TextInput
            testID="product-form-sku-input"
            value={sku}
            onChangeText={setSku}
            autoCapitalize="characters"
            placeholder="COF-ETH-250"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <Text style={styles.label}>CATEGORY</Text>
          <TextInput
            testID="product-form-category-input"
            value={category}
            onChangeText={setCategory}
            placeholder="BEVERAGES"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <View style={styles.rowSplit}>
            <View style={styles.half}>
              <Text style={styles.label}>STOCK COUNT</Text>
              <TextInput
                testID="product-form-count-input"
                value={count}
                onChangeText={(v) => setCount(v.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>LOW-STOCK AT</Text>
              <TextInput
                testID="product-form-threshold-input"
                value={threshold}
                onChangeText={(v) => setThreshold(v.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
          </View>

          {error && (
            <View style={styles.errorBanner} testID="product-form-error">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {editing && (
            <Pressable
              testID="product-form-delete-button"
              onPress={onDelete}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnLabel}>DELETE PRODUCT</Text>
            </Pressable>
          )}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, spacing.md) },
          ]}
        >
          <Pressable
            testID="product-form-save-button"
            onPress={onSubmit}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.saveLabel}>
              {saving ? "SAVING..." : editing ? "SAVE CHANGES" : "ADD PRODUCT"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: BORDER,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: { alignSelf: "flex-start", paddingVertical: spacing.xs },
  backLabel: {
    fontFamily: fontMono,
    fontSize: type.sm,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.onSurface,
  },
  title: {
    fontFamily: fontDisplay,
    fontSize: type.xxl,
    fontWeight: "900",
    letterSpacing: -1,
    color: colors.onSurface,
    marginTop: spacing.xs,
  },
  label: {
    fontFamily: fontMono,
    fontSize: type.sm,
    letterSpacing: 2,
    color: colors.onSurface,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    height: 52,
    paddingHorizontal: spacing.md,
    fontFamily: fontMono,
    fontSize: type.lg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  rowSplit: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  photoBox: {
    width: "100%",
    height: 180,
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: {
    fontFamily: fontMono,
    letterSpacing: 2,
    color: colors.muted,
  },
  photoActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  photoBtn: {
    flex: 1,
    borderWidth: BORDER,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
  },
  photoBtnDanger: { backgroundColor: colors.surfaceTertiary },
  photoBtnLabel: {
    fontFamily: fontMono,
    fontSize: type.sm,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.onSurface,
  },
  photoBtnLabelDanger: { color: colors.onSurface },
  errorBanner: {
    marginTop: spacing.lg,
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
  deleteBtn: {
    marginTop: spacing.xl,
    borderWidth: BORDER,
    borderColor: colors.error,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
  },
  deleteBtnLabel: {
    fontFamily: fontMono,
    fontSize: type.base,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.error,
  },
  footer: {
    borderTopWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
  },
  saveBtn: {
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceInverse,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  saveLabel: {
    fontFamily: fontMono,
    fontSize: type.lg,
    fontWeight: "900",
    letterSpacing: 2,
    color: colors.onSurfaceInverse,
  },
});

import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { CountSheet, CountSheetHandle } from "@/src/components/CountSheet";
import { endSession } from "@/src/store/auth";
import { Product, listProducts } from "@/src/store/products";
import { BORDER, colors, fontDisplay, fontMono, spacing, type } from "@/src/theme";

const ALL = "ALL";

export default function InventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<CountSheetHandle>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await listProducts();
    setProducts(list);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return [ALL, ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== ALL && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, query, category]);

  const handleTap = useCallback((p: Product) => {
    Haptics.selectionAsync();
    sheetRef.current?.open(p);
  }, []);

  const handleSaved = useCallback((p: Product) => {
    setProducts((prev) =>
      prev.map((it) => (it.id === p.id ? p : it)),
    );
  }, []);

  const handleLogout = useCallback(async () => {
    await endSession();
    router.replace("/login");
  }, [router]);

  return (
    <View style={styles.safe} testID="inventory-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>STOCKTAP</Text>
          <View style={styles.headerActions}>
            <Pressable
              testID="inventory-logout-button"
              onPress={handleLogout}
              style={styles.iconBtn}
            >
              <Text style={styles.iconBtnLabel}>LOCK</Text>
            </Pressable>
            <Pressable
              testID="inventory-add-button"
              onPress={() => router.push("/product-form")}
              style={[styles.iconBtn, styles.iconBtnPrimary]}
            >
              <Text style={[styles.iconBtnLabel, styles.iconBtnLabelPrimary]}>
                + ADD
              </Text>
            </Pressable>
          </View>
        </View>
        <TextInput
          testID="inventory-search-input"
          value={query}
          onChangeText={setQuery}
          placeholder="SEARCH NAME OR SKU"
          placeholderTextColor={colors.muted}
          style={styles.search}
          autoCapitalize="characters"
          returnKeyType="search"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={styles.chipRowContent}
        >
          {categories.map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c}
                testID={`inventory-chip-${c}`}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCategory(c);
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipLabel, active && styles.chipLabelActive]}
                >
                  {c.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.onSurface} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrap} testID="inventory-empty">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1584294232067-c97f5d99eff3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxyZXRhaWwlMjBpbnZlbnRvcnklMjBzaGVsZiUyMGVtcHR5fGVufDB8fHx8MTc4NDU1MzYxN3ww&ixlib=rb-4.1.0&q=85",
            }}
            style={styles.emptyImage}
            contentFit="cover"
          />
          <Text style={styles.emptyTitle}>NO STOCK</Text>
          <Text style={styles.emptySubtitle}>
            {query || category !== ALL
              ? "NO PRODUCTS MATCH THE FILTER."
              : "TAP + ADD TO CREATE YOUR FIRST PRODUCT."}
          </Text>
          <Pressable
            testID="inventory-empty-add-button"
            style={styles.emptyCta}
            onPress={() => router.push("/product-form")}
          >
            <Text style={styles.emptyCtaLabel}>+ ADD PRODUCT</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          renderItem={({ item }) => (
            <ProductRow product={item} onPress={() => handleTap(item)} onEdit={() => router.push({ pathname: "/product-form", params: { id: item.id } })} />
          )}
        />
      )}

      <CountSheet ref={sheetRef} onSaved={handleSaved} />
    </View>
  );
}

function ProductRow({
  product,
  onPress,
  onEdit,
}: {
  product: Product;
  onPress: () => void;
  onEdit: () => void;
}) {
  const low = product.count <= product.lowStockThreshold;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onEdit}
      testID={`product-row-${product.id}`}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.thumb}>
        {product.imageUri ? (
          <Image
            source={{ uri: product.imageUri }}
            style={styles.thumbImage}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.thumbFallback}>
            {product.name.slice(0, 1).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowSku}>{product.sku}</Text>
        <Text style={styles.rowName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.rowCategory}>{product.category.toUpperCase()}</Text>
      </View>
      <View
        style={[styles.rowCount, low && { backgroundColor: colors.brand }]}
        testID={`product-count-${product.id}`}
      >
        <Text
          style={[styles.rowCountText, low && { color: colors.onBrand }]}
        >
          {product.count}
        </Text>
        {low && (
          <Text style={styles.rowCountLow} testID={`product-low-${product.id}`}>
            LOW
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: BORDER,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fontDisplay,
    fontSize: type.xxl,
    fontWeight: "900",
    letterSpacing: -1,
    color: colors.onSurface,
  },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  iconBtn: {
    borderWidth: BORDER,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  iconBtnPrimary: { backgroundColor: colors.surfaceInverse },
  iconBtnLabel: {
    fontFamily: fontMono,
    letterSpacing: 1,
    fontSize: type.sm,
    fontWeight: "700",
    color: colors.onSurface,
  },
  iconBtnLabelPrimary: { color: colors.onSurfaceInverse },
  search: {
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    height: 48,
    paddingHorizontal: spacing.md,
    fontFamily: fontMono,
    fontSize: type.base,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  chipRow: { height: 56 },
  chipRowContent: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
    alignItems: "center",
  },
  chip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.surfaceInverse },
  chipLabel: {
    fontFamily: fontMono,
    fontSize: type.sm,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.onSurface,
  },
  chipLabelActive: { color: colors.onSurfaceInverse },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    minHeight: 96,
  },
  thumb: {
    width: 96,
    borderRightWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImage: { width: "100%", height: "100%" },
  thumbFallback: {
    fontFamily: fontDisplay,
    fontSize: 40,
    fontWeight: "900",
    color: colors.onSurface,
  },
  rowInfo: { flex: 1, padding: spacing.md, justifyContent: "center" },
  rowSku: {
    fontFamily: fontMono,
    fontSize: type.sm,
    letterSpacing: 1,
    color: colors.muted,
  },
  rowName: {
    fontFamily: fontDisplay,
    fontSize: type.lg,
    fontWeight: "800",
    color: colors.onSurface,
    marginTop: 2,
  },
  rowCategory: {
    fontFamily: fontMono,
    fontSize: type.sm,
    letterSpacing: 1,
    color: colors.onSurface,
    marginTop: 4,
  },
  rowCount: {
    width: 100,
    borderLeftWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCountText: {
    fontFamily: fontMono,
    fontSize: 34,
    fontWeight: "900",
    color: colors.onSurface,
  },
  rowCountLow: {
    fontFamily: fontMono,
    fontSize: type.sm,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.onBrand,
    marginTop: 2,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyImage: {
    width: 240,
    height: 180,
    borderWidth: BORDER,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fontDisplay,
    fontSize: type.xxxl,
    fontWeight: "900",
    letterSpacing: -2,
    color: colors.onSurface,
  },
  emptySubtitle: {
    fontFamily: fontMono,
    fontSize: type.base,
    color: colors.onSurface,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  emptyCta: {
    borderWidth: BORDER,
    borderColor: colors.border,
    backgroundColor: colors.surfaceInverse,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emptyCtaLabel: {
    fontFamily: fontMono,
    fontSize: type.lg,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.onSurfaceInverse,
  },
});

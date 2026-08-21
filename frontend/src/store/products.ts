import { useCallback, useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";
import { apiClient } from "@/src/api/client";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  count: number;
  lowStockThreshold: number;
  imageUri?: string | null;
  updatedAt: number;
};

const PRODUCTS_KEY = "stocktap.products";
const SEEDED_KEY = "stocktap.seeded.v2";

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const SEED: Product[] = [
  {
    id: uid(),
    name: "Ethiopia Coffee 250g",
    sku: "COF-ETH-250",
    category: "Beverages",
    count: 24,
    lowStockThreshold: 10,
    imageUri: null,
    updatedAt: Date.now(),
  },
  {
    id: uid(),
    name: "Blank T-Shirt White",
    sku: "APP-TSH-WHT",
    category: "Apparel",
    count: 6,
    lowStockThreshold: 8,
    imageUri: null,
    updatedAt: Date.now(),
  },
  {
    id: uid(),
    name: "Recycled Notebook A5",
    sku: "STA-NB-A5",
    category: "Stationery",
    count: 48,
    lowStockThreshold: 15,
    imageUri: null,
    updatedAt: Date.now(),
  },
  {
    id: uid(),
    name: "Kraft Paper Bag",
    sku: "PKG-KFT-01",
    category: "Packaging",
    count: 2,
    lowStockThreshold: 20,
    imageUri: null,
    updatedAt: Date.now(),
  },
];

async function readAll(): Promise<Product[]> {
  const raw = await storage.getItem<string>(PRODUCTS_KEY, "");
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(products: Product[]): Promise<void> {
  await storage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

async function ensureSeeded(): Promise<void> {
  const seeded = await storage.getItem<boolean>(SEEDED_KEY, false);
  if (!seeded) {
    await writeAll(SEED);
    await storage.setItem(SEEDED_KEY, true);
  }
}

export async function listProducts(): Promise<Product[]> {
  await ensureSeeded();
  // Try remote sync in background / first
  const remote = await apiClient.fetchProducts();
  if (remote && remote.length > 0) {
    await writeAll(remote);
    return remote;
  }
  return readAll();
}

export async function saveProduct(input: {
  id?: string;
  name: string;
  sku: string;
  category: string;
  count: number;
  lowStockThreshold: number;
  imageUri?: string | null;
}): Promise<Product> {
  const items = await readAll();
  if (input.id) {
    const idx = items.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      const updated: Product = {
        ...items[idx],
        ...input,
        id: items[idx].id,
        updatedAt: Date.now(),
      };
      items[idx] = updated;
      await writeAll(items);
      return updated;
    }
  }
  const created: Product = {
    id: uid(),
    name: input.name,
    sku: input.sku,
    category: input.category,
    count: input.count,
    lowStockThreshold: input.lowStockThreshold,
    imageUri: input.imageUri ?? null,
    updatedAt: Date.now(),
  };
  items.unshift(created);
  await writeAll(items);
  // sync remote asynchronously
  apiClient.createProduct(created).catch(() => {});
  return created;
}

export async function updateCount(id: string, next: number, reason?: string): Promise<Product | null> {
  const items = await readAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const newCount = Math.max(0, Math.floor(next));
  const updated: Product = {
    ...items[idx],
    count: newCount,
    updatedAt: Date.now(),
  };
  items[idx] = updated;
  await writeAll(items);
  // sync remote
  apiClient.updateProductCount(id, newCount, reason).catch(() => {});
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const items = await readAll();
  const next = items.filter((p) => p.id !== id);
  await writeAll(next);
  apiClient.deleteProduct(id).catch(() => {});
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await listProducts();
    setProducts(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, loading, refresh, setProducts };
}

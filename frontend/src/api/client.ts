import { Product } from "@/src/store/products";

const getBaseUrl = () => {
  // 1. Explicit custom API URL (e.g., Vercel deployment URL)
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes("localhost")) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // 2. Web browser on production domain (Vercel) -> use relative /api
  if (typeof window !== "undefined" && window.location?.hostname && window.location.hostname !== "localhost") {
    return "/api";
  }

  // 3. Fallback to EXPO_PUBLIC_API_URL if provided
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 4. Local dev server
  return "http://localhost:8000/api";
};

const BASE_URL = getBaseUrl();


export interface AuditLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  previousCount: number;
  newCount: number;
  delta: number;
  reason: string;
  userId: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoriesCount: number;
  categories: string[];
}

export const apiClient = {
  async fetchProducts(): Promise<Product[] | null> {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async createProduct(product: Omit<Product, "id" | "updatedAt">): Promise<Product | null> {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateProductCount(id: string, count: number, reason = "Quick Stock Tap"): Promise<Product | null> {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}/count`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, reason }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
    try {
      const res = await fetch(`${BASE_URL}/analytics/summary`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    try {
      const res = await fetch(`${BASE_URL}/logs?limit=${limit}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }
};

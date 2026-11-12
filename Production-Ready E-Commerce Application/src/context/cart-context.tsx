"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CartItem, Product } from "@/types";

export const DEMO_USER_ID = "test-user-123";

export interface PopulatedCartItem extends CartItem {
  product: Product | null;
  lineTotal: number;
}

interface CartApiResponse {
  userId: string;
  items: PopulatedCartItem[];
  itemCount: number;
  subtotal: number;
}

interface CartContextValue {
  items: PopulatedCartItem[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PopulatedCartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/cart?userId=${encodeURIComponent(DEMO_USER_ID)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch cart.");
      }
      const data: CartApiResponse = await res.json();
      setItems(data.items ?? []);
      setSubtotal(data.subtotal ?? 0);
      setItemCount(data.itemCount ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load cart.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`/api/cart?userId=${encodeURIComponent(DEMO_USER_ID)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to fetch cart.");
        }
        return res.json() as Promise<CartApiResponse>;
      })
      .then((data) => {
        if (!active) return;
        setItems(data.items ?? []);
        setSubtotal(data.subtotal ?? 0);
        setItemCount(data.itemCount ?? 0);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load cart.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      setError(null);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          productId,
          quantity,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body.error ?? "Could not add item to cart.";
        setError(message);
        throw new Error(message);
      }

      await fetchCart();
    },
    [fetchCart]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      setError(null);
      if (quantity < 1) {
        await fetch(
          `/api/cart?userId=${encodeURIComponent(
            DEMO_USER_ID
          )}&productId=${encodeURIComponent(productId)}`,
          { method: "DELETE" }
        );
        await fetchCart();
        return;
      }

      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          productId,
          quantity,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body.error ?? "Could not update item quantity.";
        setError(message);
        throw new Error(message);
      }

      await fetchCart();
    },
    [fetchCart]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      setError(null);
      const res = await fetch(
        `/api/cart?userId=${encodeURIComponent(
          DEMO_USER_ID
        )}&productId=${encodeURIComponent(productId)}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body.error ?? "Could not remove item from cart.";
        setError(message);
        throw new Error(message);
      }

      await fetchCart();
    },
    [fetchCart]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        isLoading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>.");
  }
  return ctx;
}


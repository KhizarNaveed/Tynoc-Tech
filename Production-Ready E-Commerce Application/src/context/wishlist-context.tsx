"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Product, WishlistItem } from "@/types";
import { DEMO_USER_ID } from "./cart-context";

export interface PopulatedWishlistItem extends WishlistItem {
  product: Product | null;
}

interface WishlistApiResponse {
  userId: string;
  items: PopulatedWishlistItem[];
  itemCount: number;
}

interface WishlistContextValue {
  items: PopulatedWishlistItem[];
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PopulatedWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/wishlist?userId=${encodeURIComponent(DEMO_USER_ID)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch wishlist.");
      }
      const data: WishlistApiResponse = await res.json();
      setItems(data.items ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load wishlist.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`/api/wishlist?userId=${encodeURIComponent(DEMO_USER_ID)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to fetch wishlist.");
        }
        return res.json() as Promise<WishlistApiResponse>;
      })
      .then((data) => {
        if (!active) return;
        setItems(data.items ?? []);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Unable to load wishlist."
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items]
  );

  /**
   * Toggles a product in the wishlist.
   * Returns `true` if the product is now in the wishlist, `false` if removed.
   */
  const toggleWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      setError(null);
      const exists = items.some((item) => item.productId === productId);

      if (exists) {
        const res = await fetch(
          `/api/wishlist?userId=${encodeURIComponent(
            DEMO_USER_ID
          )}&productId=${encodeURIComponent(productId)}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const message = body.error ?? "Failed to remove item from wishlist.";
          setError(message);
          throw new Error(message);
        }
        await fetchWishlist();
        return false;
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            productId,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const message = body.error ?? "Failed to add item to wishlist.";
          setError(message);
          throw new Error(message);
        }
        await fetchWishlist();
        return true;
      }
    },
    [items, fetchWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        isLoading,
        error,
        fetchWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a <WishlistProvider>.");
  }
  return ctx;
}


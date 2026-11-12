"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Heart, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import type { Product } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  "cat-electronics": "Electronics",
  "cat-fashion": "Fashion",
  "cat-home": "Home & Living",
};

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  /** Set true for above-the-fold cards to preload their image */
  priority?: boolean;
}

export function ProductCard({
  product,
  categoryName,
  priority = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [togglingWish, setTogglingWish] = useState(false);

  const label =
    categoryName ?? CATEGORY_LABELS[product.categoryId] ?? "Collection";
  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 25;
  const wishlisted = isInWishlist(product.id);

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || adding) return;

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
    } catch {
      // Error is tracked in CartContext
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (togglingWish) return;

    try {
      setTogglingWish(true);
      await toggleWishlist(product.id);
    } catch {
      // Error is tracked in WishlistContext
    } finally {
      setTogglingWish(false);
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Square image */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <Link
          href={`/products/${product.id}`}
          className="absolute inset-0 block"
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {(!inStock || lowStock) && (
          <div className="pointer-events-none absolute left-3 top-3">
            {!inStock ? (
              <Badge variant="destructive">Sold out</Badge>
            ) : (
              <Badge variant="warning" className="bg-white/90">
                Only {product.stock} left
              </Badge>
            )}
          </div>
        )}

        {/* Wishlist toggle button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={togglingWish}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-xs backdrop-blur-xs transition-all hover:scale-105 hover:bg-white cursor-pointer disabled:opacity-50"
        >
          <Heart
            className={`size-4 transition-colors ${
              wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-700"
            }`}
          />
        </button>

        {/* Quick Add: appears on hover / keyboard focus (always visible below md for touch) */}
        <div className="absolute inset-x-3 bottom-3 opacity-100 transition-all duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <Button
            type="button"
            disabled={!inStock || adding}
            className="w-full bg-white/95 text-slate-900 shadow-md backdrop-blur-sm hover:bg-white"
            onClick={handleQuickAdd}
          >
            {adding ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : justAdded ? (
              <>
                <Check className="size-4 text-emerald-600" />
                <span className="text-emerald-700">Added to Cart!</span>
              </>
            ) : (
              <>
                <Plus className="size-4" />
                <span>Quick Add</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-slate-900">
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-slate-500">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

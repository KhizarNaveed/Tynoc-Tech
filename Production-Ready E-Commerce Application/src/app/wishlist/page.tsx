"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/context/wishlist-context";

export default function WishlistPage() {
  const { items, itemCount, isLoading, error } = useWishlist();

  const wishlistedProducts = items
    .map((item) => item.product)
    .filter((product): product is NonNullable<typeof product> =>
      Boolean(product)
    );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="h-9 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card
              key={idx}
              className="overflow-hidden rounded-2xl border-slate-100"
            >
              <div className="aspect-square w-full animate-pulse bg-slate-100" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistedProducts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border-slate-100 bg-white p-12 text-center shadow-sm space-y-5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <Heart className="size-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Your wishlist is empty
            </h1>
            <p className="mx-auto max-w-md text-sm text-slate-500">
              Save your favorite items while you browse so you can easily find
              them later or add them to your bag anytime.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/products">
                <span>Explore Collection</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Catalog</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Saved Wishlist
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Click the heart icon on any card to remove it, or use Quick Add to
            move it to your cart.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit px-3 py-1 text-xs">
          {itemCount} {itemCount === 1 ? "saved item" : "saved items"}
        </Badge>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {wishlistedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}


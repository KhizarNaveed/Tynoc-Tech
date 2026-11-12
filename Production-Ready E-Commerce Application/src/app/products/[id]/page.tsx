"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Heart,
  Loader2,
  Minus,
  PackageCheck,
  PackageX,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import type { Product } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  "cat-electronics": "Electronics",
  "cat-fashion": "Fashion",
  "cat-home": "Home & Living",
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFoundError, setNotFoundError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [togglingWishlist, setTogglingWishlist] = useState<boolean>(false);

  const wishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      try {
        setLoading(true);
        setNotFoundError(false);
        setError(null);

        const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
        if (res.status === 404) {
          if (active) {
            setNotFoundError(true);
            setProduct(null);
          }
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to load product details.");
        }

        const data: Product = await res.json();
        if (active) {
          setProduct(data);
        }

        // Load related products in the same category
        const relRes = await fetch(
          `/api/products?categoryId=${encodeURIComponent(data.categoryId)}`
        );
        if (relRes.ok && active) {
          const relList: Product[] = await relRes.json();
          setRelatedProducts(relList.filter((item) => item.id !== data.id).slice(0, 3));
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load product."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  async function handleAddToCart() {
    if (!product || addingToCart) return;
    try {
      setAddingToCart(true);
      setActionNotice(null);
      setActionError(null);
      await addToCart(product.id, quantity);
      setActionNotice(
        `Added ${quantity} × "${product.name}" to your cart!`
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to add item to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleToggleWishlist() {
    if (!product || togglingWishlist) return;
    try {
      setTogglingWishlist(true);
      setActionNotice(null);
      setActionError(null);
      const added = await toggleWishlist(product.id);
      setActionNotice(
        added
          ? `Added "${product.name}" to your wishlist!`
          : `Removed "${product.name}" from your wishlist.`
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update wishlist."
      );
    } finally {
      setTogglingWishlist(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-5 w-36 animate-pulse rounded bg-slate-200 mb-8" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6 aspect-square w-full animate-pulse rounded-2xl bg-slate-200" />
          <div className="lg:col-span-6 space-y-5 py-4">
            <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200 pt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (notFoundError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="border-slate-200 bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <PackageX className="size-8" />
          </div>
          <Badge variant="destructive" className="mx-auto">
            404 • Product Not Found
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            We couldn&apos;t find that product
          </h1>
          <p className="mx-auto max-w-md text-sm text-slate-500">
            {error ??
              `The product with ID "${id}" doesn't exist or may have been removed from our catalog.`}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/products">
                <ArrowLeft className="size-4" />
                <span>Back to Products</span>
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const categoryLabel =
    CATEGORY_LABELS[product.categoryId] ?? product.categoryId;
  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Catalog</span>
        </Link>
        <span>/</span>
        <Link
          href={`/products?categoryId=${encodeURIComponent(product.categoryId)}`}
          className="hover:text-slate-900 transition-colors"
        >
          {categoryLabel}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        {/* Left: Large Product Image */}
        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm aspect-square">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute top-4 left-4">
              <Badge
                variant="secondary"
                className="bg-white/95 text-slate-900 shadow-xs px-3 py-1 text-xs"
              >
                {categoryLabel}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3 border-b border-slate-200 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {inStock ? (
                <Badge variant="success" className="gap-1.5 px-3 py-1">
                  <PackageCheck className="size-3.5" />
                  <span>In Stock ({product.stock} available)</span>
                </Badge>
              ) : (
                <Badge variant="destructive" className="px-3 py-1">
                  Out of Stock
                </Badge>
              )}
              <span className="text-xs text-slate-400 font-mono">
                SKU: {product.id.toUpperCase()}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">
                Includes all applicable taxes
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Product Overview
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!inStock || quantity <= 1}
                  className="p-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={!inStock || quantity >= product.stock}
                  className="p-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <span className="text-xs text-slate-500">
                Subtotal:{" "}
                <strong className="text-slate-900">
                  ${(product.price * quantity).toFixed(2)}
                </strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              size="lg"
              className="flex-1"
              disabled={!inStock || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>Adding to Cart...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="size-5" />
                  <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="lg"
              variant={wishlisted ? "secondary" : "outline"}
              className="sm:w-auto"
              disabled={togglingWishlist}
              onClick={handleToggleWishlist}
            >
              {togglingWishlist ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Heart
                  className={`size-5 ${
                    wishlisted ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
              )}
              <span>{wishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
            </Button>
          </div>

          {/* Interactive Feedback Banners */}
          {actionNotice && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800">
              <div className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-emerald-600" />
                <span>{actionNotice}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/cart"
                  className="text-xs font-bold text-emerald-900 underline hover:text-emerald-950"
                >
                  View Cart →
                </Link>
                <button
                  type="button"
                  onClick={() => setActionNotice(null)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-950 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{actionError}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-xs font-semibold underline hover:text-red-950 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Perks / Assurances Card */}
          <Card className="border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Truck className="size-4 shrink-0 text-indigo-600" />
              <span>
                <strong>Free express delivery</strong> on orders over $75
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
              <span>
                <strong>2-Year Tynoc Warranty</strong> included at no extra cost
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <RotateCcw className="size-4 shrink-0 text-amber-600" />
              <span>
                <strong>30-day risk-free returns</strong> & instant exchanges
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-200 pt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                You May Also Like
              </h2>
              <p className="text-sm text-slate-500">
                More items from the {categoryLabel} collection.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/products?categoryId=${encodeURIComponent(
                  product.categoryId
                )}`}
              >
                View Category
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                categoryName={categoryLabel}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


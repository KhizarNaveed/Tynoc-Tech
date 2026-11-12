"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
  const {
    items,
    subtotal,
    itemCount,
    isLoading,
    error,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);

  async function handleQuantityChange(productId: string, nextQuantity: number) {
    try {
      setPendingId(productId);
      await updateQuantity(productId, nextQuantity);
    } catch {
      // Error surfaced via CartContext
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(productId: string) {
    try {
      setPendingId(productId);
      await removeFromCart(productId);
    } catch {
      // Error surfaced via CartContext
    } finally {
      setPendingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="h-9 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card
                key={idx}
                className="h-32 animate-pulse rounded-2xl border-slate-100 bg-white"
              />
            ))}
          </div>
          <div className="lg:col-span-4">
            <Card className="h-72 animate-pulse rounded-2xl border-slate-100 bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border-slate-100 bg-white p-12 text-center shadow-sm space-y-5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <ShoppingBag className="size-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Your cart is empty
            </h1>
            <p className="mx-auto max-w-md text-sm text-slate-500">
              Looks like you haven&apos;t added anything to your cart yet.
              Explore our curated collection to find something you love.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/products">
                <span>Continue Shopping</span>
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
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Shopping Cart
          </h1>
        </div>
        <Badge variant="secondary" className="w-fit px-3 py-1 text-xs">
          {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
        </Badge>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {checkoutSuccess && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <span>
              <strong>Demo Checkout Preview:</strong> Your cart of {itemCount}{" "}
              item(s) totaling <strong>${subtotal.toFixed(2)}</strong> is ready
              for order processing!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutSuccess(false)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const product = item.product;
            const isUpdating = pendingId === item.productId;
            const maxStock = product?.stock ?? 99;

            return (
              <Card
                key={item.productId}
                className="rounded-2xl border-slate-100 bg-white p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                  >
                    {product ? (
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/products/${item.productId}`}
                        className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:underline line-clamp-1"
                      >
                        {product?.name ?? item.productId}
                      </Link>
                      <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 shrink-0">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">
                      {product?.description ?? "Product details"}
                    </p>

                    <p className="text-xs font-medium text-slate-500 pt-0.5">
                      Unit Price:{" "}
                      <span className="text-slate-900 font-semibold">
                        ${(product?.price ?? 0).toFixed(2)}
                      </span>
                    </p>

                    {/* Controls Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/70">
                        <button
                          type="button"
                          disabled={isUpdating || item.quantity <= 1}
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-slate-900">
                          {isUpdating ? (
                            <Loader2 className="mx-auto size-3.5 animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          type="button"
                          disabled={isUpdating || item.quantity >= maxStock}
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleRemove(item.productId)}
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order Summary Panel */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span>Shipping</span>
                <Badge variant="success" className="font-semibold">
                  Free
                </Badge>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span>Taxes</span>
                <span className="text-slate-700">Included</span>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full rounded-full"
              onClick={() => setCheckoutSuccess(true)}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="size-4" />
            </Button>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-indigo-600 shrink-0" />
                <span>Complimentary express shipping included</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>30-day money-back guarantee & 2-year warranty</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  Home as HomeIcon,
  Shirt,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import type { Category, Product } from "@/types";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "cat-electronics": <Headphones className="size-6" />,
  "cat-fashion": <Shirt className="size-6" />,
  "cat-home": <HomeIcon className="size-6" />,
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);
        if (!prodRes.ok) throw new Error("Failed to load featured products.");

        const prodData: Product[] = await prodRes.json();
        const catData: Category[] = catRes.ok ? await catRes.json() : [];
        if (active) {
          setProducts(prodData);
          setCategories(catData);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load products.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const featuredProducts = products.slice(0, 8);
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const heroProduct = products.find((p) => p.id === "prod-001") ?? products[0];

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {/* Soft mesh background */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_15%_-10%,rgba(99,102,241,0.18),transparent),radial-gradient(45rem_28rem_at_95%_10%,rgba(251,191,36,0.16),transparent),radial-gradient(40rem_30rem_at_60%_110%,rgba(244,114,182,0.14),transparent)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-[#fafafa] to-transparent"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:px-8 lg:py-32">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-600 backdrop-blur">
              <Sparkles className="size-3.5 text-indigo-600" />
              The 2026 collection is here
            </p>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Design-led goods for a{" "}
              <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                better
              </span>{" "}
              everyday.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
              Considered electronics, wardrobe staples and home essentials,
              chosen for quality and built to last.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/products">
                  Shop the collection
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full px-6"
              >
                <Link href="/products?categoryId=cat-electronics">
                  Explore electronics
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span>
                Rated <strong className="text-slate-900">4.9/5</strong> by
                thousands of customers
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2.5rem] bg-linear-to-br from-indigo-200/60 via-white/0 to-amber-200/60 blur-2xl"
              />
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/60 bg-slate-100 shadow-xl ring-1 ring-slate-900/5">
                {heroProduct && (
                  <ProductImage
                    src={heroProduct.imageUrl}
                    alt={heroProduct.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 28rem, 90vw"
                    className="object-cover"
                  />
                )}
              </div>
              {heroProduct && (
                <Link
                  href={`/products/${heroProduct.id}`}
                  className="absolute -bottom-5 left-4 right-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-white/90 px-5 py-4 shadow-lg backdrop-blur-md transition-shadow hover:shadow-xl sm:left-auto sm:right-[-1.5rem] sm:w-72"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Bestseller
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {heroProduct.name}
                    </p>
                  </div>
                  <span className="ml-3 text-sm font-extrabold text-slate-900">
                    ${heroProduct.price.toFixed(2)}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Shop by category
          </h2>
          <p className="mt-2 text-slate-500">
            Find exactly what you&apos;re looking for.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${encodeURIComponent(cat.id)}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-slate-50 text-slate-900">
                    {CATEGORY_ICONS[cat.id] ?? <Sparkles className="size-6" />}
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight text-slate-900">
                      {cat.name}
                    </h3>
                    <p className="line-clamp-1 text-sm text-slate-500">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Featured products
            </h2>
            <p className="mt-2 text-slate-500">
              Customer favourites, ready to ship.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/products">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
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
          ) : error ? (
            <Card className="border-red-200 bg-red-50/50 p-8 text-center">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </Card>
          ) : featuredProducts.length === 0 ? (
            <Card className="p-12 text-center text-slate-500">
              No featured products available yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryMap[product.categoryId]}
                  priority={i < 4}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

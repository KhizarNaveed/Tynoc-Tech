"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  PackageSearch,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import type { Category, Product } from "@/types";

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("categoryId") ?? "";
  const initialSearch = searchParams.get("search") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [prevUrlParams, setPrevUrlParams] = useState(
    `${initialCategory}|${initialSearch}`
  );
  const currentUrlParams = `${initialCategory}|${initialSearch}`;
  if (currentUrlParams !== prevUrlParams) {
    setPrevUrlParams(currentUrlParams);
    setSelectedCategory(initialCategory);
    setSearchInput(initialSearch);
  }

  // Fetch categories and products from backend API
  useEffect(() => {
    let active = true;
    async function loadCatalog() {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (!prodRes.ok) {
          throw new Error("Failed to fetch products from server.");
        }

        const prodData: Product[] = await prodRes.json();
        const catData: Category[] = catRes.ok ? await catRes.json() : [];

        if (active) {
          setProducts(prodData);
          setCategories(catData);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load catalog."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const query = searchInput.trim().toLowerCase();

    const list = products.filter((product) => {
      const matchesCategory =
        !selectedCategory || product.categoryId === selectedCategory;
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    if (sortBy === "price-asc") {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "name-asc") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, selectedCategory, searchInput, sortBy]);

  function handleResetFilters() {
    setSelectedCategory("");
    setSearchInput("");
    setSortBy("featured");
    router.replace("/products");
  }

  const hasActiveFilters = Boolean(selectedCategory || searchInput.trim());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-2">
              Tynoc Catalog
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {selectedCategory && categoryMap[selectedCategory]
                ? categoryMap[selectedCategory]
                : "All Products"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Browse our complete collection with real-time stock availability.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-600">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {loading ? "..." : filteredProducts.length}
            </span>{" "}
            of {products.length} products
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-6">
          <Card className="p-5 border-slate-200/90 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Filter className="size-4 text-indigo-600" />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label
                htmlFor="catalog-search"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Keyword Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="catalog-search"
                  type="text"
                  placeholder="Filter by name or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 pr-8 bg-slate-50/70"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Categories
              </p>
              <div className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                    selectedCategory === ""
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>All Categories</span>
                  <span
                    className={`text-xs ${
                      selectedCategory === "" ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {products.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const count = products.filter(
                    (p) => p.categoryId === cat.id
                  ).length;
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span
                        className={`text-xs ${
                          active ? "text-slate-300" : "text-slate-400"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label
                htmlFor="sort-select"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Sort By</span>
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </Card>
        </aside>

        {/* Main Products Grid */}
        <div className="lg:col-span-9 space-y-6">
          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                Active filters:
              </span>
              {selectedCategory && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 pl-3 pr-2 py-1"
                >
                  <span>
                    Category: {categoryMap[selectedCategory] ?? selectedCategory}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className="hover:text-slate-950 cursor-pointer"
                    aria-label="Remove category filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {searchInput.trim() && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 pl-3 pr-2 py-1"
                >
                  <span>Search: &ldquo;{searchInput.trim()}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="hover:text-slate-950 cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* States: Loading / Error / Empty / Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="overflow-hidden border-slate-200">
                  <div className="aspect-4/3 w-full animate-pulse bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
                    <div className="pt-2 flex items-center justify-between">
                      <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50/50 p-10 text-center space-y-3">
              <p className="text-base font-semibold text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card className="border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <PackageSearch className="size-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No products found
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                We couldn&apos;t find any products matching your current category
                or search filters.
              </p>
              <Button
                variant="default"
                className="mt-5"
                onClick={handleResetFilters}
              >
                <RotateCcw className="size-4" />
                <span>Reset All Filters</span>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryMap[product.categoryId]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-10 w-48 animate-pulse rounded bg-slate-200 mb-8" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="h-80 animate-pulse bg-slate-100" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}

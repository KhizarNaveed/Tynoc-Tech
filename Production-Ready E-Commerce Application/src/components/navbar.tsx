"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import type { Category } from "@/types";

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: "cat-electronics",
    name: "Electronics",
    description: "Smartphones, audio gear, wearables and accessories.",
  },
  {
    id: "cat-fashion",
    name: "Fashion",
    description: "Apparel, footwear and everyday accessories.",
  },
  {
    id: "cat-home",
    name: "Home & Living",
    description: "Furniture, decor and kitchen essentials.",
  },
];

export function Navbar() {
  const router = useRouter();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Category[] | null) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {
        // Keep fallback categories if offline
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setMobileMenuOpen(false);
    if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/products");
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      {/* Top announcement bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Free express shipping on all orders over $75</span>
          </p>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <Link href="/products" className="hover:text-white transition-colors">
              New Arrivals
            </Link>
            <span>•</span>
            <Link href="/products" className="hover:text-white transition-colors">
              30-Day Guarantee
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand + Primary Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-900 font-bold text-xl tracking-tight"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
              <Package className="size-5" />
            </span>
            <span>
              Tynoc<span className="text-indigo-600">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              All Products
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                aria-expanded={dropdownOpen}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`size-4 text-slate-500 transition-transform duration-150 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-slate-900/5">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Shop by Category
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?categoryId=${encodeURIComponent(cat.id)}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex flex-col rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-900">
                        {cat.name}
                      </span>
                      <span className="text-xs text-slate-500 line-clamp-1">
                        {cat.description}
                      </span>
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-slate-100 pt-1">
                    <Link
                      href="/products"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/60 transition-colors"
                    >
                      <span>Browse Full Catalog</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md items-center relative"
        >
          <Search className="pointer-events-none absolute left-3.5 size-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search headphones, sneakers, home decor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20 bg-slate-50/80 border-slate-200 focus-visible:bg-white"
          />
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            className="absolute right-1.5 h-7 px-2.5 text-xs font-medium"
          >
            Search
          </Button>
        </form>

        {/* Right: Wishlist & Cart Icons + Mobile Menu Trigger */}
        <div className="flex items-center gap-2">
          <Link
            href="/wishlist"
            title="Wishlist"
            aria-label="Wishlist"
            className="relative inline-flex items-center justify-center rounded-lg p-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Heart
              className={`size-5 transition-colors ${
                wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
            <Badge
              variant="secondary"
              className="ml-1.5 px-1.5 py-0 text-[11px] font-semibold"
            >
              {wishlistCount}
            </Badge>
          </Link>

          <Link
            href="/cart"
            title="Shopping Cart"
            aria-label="Shopping Cart"
            className="relative inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <ShoppingBag className="size-4" />
            <span className="ml-2 hidden sm:inline text-xs font-medium">Cart</span>
            <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white">
              {cartCount}
            </span>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 size-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 bg-slate-50"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 h-7 px-3 text-xs"
            >
              Go
            </Button>
          </form>

          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              All Products
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              <span>Wishlist</span>
              <Badge variant="secondary">{wishlistCount}</Badge>
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              <span>Shopping Cart</span>
              <Badge variant="default">{cartCount}</Badge>
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Categories
            </p>
            <div className="flex flex-col space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?categoryId=${encodeURIComponent(cat.id)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


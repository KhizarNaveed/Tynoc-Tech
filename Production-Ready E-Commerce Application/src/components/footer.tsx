import Link from "next/link";
import { Package, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      {/* Value props strip */}
      <div className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Truck className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Fast & Free Delivery
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Complimentary tracked shipping on orders over $75.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                2-Year Tynoc Warranty
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Every item is quality-inspected and backed by our protection plan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                30-Day Hassle-Free Returns
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Easy exchanges or full refunds within 30 days of delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-lg">
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Package className="size-4" />
            </span>
            <span>
              Tynoc<span className="text-indigo-600">.</span> Store
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link
              href="/products"
              className="hover:text-slate-900 transition-colors"
            >
              All Products
            </Link>
            <Link
              href="/products?categoryId=cat-electronics"
              className="hover:text-slate-900 transition-colors"
            >
              Electronics
            </Link>
            <Link
              href="/products?categoryId=cat-fashion"
              className="hover:text-slate-900 transition-colors"
            >
              Fashion
            </Link>
            <Link
              href="/products?categoryId=cat-home"
              className="hover:text-slate-900 transition-colors"
            >
              Home & Living
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Tynoc E-Commerce. All rights reserved.</p>
          <p>Built with Next.js App Router, Tailwind CSS, shadcn/ui & AWS DynamoDB.</p>
        </div>
      </div>
    </footer>
  );
}


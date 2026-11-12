import { NextResponse, type NextRequest } from "next/server";
import { TABLES } from "@/lib/db";
import { scanTable } from "@/lib/dynamodb";
import { handleError } from "@/lib/api";
import type { Product } from "@/types";

// GET /api/products?categoryId=...&search=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const categoryId = searchParams.get("categoryId")?.trim();
    const search = searchParams.get("search")?.trim().toLowerCase();

    let products = await scanTable<Product>(TABLES.PRODUCTS);

    if (categoryId) {
      products = products.filter((p) => p.categoryId === categoryId);
    }
    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search),
      );
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}


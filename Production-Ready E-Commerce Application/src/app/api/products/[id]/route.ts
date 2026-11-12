import { NextResponse, type NextRequest } from "next/server";
import { TABLES } from "@/lib/db";
import { getItem } from "@/lib/dynamodb";
import { errorResponse, handleError } from "@/lib/api";
import type { Product } from "@/types";

// GET /api/products/:id
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/products/[id]">,
) {
  try {
    const { id } = await ctx.params;
    const product = await getItem<Product>(TABLES.PRODUCTS, { id });

    if (!product) {
      return errorResponse(404, `Product "${id}" not found.`);
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}


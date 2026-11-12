import { NextResponse, type NextRequest } from "next/server";
import { TABLES } from "@/lib/db";
import {
  deleteItem,
  getItem,
  putItem,
  queryByPartitionKey,
} from "@/lib/dynamodb";
import {
  errorResponse,
  handleError,
  readJsonBody,
  requireString,
} from "@/lib/api";
import type { Product, WishlistItem } from "@/types";

// GET /api/wishlist?userId=...
export async function GET(request: NextRequest) {
  try {
    const userId = requireString(
      request.nextUrl.searchParams.get("userId"),
      "userId",
    );

    const wishlistItems = await queryByPartitionKey<WishlistItem>(
      TABLES.WISHLISTS,
      "userId",
      userId,
    );

    const items = await Promise.all(
      wishlistItems.map(async (item) => ({
        ...item,
        product: await getItem<Product>(TABLES.PRODUCTS, { id: item.productId }),
      })),
    );

    return NextResponse.json({ userId, items, itemCount: items.length }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/wishlist  { userId, productId }
// Idempotent: adding an existing item returns 200 instead of creating a duplicate.
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const userId = requireString(body.userId, "userId");
    const productId = requireString(body.productId, "productId");

    const product = await getItem<Product>(TABLES.PRODUCTS, { id: productId });
    if (!product) {
      return errorResponse(404, `Product "${productId}" not found.`);
    }

    const existing = await getItem<WishlistItem>(TABLES.WISHLISTS, {
      userId,
      productId,
    });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const created = await putItem<WishlistItem>(TABLES.WISHLISTS, {
      userId,
      productId,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/wishlist?userId=...&productId=...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = requireString(searchParams.get("userId"), "userId");
    const productId = requireString(searchParams.get("productId"), "productId");

    const deleted = await deleteItem<WishlistItem>(TABLES.WISHLISTS, {
      userId,
      productId,
    });
    if (!deleted) {
      return errorResponse(404, "Wishlist item not found.");
    }
    return NextResponse.json(
      { message: "Item removed from wishlist.", item: deleted },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}


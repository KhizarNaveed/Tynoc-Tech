import { NextResponse, type NextRequest } from "next/server";
import { TABLES } from "@/lib/db";
import {
  deleteItem,
  getItem,
  putItem,
  queryByPartitionKey,
  updateItem,
} from "@/lib/dynamodb";
import {
  ApiError,
  errorResponse,
  handleError,
  readJsonBody,
  requireQuantity,
  requireString,
} from "@/lib/api";
import type { CartItem, Product } from "@/types";

async function requireProduct(productId: string): Promise<Product> {
  const product = await getItem<Product>(TABLES.PRODUCTS, { id: productId });
  if (!product) {
    throw new ApiError(404, `Product "${productId}" not found.`);
  }
  return product;
}

function assertInStock(product: Product, quantity: number) {
  if (quantity > product.stock) {
    throw new ApiError(
      400,
      `Only ${product.stock} unit(s) of "${product.name}" are in stock.`,
    );
  }
}

// GET /api/cart?userId=...
export async function GET(request: NextRequest) {
  try {
    const userId = requireString(
      request.nextUrl.searchParams.get("userId"),
      "userId",
    );

    const cartItems = await queryByPartitionKey<CartItem>(
      TABLES.CARTS,
      "userId",
      userId,
    );

    const items = await Promise.all(
      cartItems.map(async (item) => {
        const product = await getItem<Product>(TABLES.PRODUCTS, {
          id: item.productId,
        });
        return {
          ...item,
          product,
          lineTotal: product ? product.price * item.quantity : 0,
        };
      }),
    );

    const subtotal = Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return NextResponse.json({ userId, items, itemCount, subtotal }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/cart  { userId, productId, quantity }
// Adding a product that is already in the cart increases its quantity
// (no duplicate rows are ever created).
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const userId = requireString(body.userId, "userId");
    const productId = requireString(body.productId, "productId");
    const quantity = requireQuantity(body.quantity);

    const product = await requireProduct(productId);
    const existing = await getItem<CartItem>(TABLES.CARTS, { userId, productId });

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      assertInStock(product, newQuantity);
      const updated = await updateItem<CartItem>(
        TABLES.CARTS,
        { userId, productId },
        { quantity: newQuantity },
      );
      return NextResponse.json(updated, { status: 200 });
    }

    assertInStock(product, quantity);
    const created = await putItem<CartItem>(TABLES.CARTS, {
      userId,
      productId,
      quantity,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/cart  { userId, productId, quantity }  — sets the quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const userId = requireString(body.userId, "userId");
    const productId = requireString(body.productId, "productId");
    const quantity = requireQuantity(body.quantity);

    const existing = await getItem<CartItem>(TABLES.CARTS, { userId, productId });
    if (!existing) {
      return errorResponse(404, "Cart item not found.");
    }

    const product = await requireProduct(productId);
    assertInStock(product, quantity);

    const updated = await updateItem<CartItem>(
      TABLES.CARTS,
      { userId, productId },
      { quantity },
    );
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/cart?userId=...&productId=...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = requireString(searchParams.get("userId"), "userId");
    const productId = requireString(searchParams.get("productId"), "productId");

    const deleted = await deleteItem<CartItem>(TABLES.CARTS, { userId, productId });
    if (!deleted) {
      return errorResponse(404, "Cart item not found.");
    }
    return NextResponse.json(
      { message: "Item removed from cart.", item: deleted },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error);
  }
}


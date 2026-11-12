import { NextResponse } from "next/server";
import { TABLES } from "@/lib/db";
import { scanTable } from "@/lib/dynamodb";
import { handleError } from "@/lib/api";
import type { Category } from "@/types";

// GET /api/categories
export async function GET() {
  try {
    const categories = await scanTable<Category>(TABLES.CATEGORIES);
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}


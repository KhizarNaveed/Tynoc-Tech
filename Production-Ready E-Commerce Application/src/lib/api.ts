import { NextResponse } from "next/server";
import { DatabaseError } from "./dynamodb";

/** Error carrying an HTTP status, thrown by validation / business logic. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

/** Convert any thrown value into a JSON error response. */
export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return errorResponse(error.status, error.message);
  }
  if (error instanceof DatabaseError) {
    console.error(error);
    return errorResponse(500, "A database error occurred. Please try again later.");
  }
  console.error("Unexpected error:", error);
  return errorResponse(500, "Internal server error.");
}

/** Parse a JSON object body or throw a 400. */
export async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ApiError(400, "Request body must be a JSON object.");
  }
  return body as Record<string, unknown>;
}

/** Require a non-empty string (from a JSON body field or query parameter). */
export function requireString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(400, `"${name}" is required and must be a non-empty string.`);
  }
  return value.trim();
}

/** Require a positive integer quantity. */
export function requireQuantity(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    throw new ApiError(400, '"quantity" is required and must be a positive integer.');
  }
  return value;
}


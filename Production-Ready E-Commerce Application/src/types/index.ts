/**
 * Core domain entities, mirroring the DynamoDB table schemas.
 *
 * Table            Partition key   Sort key
 * ---------------  --------------  ----------
 * Tynoc-Users      id              —
 * Tynoc-Categories id              —
 * Tynoc-Products   id              —
 * Tynoc-Carts      userId          productId
 * Tynoc-Wishlists  userId          productId
 */

export interface User {
  id: string;
  name: string;
  email: string;
  /** ISO 8601 timestamp */
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Price in USD */
  price: number;
  categoryId: Category["id"];
  imageUrl: string;
  stock: number;
}

export interface CartItem {
  userId: User["id"];
  productId: Product["id"];
  quantity: number;
}

export interface WishlistItem {
  userId: User["id"];
  productId: Product["id"];
}

/** Primary-key shapes for each entity (used with getItem/updateItem/deleteItem). */
export type UserKey = Pick<User, "id">;
export type CategoryKey = Pick<Category, "id">;
export type ProductKey = Pick<Product, "id">;
export type CartItemKey = Pick<CartItem, "userId" | "productId">;
export type WishlistItemKey = Pick<WishlistItem, "userId" | "productId">;


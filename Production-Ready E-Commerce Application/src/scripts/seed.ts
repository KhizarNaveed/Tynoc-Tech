/**
 * Seed script: creates the DynamoDB tables (if missing) and inserts sample data.
 *
 * Run with:  npm run seed
 * (equivalent to: npx tsx --env-file=.env.local src/scripts/seed.ts)
 */
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
  waitUntilTableExists,
  type CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";
import { dynamoClient, TABLES } from "@/lib/db";
import { putItem } from "@/lib/dynamodb";
import type { Category, Product } from "@/types";

/**
 * Provisioned capacity per table (Provisioned mode — NOT On-Demand).
 * NOTE: The AWS Free Tier covers 25 RCU + 25 WCU in total per account per
 * region, shared across ALL tables. With 5 tables, 5 RCU + 5 WCU each totals 25.
 */
const PROVISIONED_THROUGHPUT = {
  ReadCapacityUnits: 5,
  WriteCapacityUnits: 5,
} as const;

type TableDefinition = Pick<
  CreateTableCommandInput,
  "TableName" | "KeySchema" | "AttributeDefinitions"
>;

const TABLE_DEFINITIONS: TableDefinition[] = [
  {
    TableName: TABLES.PRODUCTS,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  {
    TableName: TABLES.CATEGORIES,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  {
    TableName: TABLES.USERS,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  {
    TableName: TABLES.CARTS,
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "productId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "productId", AttributeType: "S" },
    ],
  },
  {
    TableName: TABLES.WISHLISTS,
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "productId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "productId", AttributeType: "S" },
    ],
  },
];

const CATEGORIES: Category[] = [
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

const PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Wireless Noise-Cancelling Headphones",
    description: "Over-ear headphones with active noise cancellation and 30-hour battery life.",
    price: 199.99,
    categoryId: "cat-electronics",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    stock: 50,
  },
  {
    id: "prod-002",
    name: "Smartwatch Pro",
    description: "Fitness tracking, heart-rate monitoring and GPS in a sleek aluminium case.",
    price: 249.0,
    categoryId: "cat-electronics",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    stock: 35,
  },
  {
    id: "prod-003",
    name: "Portable Bluetooth Speaker",
    description: "Waterproof speaker with deep bass and 12-hour playtime.",
    price: 79.5,
    categoryId: "cat-electronics",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
    stock: 80,
  },
  {
    id: "prod-004",
    name: "USB-C Fast Charger 65W",
    description: "Compact GaN charger for laptops, tablets and phones.",
    price: 39.99,
    categoryId: "cat-electronics",
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
    stock: 120,
  },
  {
    id: "prod-005",
    name: "Classic Denim Jacket",
    description: "Timeless medium-wash denim jacket with a relaxed fit.",
    price: 89.0,
    categoryId: "cat-fashion",
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
    stock: 40,
  },
  {
    id: "prod-006",
    name: "Everyday Running Sneakers",
    description: "Lightweight, breathable sneakers with cushioned soles.",
    price: 119.95,
    categoryId: "cat-fashion",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    stock: 60,
  },
  {
    id: "prod-007",
    name: "Leather Minimalist Wallet",
    description: "Slim genuine-leather wallet with RFID protection.",
    price: 34.99,
    categoryId: "cat-fashion",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
    stock: 150,
  },
  {
    id: "prod-008",
    name: "Ergonomic Office Chair",
    description: "Adjustable lumbar support, breathable mesh back and 4D armrests.",
    price: 329.0,
    categoryId: "cat-home",
    imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80",
    stock: 20,
  },
  {
    id: "prod-009",
    name: "Ceramic Pour-Over Coffee Set",
    description: "Handcrafted dripper, carafe and two mugs for the perfect brew.",
    price: 54.0,
    categoryId: "cat-home",
    imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80",
    stock: 45,
  },
  {
    id: "prod-010",
    name: "Scented Soy Candle Trio",
    description: "Three long-burning soy candles in lavender, vanilla and cedar.",
    price: 29.99,
    categoryId: "cat-home",
    imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80",
    stock: 90,
  },
];

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) return false;
    throw error;
  }
}

async function ensureTable(definition: TableDefinition): Promise<void> {
  const tableName = definition.TableName as string;

  if (await tableExists(tableName)) {
    console.log(`  ✓ ${tableName} already exists — skipping`);
    return;
  }

  console.log(`  + Creating ${tableName}...`);
  await dynamoClient.send(
    new CreateTableCommand({
      ...definition,
      BillingMode: "PROVISIONED",
      ProvisionedThroughput: PROVISIONED_THROUGHPUT,
    }),
  );

  await waitUntilTableExists(
    { client: dynamoClient, maxWaitTime: 120 },
    { TableName: tableName },
  );
  console.log(`  ✓ ${tableName} is ACTIVE`);
}

async function main(): Promise<void> {
  console.log("🔧 Ensuring tables exist...");
  // Sequential to avoid hitting the concurrent CreateTable limit.
  for (const definition of TABLE_DEFINITIONS) {
    await ensureTable(definition);
  }

  console.log(`\n🌱 Seeding ${CATEGORIES.length} categories...`);
  await Promise.all(CATEGORIES.map((c) => putItem(TABLES.CATEGORIES, c)));

  console.log(`🌱 Seeding ${PRODUCTS.length} products...`);
  await Promise.all(PRODUCTS.map((p) => putItem(TABLES.PRODUCTS, p)));

  console.log("\n✅ Seed completed successfully.");
}

main().catch((error: unknown) => {
  console.error("\n❌ Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});


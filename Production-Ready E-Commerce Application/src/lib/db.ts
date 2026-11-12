import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * DynamoDB client setup.
 *
 * Server-side only: this module reads secret credentials from environment
 * variables and must never be imported into client components.
 */

const REQUIRED_ENV_VARS = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

function getEnvConfig(): Record<RequiredEnvVar, string> {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and fill in your AWS credentials.",
    );
  }

  return {
    AWS_REGION: process.env.AWS_REGION as string,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  };
}

const env = getEnvConfig();

/** Low-level DynamoDB client (used for table management, e.g. CreateTable). */
export const dynamoClient = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/** High-level DocumentClient that marshals plain JS objects automatically. */
export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

/** Centralised table names so they are never hard-coded across the app. */
export const TABLES = {
  PRODUCTS: "Tynoc-Products",
  CATEGORIES: "Tynoc-Categories",
  USERS: "Tynoc-Users",
  CARTS: "Tynoc-Carts",
  WISHLISTS: "Tynoc-Wishlists",
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];


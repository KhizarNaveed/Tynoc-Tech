import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  type ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./db";

/**
 * Generic, reusable DynamoDB data-access helpers built on the DocumentClient.
 * Each helper wraps AWS errors in a DatabaseError with useful context.
 */

export type DynamoKey = Record<string, string | number>;
export type DynamoItem = Record<string, unknown>;

export class DatabaseError extends Error {
  constructor(
    public readonly operation: string,
    public readonly tableName: string,
    cause: unknown,
  ) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super(`DynamoDB ${operation} failed on "${tableName}": ${reason}`, {
      cause,
    });
    this.name = "DatabaseError";
  }
}

/** Create or fully replace an item. */
export async function putItem<T extends object>(
  tableName: string,
  item: T,
): Promise<T> {
  try {
    await docClient.send(new PutCommand({ TableName: tableName, Item: item as DynamoItem }));
    return item;
  } catch (error) {
    throw new DatabaseError("putItem", tableName, error);
  }
}

/** Fetch a single item by primary key. Returns `null` if not found. */
export async function getItem<T extends object>(
  tableName: string,
  key: DynamoKey,
): Promise<T | null> {
  try {
    const { Item } = await docClient.send(
      new GetCommand({ TableName: tableName, Key: key }),
    );
    return (Item as T | undefined) ?? null;
  } catch (error) {
    throw new DatabaseError("getItem", tableName, error);
  }
}

/**
 * Partially update an item's attributes and return the updated item.
 * Key attributes and `undefined` values in `updates` are ignored.
 * Fails if the item does not exist (no implicit upsert).
 */
export async function updateItem<T extends object>(
  tableName: string,
  key: DynamoKey,
  updates: Partial<T>,
): Promise<T> {
  const entries = Object.entries(updates).filter(
    ([field, value]) => !(field in key) && value !== undefined,
  );

  if (entries.length === 0) {
    throw new DatabaseError(
      "updateItem",
      tableName,
      new Error("No updatable fields were provided."),
    );
  }

  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  const setClauses = entries.map(([field, value], i) => {
    names[`#f${i}`] = field;
    values[`:v${i}`] = value;
    return `#f${i} = :v${i}`;
  });

  // Ensure the item exists so we don't silently create a partial record.
  const keyConditions = Object.keys(key).map((field, i) => {
    names[`#k${i}`] = field;
    return `attribute_exists(#k${i})`;
  });

  try {
    const { Attributes } = await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: `SET ${setClauses.join(", ")}`,
        ConditionExpression: keyConditions.join(" AND "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
      }),
    );
    return Attributes as T;
  } catch (error) {
    throw new DatabaseError("updateItem", tableName, error);
  }
}

/** Delete an item by primary key. Returns the deleted item, or `null`. */
export async function deleteItem<T extends object>(
  tableName: string,
  key: DynamoKey,
): Promise<T | null> {
  try {
    const { Attributes } = await docClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: key,
        ReturnValues: "ALL_OLD",
      }),
    );
    return (Attributes as T | undefined) ?? null;
  } catch (error) {
    throw new DatabaseError("deleteItem", tableName, error);
  }
}

/**
 * Return every item in a table, following pagination automatically.
 * Note: Scan reads the whole table — fine for small datasets, but prefer
 * Query with keys/indexes for large tables.
 */
export async function scanTable<T extends object>(
  tableName: string,
): Promise<T[]> {
  const items: T[] = [];
  let lastEvaluatedKey: ScanCommandInput["ExclusiveStartKey"];

  try {
    do {
      const page = await docClient.send(
        new ScanCommand({
          TableName: tableName,
          ExclusiveStartKey: lastEvaluatedKey,
        }),
      );
      items.push(...((page.Items as T[] | undefined) ?? []));
      lastEvaluatedKey = page.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return items;
  } catch (error) {
    throw new DatabaseError("scanTable", tableName, error);
  }
}

/**
 * Return every item sharing a partition key (e.g. all cart items of a user),
 * following pagination automatically.
 */
export async function queryByPartitionKey<T extends object>(
  tableName: string,
  keyName: string,
  keyValue: string | number,
): Promise<T[]> {
  const items: T[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  try {
    do {
      const page = await docClient.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: "#pk = :pk",
          ExpressionAttributeNames: { "#pk": keyName },
          ExpressionAttributeValues: { ":pk": keyValue },
          ExclusiveStartKey: lastEvaluatedKey,
        }),
      );
      items.push(...((page.Items as T[] | undefined) ?? []));
      lastEvaluatedKey = page.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return items;
  } catch (error) {
    throw new DatabaseError("queryByPartitionKey", tableName, error);
  }
}
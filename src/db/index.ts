import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

let poolSingleton: Pool | undefined;

export const getPool = (): Pool => {
  if (poolSingleton) {
    return poolSingleton;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  poolSingleton = new Pool({
    connectionString,
  });

  return poolSingleton;
};

export const getDb = () => {
  return drizzle(getPool(), {
    schema,
    casing: "snake_case",
  });
};

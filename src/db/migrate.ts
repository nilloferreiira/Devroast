import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getDb, getPool } from "@/db";

const run = async () => {
  const db = getDb();

  await migrate(db, {
    migrationsFolder: "drizzle",
  });

  await getPool().end();
};

run().catch(async (error) => {
  console.error("Migration failed", error);
  await getPool().end();
  process.exit(1);
});

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    const client = postgres(process.env.DATABASE_URL!);
    db = drizzle(client);
  }
  return db;
}

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/kineos";
const isRemote = connectionString.includes('supabase.com') || connectionString.includes('pooler');

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = globalForDb.conn ?? postgres(connectionString, { 
  prepare: false,
  ssl: isRemote ? 'require' : undefined,
  max: isRemote ? 3 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });


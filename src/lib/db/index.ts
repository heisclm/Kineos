import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/kineos";
const isRemote = connectionString.includes('supabase.com') || connectionString.includes('pooler');

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { 
  prepare: false,
  ssl: isRemote ? 'require' : undefined,
});
export const db = drizzle(client, { schema });


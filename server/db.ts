import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
// hvhgfgjgv
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
export const db = drizzle(pool);

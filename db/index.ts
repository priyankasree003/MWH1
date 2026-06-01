import { getConnectionString } from '@netlify/database';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.ts';

export function getDb() {
  const sql = neon(getConnectionString());
  return drizzle(sql, { schema });
}

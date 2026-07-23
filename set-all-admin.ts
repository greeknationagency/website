import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/db/schema';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });
  
  await db.update(schema.users).set({ isAdmin: true });
    
  console.log('Successfully updated all users to admin.');
}

main().catch(console.error);

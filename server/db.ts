import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as productionSchema from "./db-schemas/production-schema";
import * as brandSchema from "./db-schemas/brand-schema";
import * as financierSchema from "./db-schemas/financier-schema";
import * as creatorSchema from "./db-schemas/creator-schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Combined schema for all role-specific tables
const combinedSchema = {
  ...schema,
  ...productionSchema,
  ...brandSchema,
  ...financierSchema,
  ...creatorSchema,
};

export const db = drizzle({ client: pool, schema: combinedSchema });
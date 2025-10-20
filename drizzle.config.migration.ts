import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Use session mode on pooler (port 5432) with SSL configuration
const sessionModeUrl = process.env.DATABASE_URL
  .replace(':6543', ':5432')
  .replace('?pgbouncer=true&connection_limit=1', '');

console.log(`Using session mode connection on port 5432 with SSL`);

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: sessionModeUrl,
    ssl: false, // Try without SSL first
  },
});

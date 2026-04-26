import fs from "node:fs";
import path from "node:path";
import { Pool, type PoolConfig } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __pgSchemaReady: Promise<void> | undefined;
}

function buildPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const config: PoolConfig = { connectionString: url };
  // Railway's public Postgres endpoint uses TLS; enable it when present.
  if (url.includes("sslmode=") === false && /proxy\.rlwy\.net|railway\.app/.test(url)) {
    config.ssl = { rejectUnauthorized: false };
  }
  return new Pool(config);
}

export function getPool(): Pool | null {
  if (!global.__pgPool) {
    const pool = buildPool();
    if (!pool) return null;
    global.__pgPool = pool;
  }
  return global.__pgPool;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

async function applySchema(pool: Pool) {
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
}

export async function ensureSchema(): Promise<void> {
  if (!global.__pgSchemaReady) {
    const pool = getPool();
    if (!pool) return;
    global.__pgSchemaReady = (async () => {
      try {
        await applySchema(pool);
      } catch (err) {
        console.error("Failed to apply database schema:", err);
        throw err;
      }
    })();
  }
  return global.__pgSchemaReady;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) {
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not configured");
  await ensureSchema();
  return pool.query<T>(text, params);
}

/**
 * Applies database/migrations/*.sql then database/seeds/*.sql, in
 * alphabetical order, against DATABASE_URL (a direct Postgres connection
 * string -- NOT the Supabase service_role key, which only talks REST).
 *
 * Tracks applied files in a `schema_migrations` table so re-runs are
 * idempotent. Each file is executed in its own transaction.
 *
 * Usage: DATABASE_URL=postgresql://... node scripts/runMigrations.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = path.join(__dirname, "..", "..");
const DIRS = [
  path.join(ROOT, "database", "migrations"),
  path.join(ROOT, "database", "seeds"),
];

async function ensureTrackingTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function alreadyApplied(client, filename) {
  const { rows } = await client.query(
    "SELECT 1 FROM schema_migrations WHERE filename = $1",
    [filename]
  );
  return rows.length > 0;
}

async function applyFile(client, dir, filename) {
  const sql = fs.readFileSync(path.join(dir, filename), "utf8");
  const hasTransaction = /^\s*BEGIN;/im.test(sql);

  await client.query("BEGIN");
  try {
    if (hasTransaction) {
      // Strip the file's own BEGIN/COMMIT so we can wrap + record atomically.
      const body = sql.replace(/^\s*BEGIN;/im, "").replace(/COMMIT;\s*$/im, "");
      await client.query(body);
    } else {
      await client.query(sql);
    }
    await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [filename]);
    await client.query("COMMIT");
    console.log(`applied: ${filename}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(`failed: ${filename}\n${err.message}`);
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Set it to a Postgres connection string (with password).");
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await ensureTrackingTable(client);

    for (const dir of DIRS) {
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
      for (const filename of files) {
        if (await alreadyApplied(client, filename)) {
          console.log(`skipped (already applied): ${filename}`);
          continue;
        }
        await applyFile(client, dir, filename);
      }
    }

    console.log("All migrations and seeds are up to date.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

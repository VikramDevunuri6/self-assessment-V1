# Database Migrations & Seeds

This directory contains the full schema evolution for the enterprise redesign, applied
**additively** on top of the existing Supabase project (49 questions / 196 options / 0
profiles / 0 sessions preserved).

## Layout

- `migrations/0001..0008_*.sql` — DDL only (new tables, altered columns, the
  `assessments` → `assessment_sessions` rename + new `assessments` catalog table).
- `seeds/0001..0009_*.sql` — reference/config data: roles, categories, traits, dimensions,
  trait→dimension weights, backfilled FKs on the 49 questions, default option scores,
  formulas, personality archetypes, recommendations, and the assessment catalog.
- `000_combined.sql` — all of the above concatenated in order, for a single paste into the
  Supabase SQL editor.

## Applying

**Option A — Supabase SQL Editor (no extra credentials needed)**

Open the project's SQL editor and run `000_combined.sql` once. It's wrapped in
per-file transactions and uses `IF NOT EXISTS` / `ON CONFLICT DO NOTHING`, so re-running it
is safe.

**Option B — `runMigrations.js` (requires a direct Postgres connection string)**

```bash
DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres" \
  node backend/scripts/runMigrations.js
```

This is the Postgres connection string from Project Settings → Database (different from the
`SUPABASE_SERVICE_ROLE_KEY` used elsewhere, which only talks to the REST API). It tracks
applied files in a `schema_migrations` table, so it can be re-run safely as new
migrations/seeds are added.

## Order matters

Migrations must run before seeds (categories/traits/dimensions/etc. must exist before the
backfill and weight seeds reference them by code). Both `000_combined.sql` and
`runMigrations.js` preserve this order.

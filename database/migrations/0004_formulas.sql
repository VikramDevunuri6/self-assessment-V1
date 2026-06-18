-- Versioned, database-driven formula definitions. The backend's
-- formulaEngine interprets `formula_versions.definition` (jsonb) at
-- scoring time -- admins can publish a new version without a deploy.

BEGIN;

CREATE TABLE IF NOT EXISTS formulas (
  id bigserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS formula_versions (
  id bigserial PRIMARY KEY,
  formula_id bigint NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  version int NOT NULL,
  definition jsonb NOT NULL,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  UNIQUE (formula_id, version)
);

CREATE INDEX IF NOT EXISTS idx_formula_versions_formula_id ON formula_versions (formula_id);

COMMIT;

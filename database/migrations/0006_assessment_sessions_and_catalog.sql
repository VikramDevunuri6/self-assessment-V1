-- The existing `assessments` table (0 rows) is actually shaped like a
-- per-user session: {id uuid, user_id, status, current_question,
-- started_at, completed_at}. Rename it to `assessment_sessions` (its real
-- role) and introduce a new `assessments` table as the catalog of
-- assessment *definitions* (e.g. "Personality & Career Discovery v1").
-- Safe because the table is currently empty.

BEGIN;

ALTER TABLE assessments RENAME TO assessment_sessions;

CREATE TABLE assessments (
  id bigserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  version int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assessment_sessions
  ADD COLUMN assessment_id bigint REFERENCES assessments(id);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_status
  ON assessment_sessions (user_id, status);

COMMIT;

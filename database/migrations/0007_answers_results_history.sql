-- Per-question answers (autosaved, upserted on session_id+question_id),
-- the generated report JSON per session (versioned), and a history table
-- for regenerations/PDF exports.

BEGIN;

CREATE TABLE IF NOT EXISTS answers (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id bigint NOT NULL REFERENCES questions(id),
  option_id bigint NOT NULL REFERENCES question_options(id),
  answered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers (session_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers (user_id);

CREATE TABLE IF NOT EXISTS assessment_results (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_json jsonb NOT NULL,
  version int NOT NULL DEFAULT 1,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, version)
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_session_id ON assessment_results (session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results (user_id);

CREATE TABLE IF NOT EXISTS report_history (
  id bigserial PRIMARY KEY,
  result_id bigint NOT NULL REFERENCES assessment_results(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  report_json jsonb NOT NULL,
  pdf_generated_at timestamptz,
  generated_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_history_session_id ON report_history (session_id);

COMMIT;

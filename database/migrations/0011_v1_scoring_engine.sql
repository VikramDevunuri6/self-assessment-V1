-- V1 scoring/report engine -- a from-scratch system for the 48-question
-- PDF question set (questions.group_no 1-48, is_active=true, id 50-97).
-- Entirely additive: no existing table is altered. The old engine's tables
-- (traits, dimensions, personality_types, recommendations, formulas,
-- formula_versions, trait_dimension_weights, categories) keep serving only
-- the dormant 49-question set and the 7 historical assessment_results rows
-- tied to it -- this migration never references them.
--
-- All weights/mappings/rules/thresholds live here as data (v1_* tables),
-- never as hardcoded JS, so they can be retuned later without a code change.

BEGIN;

-- The 13 scored traits.
CREATE TABLE IF NOT EXISTS v1_traits (
  id smallserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  display_order smallint NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

-- Trait <-> PDF-question-number mapping. Each scoring question (45 of the
-- 48) maps to exactly one trait. The 3 validity items (group_no 40,41,42)
-- deliberately have no row here -- they never feed a trait average.
CREATE TABLE IF NOT EXISTS v1_trait_questions (
  id bigserial PRIMARY KEY,
  trait_id smallint NOT NULL REFERENCES v1_traits(id) ON DELETE CASCADE,
  group_no smallint UNIQUE NOT NULL
);

-- Explicit registry of the validity-check questions, so confidence-calc
-- code reads "which questions are validity items" from data too.
CREATE TABLE IF NOT EXISTS v1_validity_questions (
  id smallserial PRIMARY KEY,
  group_no smallint UNIQUE NOT NULL
);

-- Overall-score band thresholds.
CREATE TABLE IF NOT EXISTS v1_score_bands (
  id smallserial PRIMARY KEY,
  label text UNIQUE NOT NULL,
  min_score smallint NOT NULL,
  max_score smallint NOT NULL,
  display_order smallint NOT NULL
);

-- Career/department fit departments.
CREATE TABLE IF NOT EXISTS v1_departments (
  id smallserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  display_order smallint NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

-- Department fit = weighted average of a department's relevant traits.
-- Weights are placeholder v1 config (face-valid, not statistically fitted)
-- and are expected to be retuned once real outcome data exists -- that's
-- exactly why they live here as editable rows, not constants in code.
CREATE TABLE IF NOT EXISTS v1_department_trait_weights (
  id bigserial PRIMARY KEY,
  department_id smallint NOT NULL REFERENCES v1_departments(id) ON DELETE CASCADE,
  trait_id smallint NOT NULL REFERENCES v1_traits(id) ON DELETE CASCADE,
  weight numeric NOT NULL CHECK (weight > 0 AND weight <= 1),
  UNIQUE (department_id, trait_id)
);

-- Career-signal rules: a trait-combination -> label+rationale, evaluated
-- at report time. `conditions` is a jsonb array of
-- {"traitCode": "...", "operator": "high"|"low"}; all conditions must
-- match (AND) for the rule to fire. Same "rules as data" idiom already
-- used by personality_types.criteria / recommendations.condition.
CREATE TABLE IF NOT EXISTS v1_career_signal_rules (
  id bigserial PRIMARY KEY,
  label text NOT NULL,
  rationale text NOT NULL,
  conditions jsonb NOT NULL,
  priority int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v1_career_signal_rules_priority ON v1_career_signal_rules (priority);

-- Tunable engine thresholds (high/low score cutoffs, balanced-profile
-- spread) as key/value rows instead of JS constants.
CREATE TABLE IF NOT EXISTS v1_engine_config (
  key text PRIMARY KEY,
  value numeric NOT NULL,
  description text
);

-- One static "next step" tip per trait, surfaced when that trait lands in
-- a session's growth areas.
CREATE TABLE IF NOT EXISTS v1_trait_tips (
  id bigserial PRIMARY KEY,
  trait_id smallint UNIQUE NOT NULL REFERENCES v1_traits(id) ON DELETE CASCADE,
  tip_text text NOT NULL
);

-- Per-session computed trait scores.
CREATE TABLE IF NOT EXISTS v1_session_trait_scores (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  trait_id smallint NOT NULL REFERENCES v1_traits(id),
  raw_score numeric NOT NULL,
  normalized_score smallint NOT NULL,
  item_count smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, trait_id)
);

CREATE INDEX IF NOT EXISTS idx_v1_session_trait_scores_session_id ON v1_session_trait_scores (session_id);

-- Per-session computed department fit scores.
CREATE TABLE IF NOT EXISTS v1_session_department_scores (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  department_id smallint NOT NULL REFERENCES v1_departments(id),
  fit_score smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_v1_session_department_scores_session_id ON v1_session_department_scores (session_id);

-- The final assembled report. A brand-new table (not the old
-- assessment_results) because the 7 historical rows there have a
-- structurally incompatible shape consumed directly by old report code --
-- this keeps that old code path completely unmodified, forever.
CREATE TABLE IF NOT EXISTS v1_assessment_results (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  overall_score smallint NOT NULL,
  band text NOT NULL,
  confidence_level text NOT NULL,
  validity_score smallint NOT NULL,
  straight_lining_flag boolean NOT NULL DEFAULT false,
  too_fast_flag boolean NOT NULL DEFAULT false,
  report_json jsonb NOT NULL,
  version int NOT NULL DEFAULT 1,
  engine_version text NOT NULL DEFAULT 'v1',
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, version)
);

CREATE INDEX IF NOT EXISTS idx_v1_assessment_results_session_id ON v1_assessment_results (session_id);
CREATE INDEX IF NOT EXISTS idx_v1_assessment_results_user_id ON v1_assessment_results (user_id);

COMMIT;

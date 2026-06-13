-- Personality archetypes and the content the recommendation engine pulls
-- from (career suggestions, learning roadmap, interview focus areas,
-- strengths/weaknesses). All admin-manageable, matched at scoring time
-- via the `condition` / `criteria` jsonb columns.

BEGIN;

CREATE TABLE IF NOT EXISTS personality_types (
  id bigserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS recommendations (
  id bigserial PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('career', 'learning', 'interview_focus', 'strength', 'weakness')),
  trait_id smallint REFERENCES traits(id),
  dimension_id smallint REFERENCES dimensions(id),
  personality_type_id bigint REFERENCES personality_types(id),
  condition jsonb NOT NULL DEFAULT '{}'::jsonb,
  title text NOT NULL,
  content text NOT NULL,
  priority int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations (type);
CREATE INDEX IF NOT EXISTS idx_personality_types_priority ON personality_types (priority);

COMMIT;

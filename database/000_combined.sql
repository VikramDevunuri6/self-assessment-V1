-- ==== migrations/0001_roles_and_user_roles.sql ====
-- Roles & RBAC: students vs admins, resolved by the backend at login time
-- to build the JWT payload {userId, role, email}.

BEGIN;

CREATE TABLE IF NOT EXISTS roles (
  id smallserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id smallint NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);

COMMIT;

-- ==== migrations/0002_categories_traits_dimensions.sql ====
-- Database-driven configuration for the scoring/formula engine:
-- categories (question groupings), traits (the 8 personality traits the
-- quiz measures), dimensions (Big Five / RIASEC), and the admin-editable
-- weight mapping between traits and dimensions.

BEGIN;

CREATE TABLE IF NOT EXISTS categories (
  id smallserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS traits (
  id smallserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS dimensions (
  id smallserial PRIMARY KEY,
  framework text NOT NULL CHECK (framework IN ('big_five', 'riasec')),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  UNIQUE (framework, code)
);

CREATE TABLE IF NOT EXISTS trait_dimension_weights (
  id bigserial PRIMARY KEY,
  trait_id smallint NOT NULL REFERENCES traits(id) ON DELETE CASCADE,
  dimension_id smallint NOT NULL REFERENCES dimensions(id) ON DELETE CASCADE,
  weight numeric NOT NULL,
  UNIQUE (trait_id, dimension_id)
);

COMMIT;

-- ==== migrations/0003_alter_questions_and_options.sql ====
-- Link the existing 49 questions / 196 options into the new DB-driven
-- scoring model. `trait` (text) and `group_no` columns are left in place
-- for now (unused by new code) so this migration is purely additive.

BEGIN;

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS category_id smallint REFERENCES categories(id),
  ADD COLUMN IF NOT EXISTS trait_id smallint REFERENCES traits(id);

ALTER TABLE question_options
  ADD COLUMN IF NOT EXISTS score numeric NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_questions_trait_id ON questions (trait_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions (category_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options (question_id);

COMMIT;

-- ==== migrations/0004_formulas.sql ====
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

-- ==== migrations/0005_personality_types_and_recommendations.sql ====
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

-- ==== migrations/0006_assessment_sessions_and_catalog.sql ====
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

-- ==== migrations/0007_answers_results_history.sql ====
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

-- ==== migrations/0008_admin_logs_analytics_cache_refresh_tokens.sql ====
-- Audit trail for admin mutations, a cache-aside table for the analytics
-- engine, and refresh-token storage for JWT rotation.

BEGIN;

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id bigserial PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs (created_at);

CREATE TABLE IF NOT EXISTS analytics_cache (
  id bigserial PRIMARY KEY,
  cache_key text UNIQUE NOT NULL,
  payload jsonb NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);

COMMIT;

-- ==== migrations/0009_add_profile_status.sql ====
-- Adds an account-status flag so Super Admins can disable/reactivate users
-- without deleting their profile or auth record.

BEGIN;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

COMMIT;

-- ==== migrations/0010_add_question_option_image_url.sql ====
-- Adds a nullable image_url column to question_options so This-or-That style
-- questions can store per-option (A/B) illustration URLs in Supabase Storage,
-- mirroring the existing questions.image_url column. Purely additive.

BEGIN;

ALTER TABLE question_options
  ADD COLUMN IF NOT EXISTS image_url text;

COMMIT;

-- ==== seeds/0001_roles.sql ====
INSERT INTO roles (code, name) VALUES
  ('student', 'Student'),
  ('admin', 'Administrator')
ON CONFLICT (code) DO NOTHING;

-- ==== seeds/0002_categories_traits_dimensions.sql ====
-- Categories mirror the 5 existing question groups (group_no 1-5), each a
-- mixed-trait scenario set. Admins can rename/reorganize later.
INSERT INTO categories (code, name, description) VALUES
  ('group_1', 'Section 1', 'Scenario-based questions, group 1 of 5'),
  ('group_2', 'Section 2', 'Scenario-based questions, group 2 of 5'),
  ('group_3', 'Section 3', 'Scenario-based questions, group 3 of 5'),
  ('group_4', 'Section 4', 'Scenario-based questions, group 4 of 5'),
  ('group_5', 'Section 5', 'Scenario-based questions, group 5 of 5')
ON CONFLICT (code) DO NOTHING;

-- The 8 trait codes already used by `questions.trait`.
INSERT INTO traits (code, name, description) VALUES
  ('social', 'Social Orientation', 'Preference for engaging with and drawing energy from other people.'),
  ('leadership', 'Leadership', 'Tendency to take initiative, organize others and drive outcomes.'),
  ('empathy', 'Empathy', 'Sensitivity to others'' feelings and perspectives.'),
  ('discipline', 'Discipline', 'Consistency, planning and follow-through on commitments.'),
  ('introspection', 'Introspection', 'Tendency to reflect on one''s own thoughts, motives and growth.'),
  ('creativity', 'Creativity', 'Openness to new ideas, originality and imaginative problem-solving.'),
  ('risk', 'Risk Appetite', 'Comfort with uncertainty, change and bold action.'),
  ('emotional_stability', 'Emotional Stability', 'Ability to stay calm and composed under pressure.')
ON CONFLICT (code) DO NOTHING;

-- Big Five (OCEAN) dimensions.
INSERT INTO dimensions (framework, code, name, description) VALUES
  ('big_five', 'O', 'Openness', 'Imagination, curiosity and willingness to try new things.'),
  ('big_five', 'C', 'Conscientiousness', 'Organization, dependability and goal-directed behaviour.'),
  ('big_five', 'E', 'Extraversion', 'Sociability, assertiveness and energy drawn from interaction.'),
  ('big_five', 'A', 'Agreeableness', 'Cooperativeness, warmth and consideration for others.'),
  ('big_five', 'N', 'Neuroticism', 'Tendency toward anxiety, moodiness and emotional volatility.')
ON CONFLICT (framework, code) DO NOTHING;

-- RIASEC (career interest / Holland Code) dimensions.
INSERT INTO dimensions (framework, code, name, description) VALUES
  ('riasec', 'R', 'Realistic', 'Hands-on, practical, mechanical or technical work.'),
  ('riasec', 'I', 'Investigative', 'Analytical, research-oriented, problem-solving work.'),
  ('riasec', 'A', 'Artistic', 'Creative, expressive, design-oriented work.'),
  ('riasec', 'S', 'Social', 'Helping, teaching, counselling or supporting others.'),
  ('riasec', 'E', 'Enterprising', 'Leading, persuading, managing or starting ventures.'),
  ('riasec', 'C', 'Conventional', 'Organized, detail-oriented, process-driven work.')
ON CONFLICT (framework, code) DO NOTHING;

-- ==== seeds/0003_trait_dimension_weights.sql ====
-- Admin-editable mapping from each trait's 0-100 score to the Big Five /
-- RIASEC dimensions. A negative weight means the dimension score uses
-- (100 - trait_score) for that contribution (inverse relationship) --
-- see formulaEngine "weighted_average_with_inversion".
INSERT INTO trait_dimension_weights (trait_id, dimension_id, weight)
SELECT t.id, d.id, w.weight
FROM (VALUES
  ('social',              'big_five', 'E',  1.0),
  ('social',              'riasec',   'S',  1.0),

  ('leadership',          'big_five', 'E',  0.6),
  ('leadership',          'big_five', 'C',  0.4),
  ('leadership',          'riasec',   'E',  1.0),

  ('empathy',             'big_five', 'A',  1.0),
  ('empathy',             'riasec',   'S',  0.6),

  ('discipline',          'big_five', 'C',  1.0),
  ('discipline',          'riasec',   'C',  0.6),

  ('introspection',       'big_five', 'O',  0.6),
  ('introspection',       'riasec',   'I',  0.8),

  ('creativity',          'big_five', 'O',  1.0),
  ('creativity',          'riasec',   'A',  1.0),

  ('risk',                'big_five', 'O',  0.4),
  ('risk',                'big_five', 'C', -0.4),
  ('risk',                'riasec',   'E',  0.6),

  ('emotional_stability', 'big_five', 'N', -1.0)
) AS w(trait_code, framework, dimension_code, weight)
JOIN traits t ON t.code = w.trait_code
JOIN dimensions d ON d.framework = w.framework AND d.code = w.dimension_code
ON CONFLICT (trait_id, dimension_id) DO UPDATE SET weight = EXCLUDED.weight;

-- ==== seeds/0004_backfill_questions.sql ====
-- Backfill the new normalized FKs on the 49 existing questions from their
-- legacy `trait` (text) and `group_no` (int) columns.
UPDATE questions q
SET trait_id = t.id
FROM traits t
WHERE q.trait = t.code
  AND q.trait_id IS NULL;

UPDATE questions q
SET category_id = c.id
FROM categories c
WHERE c.code = 'group_' || q.group_no::text
  AND q.category_id IS NULL;

-- ==== seeds/0005_option_scores.sql ====
-- Default scoring mapping for the 196 existing options: option_order 1-4
-- maps to a 0-100 raw score on a simple ascending scale. Fully
-- admin-editable afterwards via PUT /api/admin/questions/:id.
UPDATE question_options
SET score = CASE option_order
  WHEN 1 THEN 25
  WHEN 2 THEN 50
  WHEN 3 THEN 75
  WHEN 4 THEN 100
  ELSE score
END
WHERE score = 0;

-- ==== seeds/0006_formulas.sql ====
-- Seed the 3 versioned formulas the formulaEngine interprets at scoring
-- time. Admins publish new versions via PUT /api/admin/formulas/:id --
-- the engine always uses the row with is_current = true.
INSERT INTO formulas (code, name, description) VALUES
  ('trait_score', 'Trait Score', 'Aggregates selected option scores into a 0-100 score per trait.'),
  ('dimension_score', 'Dimension Score', 'Combines trait scores into Big Five / RIASEC dimension scores.'),
  ('confidence_score', 'Confidence Score', 'Estimates how distinct/consistent the response profile is.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO formula_versions (formula_id, version, definition, is_current)
SELECT f.id, 1, v.definition::jsonb, true
FROM (VALUES
  ('trait_score', '{"type":"average_normalized","scale":{"min":0,"max":100}}'),
  ('dimension_score', '{"type":"weighted_average_with_inversion","scale":{"min":0,"max":100}}'),
  ('confidence_score', '{"type":"variance_based","base":50,"factor":1.2,"scale":{"min":0,"max":100}}')
) AS v(code, definition)
JOIN formulas f ON f.code = v.code
ON CONFLICT (formula_id, version) DO NOTHING;

-- ==== seeds/0007_personality_types.sql ====
-- Archetypes matched against computed Big Five / RIASEC dimension scores
-- (0-100). Evaluated in `priority` order (ascending); the first archetype
-- whose `criteria` is satisfied wins. "The Explorer" has an empty
-- criteria list and acts as the catch-all fallback.
INSERT INTO personality_types (code, name, description, criteria, priority) VALUES
  ('strategist', 'The Strategist',
    'Combines big-picture thinking with disciplined execution -- plans ahead, weighs options carefully, and turns ideas into structured plans.',
    '{"all":[{"framework":"big_five","dimension":"C","min":65},{"framework":"big_five","dimension":"O","min":55}]}', 1),

  ('visionary', 'The Visionary',
    'Driven by curiosity and imagination -- constantly explores new ideas, perspectives and possibilities.',
    '{"all":[{"framework":"big_five","dimension":"O","min":70}]}', 2),

  ('connector', 'The Connector',
    'Thrives on people and relationships -- builds rapport easily and brings warmth and energy to groups.',
    '{"all":[{"framework":"big_five","dimension":"E","min":65},{"framework":"big_five","dimension":"A","min":60}]}', 3),

  ('catalyst', 'The Catalyst',
    'Energized by action and interaction -- initiates, motivates and keeps momentum going.',
    '{"all":[{"framework":"big_five","dimension":"E","min":65}]}', 4),

  ('analyst', 'The Analyst',
    'Drawn to deep investigation and problem-solving -- prefers evidence, data and logical reasoning.',
    '{"all":[{"framework":"riasec","dimension":"I","min":65}]}', 5),

  ('guardian', 'The Guardian',
    'Reliable and composed -- provides stability, structure and follow-through for the people around them.',
    '{"all":[{"framework":"big_five","dimension":"C","min":65},{"framework":"big_five","dimension":"N","max":40}]}', 6),

  ('harmonizer', 'The Harmonizer',
    'Empathetic and cooperative -- prioritizes others'' wellbeing and works to keep groups in balance.',
    '{"all":[{"framework":"big_five","dimension":"A","min":65}]}', 7),

  ('explorer', 'The Explorer',
    'A flexible, well-rounded profile that draws from multiple strengths depending on the situation.',
    '{"all":[]}', 8)
ON CONFLICT (code) DO NOTHING;

-- ==== seeds/0008_recommendations.sql ====
-- Recommendation content used by the resultEngine. `condition` is matched
-- against the computed report (trait scores, dimension scores or matched
-- personality type) at submit/regenerate time.

-- Per-trait strengths (score >= 70), weaknesses and learning actions (score <= 40).
INSERT INTO recommendations (type, trait_id, condition, title, content, priority)
SELECT v.type, t.id, jsonb_build_object('trait', v.trait_code, v.bound_key, v.bound_val), v.title, v.content, v.priority
FROM (VALUES
  ('social', 'strength', 'min', 70, 'Natural Connector',
    'You naturally energize and connect with the people around you, building rapport quickly in groups.', 10),
  ('social', 'weakness', 'max', 40, 'Prefers Smaller Settings',
    'Group settings can feel draining -- you may prefer one-on-one or smaller interactions.', 10),
  ('social', 'learning', 'max', 40, 'Build Social Confidence',
    'Practice initiating short conversations in low-stakes group settings to build comfort over time.', 10),

  ('leadership', 'strength', 'min', 70, 'Steps Up Naturally',
    'You step up readily, organize others, and take ownership of outcomes.', 10),
  ('leadership', 'weakness', 'max', 40, 'Lets Others Lead',
    'You tend to let others take charge, even when you have useful ideas to contribute.', 10),
  ('leadership', 'learning', 'max', 40, 'Build Leadership Reps',
    'Volunteer for a small coordination role, even informally, to build leadership experience in low-pressure settings.', 10),

  ('empathy', 'strength', 'min', 70, 'Reads the Room',
    'You pick up on how others are feeling and respond with genuine care and patience.', 10),
  ('empathy', 'weakness', 'max', 40, 'Task-First Focus',
    'You may focus on tasks or outcomes before considering how others are affected.', 10),
  ('empathy', 'learning', 'max', 40, 'Practice Perspective-Taking',
    'Before responding in a disagreement, try restating the other person''s point of view first.', 10),

  ('discipline', 'strength', 'min', 70, 'Follows Through',
    'You follow through on plans and commitments, even when motivation dips.', 10),
  ('discipline', 'weakness', 'max', 40, 'Routines Fade Quickly',
    'Plans and routines can fall apart once the initial excitement fades.', 10),
  ('discipline', 'learning', 'max', 40, 'Build a Tracking Habit',
    'Break goals into small daily actions and track them with a simple checklist for two weeks.', 10),

  ('introspection', 'strength', 'min', 70, 'Reflective Learner',
    'You regularly reflect on your choices and motivations, learning from experience.', 10),
  ('introspection', 'weakness', 'max', 40, 'Moves On Quickly',
    'You may move quickly from one thing to the next without pausing to reflect.', 10),
  ('introspection', 'learning', 'max', 40, 'Daily Reflection Habit',
    'Spend five minutes at the end of each day writing down one thing that went well and one thing you''d do differently.', 10),

  ('creativity', 'strength', 'min', 70, 'Original Thinker',
    'You generate original ideas and enjoy approaching problems from unconventional angles.', 10),
  ('creativity', 'weakness', 'max', 40, 'Sticks to the Familiar',
    'You may default to familiar, proven approaches rather than experimenting.', 10),
  ('creativity', 'learning', 'max', 40, 'Practice Creative Reps',
    'Pick one routine task each week and try solving it in a completely new way.', 10),

  ('risk', 'strength', 'min', 70, 'Comfortable with Uncertainty',
    'You''re comfortable with uncertainty and willing to act before everything is fully confirmed.', 10),
  ('risk', 'weakness', 'max', 40, 'Prefers the Familiar',
    'Uncertainty and change can feel uncomfortable, leading you to stick with the familiar.', 10),
  ('risk', 'learning', 'max', 40, 'Practice Small Bets',
    'Choose one small, low-stakes decision each week to make quickly, without over-researching it.', 10),

  ('emotional_stability', 'strength', 'min', 70, 'Stays Composed',
    'You stay composed under pressure and recover quickly from setbacks.', 10),
  ('emotional_stability', 'weakness', 'max', 40, 'Stress Affects Focus',
    'Stressful situations can affect your mood and focus more than you''d like.', 10),
  ('emotional_stability', 'learning', 'max', 40, 'Build a Calming Reset',
    'When you notice stress building, pause for two minutes of slow breathing before responding.', 10)
) AS v(trait_code, type, bound_key, bound_val, title, content, priority)
JOIN traits t ON t.code = v.trait_code;

-- Career suggestions per RIASEC dimension (score >= 55 on that dimension).
INSERT INTO recommendations (type, dimension_id, condition, title, content, priority)
SELECT 'career', d.id, jsonb_build_object('framework', 'riasec', 'dimension', v.riasec_code, 'min', 55), v.title, v.content, 10
FROM (VALUES
  ('R', 'Engineering & Technical Careers',
    'Roles in engineering, manufacturing, IT infrastructure or applied sciences suit your hands-on, practical strengths.'),
  ('I', 'Research & Analytics Careers',
    'Roles in data analysis, research, science or strategy let you dig deep into problems and find evidence-based answers.'),
  ('A', 'Design & Creative Careers',
    'Roles in design, content creation, media or product innovation give your original thinking room to grow.'),
  ('S', 'Education, Counselling & HR Careers',
    'Roles in teaching, counselling, HR or community work let you put your people-focused strengths to use.'),
  ('E', 'Business & Entrepreneurship Careers',
    'Roles in sales, business development, management or founding ventures suit your drive and persuasion.'),
  ('C', 'Operations & Finance Careers',
    'Roles in operations, finance, project coordination or administration suit your structured, detail-oriented approach.')
) AS v(riasec_code, title, content)
JOIN dimensions d ON d.framework = 'riasec' AND d.code = v.riasec_code;

-- Interview focus areas per matched personality archetype.
INSERT INTO recommendations (type, personality_type_id, condition, title, content, priority)
SELECT 'interview_focus', p.id, '{}'::jsonb, v.title, v.content, 10
FROM (VALUES
  ('strategist', 'Lead with Structure',
    'In interviews, lead with structured frameworks -- walk through how you break a problem down, weigh trade-offs, and plan execution.'),
  ('visionary', 'Showcase Original Thinking',
    'In interviews, highlight original ideas you''ve pursued and how you connect unrelated concepts to find new solutions.'),
  ('connector', 'Highlight Relationship Building',
    'In interviews, emphasize examples of building relationships, resolving conflicts, and rallying a group around a shared goal.'),
  ('catalyst', 'Demonstrate Initiative',
    'In interviews, share stories where you took initiative and kept a project moving when momentum stalled.'),
  ('analyst', 'Walk Through Your Reasoning',
    'In interviews, walk through your reasoning process for a complex problem -- the data you gathered, assumptions you tested, and conclusions you reached.'),
  ('guardian', 'Emphasize Reliability',
    'In interviews, highlight your reliability -- examples where you kept commitments and brought structure to ambiguous situations.'),
  ('harmonizer', 'Show Team Support',
    'In interviews, share examples of supporting teammates, mediating disagreements, and building consensus.'),
  ('explorer', 'Show Range and Adaptability',
    'In interviews, draw on a range of experiences -- you adapt your approach based on what each situation calls for.')
) AS v(personality_code, title, content)
JOIN personality_types p ON p.code = v.personality_code;

-- ==== seeds/0009_assessment_catalog.sql ====
-- Seed the single assessment definition for the existing 49-question quiz,
-- and make it the default for new sessions.
INSERT INTO assessments (code, title, description, version) VALUES
  ('personality_career_v1', 'Personality & Career Discovery', 'A 49-question scenario-based assessment covering 8 personality traits, mapped to Big Five and RIASEC career dimensions.', 1)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE assessment_sessions
  ALTER COLUMN assessment_id SET DEFAULT (SELECT id FROM assessments WHERE code = 'personality_career_v1');

UPDATE assessment_sessions
SET assessment_id = (SELECT id FROM assessments WHERE code = 'personality_career_v1')
WHERE assessment_id IS NULL;

-- ==== seeds/0010_extended_roles.sql ====
INSERT INTO roles (code, name) VALUES
  ('super_admin', 'Super Admin'),
  ('assessment_manager', 'Assessment Manager'),
  ('reviewer', 'Reviewer'),
  ('viewer', 'Viewer')
ON CONFLICT (code) DO NOTHING;


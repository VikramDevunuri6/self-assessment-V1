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

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

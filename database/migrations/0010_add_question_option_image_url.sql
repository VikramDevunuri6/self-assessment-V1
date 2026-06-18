-- Adds a nullable image_url column to question_options so This-or-That style
-- questions can store per-option (A/B) illustration URLs in Supabase Storage,
-- mirroring the existing questions.image_url column. Purely additive.

BEGIN;

ALTER TABLE question_options
  ADD COLUMN IF NOT EXISTS image_url text;

COMMIT;

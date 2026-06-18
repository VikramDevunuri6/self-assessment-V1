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

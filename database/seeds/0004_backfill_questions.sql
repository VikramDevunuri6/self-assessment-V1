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

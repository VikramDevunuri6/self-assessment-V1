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

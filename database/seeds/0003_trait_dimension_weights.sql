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

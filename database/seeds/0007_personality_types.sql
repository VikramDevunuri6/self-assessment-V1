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

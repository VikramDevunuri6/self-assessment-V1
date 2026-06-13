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

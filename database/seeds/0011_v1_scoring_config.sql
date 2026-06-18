-- Reference/config data for the v1 scoring engine. All admin-tunable
-- numbers (weights, thresholds, rule conditions) live here as rows, not
-- as constants in backend code -- see SCORING_FRAMEWORK_PROPOSAL.md for
-- the full rationale behind every trait/weight/rule below.

-- 13 scored traits.
INSERT INTO v1_traits (code, name, description, display_order) VALUES
  ('communication_social_confidence', 'Communication & Social Confidence', 'Comfort initiating and engaging socially, including under pressure.', 1),
  ('empathy_interpersonal_sensitivity', 'Empathy & Interpersonal Sensitivity', 'Noticing and responding to others'' needs/struggles, patience with others.', 2),
  ('discipline_time_management', 'Discipline & Time Management', 'Planning ahead, follow-through on commitments and goals.', 3),
  ('leadership_initiative', 'Leadership & Initiative', 'Stepping up, organizing others, taking ownership of group outcomes.', 4),
  ('resilience_emotional_stability', 'Resilience & Emotional Stability', 'Recovery from setbacks, handling criticism/failure without spiraling.', 5),
  ('curiosity_learning_agility', 'Curiosity & Learning Agility', 'Self-driven exploration of new topics/tools outside what''s required.', 6),
  ('growth_mindset', 'Growth Mindset', 'Belief that ability improves with effort; response to repeated failure.', 7),
  ('integrity_accountability', 'Integrity & Accountability', 'Honesty when unobserved; owning mistakes rather than deflecting.', 8),
  ('adaptability_change_readiness', 'Adaptability & Change Readiness', 'Comfort with sudden change, new tech, shifting circumstances.', 9),
  ('critical_thinking_problem_solving', 'Critical Thinking & Problem Solving', 'Root-cause analysis, evidence-based reasoning, verification habits.', 10),
  ('entrepreneurial_innovative_thinking', 'Entrepreneurial & Innovative Thinking', 'Bias toward building/improving things rather than leaving them as-is.', 11),
  ('risk_appetite', 'Risk Appetite', 'Willingness to choose uncertain-but-higher-upside paths.', 12),
  ('career_values_achievement_motivation', 'Career Values & Achievement Motivation', 'What "success" means to the person -- growth/impact vs. salary/security.', 13)
ON CONFLICT (code) DO NOTHING;

-- Trait <-> PDF question-number mapping (45 scoring items; group_no 40,41,42
-- are validity-only and intentionally absent here).
INSERT INTO v1_trait_questions (trait_id, group_no)
SELECT t.id, m.group_no
FROM (VALUES
  ('communication_social_confidence', 1), ('communication_social_confidence', 9), ('communication_social_confidence', 23), ('communication_social_confidence', 38),
  ('empathy_interpersonal_sensitivity', 3), ('empathy_interpersonal_sensitivity', 4), ('empathy_interpersonal_sensitivity', 18), ('empathy_interpersonal_sensitivity', 22), ('empathy_interpersonal_sensitivity', 27),
  ('discipline_time_management', 5), ('discipline_time_management', 6), ('discipline_time_management', 39),
  ('leadership_initiative', 2), ('leadership_initiative', 7), ('leadership_initiative', 16), ('leadership_initiative', 17), ('leadership_initiative', 48),
  ('resilience_emotional_stability', 8), ('resilience_emotional_stability', 20), ('resilience_emotional_stability', 21),
  ('curiosity_learning_agility', 10), ('curiosity_learning_agility', 11), ('curiosity_learning_agility', 12), ('curiosity_learning_agility', 15),
  ('growth_mindset', 13), ('growth_mindset', 14), ('growth_mindset', 37),
  ('integrity_accountability', 19), ('integrity_accountability', 45),
  ('adaptability_change_readiness', 24), ('adaptability_change_readiness', 25), ('adaptability_change_readiness', 31), ('adaptability_change_readiness', 36),
  ('critical_thinking_problem_solving', 26), ('critical_thinking_problem_solving', 28), ('critical_thinking_problem_solving', 34), ('critical_thinking_problem_solving', 43), ('critical_thinking_problem_solving', 44),
  ('entrepreneurial_innovative_thinking', 29), ('entrepreneurial_innovative_thinking', 30),
  ('risk_appetite', 35), ('risk_appetite', 46),
  ('career_values_achievement_motivation', 32), ('career_values_achievement_motivation', 33), ('career_values_achievement_motivation', 47)
) AS m(trait_code, group_no)
JOIN v1_traits t ON t.code = m.trait_code
ON CONFLICT (group_no) DO NOTHING;

-- Validity-only questions.
INSERT INTO v1_validity_questions (group_no) VALUES (40), (41), (42)
ON CONFLICT (group_no) DO NOTHING;

-- Overall-score bands.
INSERT INTO v1_score_bands (label, min_score, max_score, display_order) VALUES
  ('Exceptional', 85, 100, 1),
  ('Strong', 70, 84, 2),
  ('Developing', 50, 69, 3),
  ('Emerging', 0, 49, 4)
ON CONFLICT (label) DO NOTHING;

-- Departments.
INSERT INTO v1_departments (code, name, description, display_order) VALUES
  ('technology_engineering', 'Technology & Engineering', 'Building and maintaining technical systems.', 1),
  ('data_analytics', 'Data & Analytics', 'Finding patterns and insight in information.', 2),
  ('business_management', 'Business & Management', 'Leading people and driving outcomes.', 3),
  ('marketing_communication', 'Marketing & Communication', 'Shaping and spreading ideas to an audience.', 4),
  ('design_innovation', 'Design & Innovation', 'Creating and improving products and experiences.', 5),
  ('finance_operations', 'Finance & Operations', 'Structured, accountable execution.', 6),
  ('hr_people', 'HR & People', 'Supporting and developing people at work.', 7)
ON CONFLICT (code) DO NOTHING;

-- Department fit weights (placeholder v1 config, not statistically fitted
-- -- see SCORING_FRAMEWORK_PROPOSAL.md section 5).
INSERT INTO v1_department_trait_weights (department_id, trait_id, weight)
SELECT d.id, t.id, w.weight
FROM (VALUES
  ('technology_engineering', 'critical_thinking_problem_solving', 0.4),
  ('technology_engineering', 'discipline_time_management', 0.3),
  ('technology_engineering', 'adaptability_change_readiness', 0.3),

  ('data_analytics', 'critical_thinking_problem_solving', 0.5),
  ('data_analytics', 'curiosity_learning_agility', 0.3),
  ('data_analytics', 'discipline_time_management', 0.2),

  ('business_management', 'leadership_initiative', 0.4),
  ('business_management', 'communication_social_confidence', 0.3),
  ('business_management', 'career_values_achievement_motivation', 0.3),

  ('marketing_communication', 'communication_social_confidence', 0.4),
  ('marketing_communication', 'curiosity_learning_agility', 0.3),
  ('marketing_communication', 'entrepreneurial_innovative_thinking', 0.3),

  ('design_innovation', 'entrepreneurial_innovative_thinking', 0.4),
  ('design_innovation', 'curiosity_learning_agility', 0.3),
  ('design_innovation', 'adaptability_change_readiness', 0.3),

  ('finance_operations', 'discipline_time_management', 0.4),
  ('finance_operations', 'critical_thinking_problem_solving', 0.3),
  ('finance_operations', 'integrity_accountability', 0.3),

  ('hr_people', 'empathy_interpersonal_sensitivity', 0.5),
  ('hr_people', 'communication_social_confidence', 0.3),
  ('hr_people', 'leadership_initiative', 0.2)
) AS w(department_code, trait_code, weight)
JOIN v1_departments d ON d.code = w.department_code
JOIN v1_traits t ON t.code = w.trait_code
ON CONFLICT (department_id, trait_id) DO UPDATE SET weight = EXCLUDED.weight;

-- Engine-wide tunable thresholds.
INSERT INTO v1_engine_config (key, value, description) VALUES
  ('high_threshold', 70, 'Normalized trait score (0-100) at or above which a trait counts as "High" for career-signal matching.'),
  ('low_threshold', 40, 'Normalized trait score (0-100) at or below which a trait counts as "Low" for career-signal matching.'),
  ('balanced_spread_threshold', 10, 'If the spread between a session''s highest and lowest trait score is at or below this value, the profile is reported as balanced rather than dominated by a single trait.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Career-signal rules. conditions = AND of {traitCode, operator}.
INSERT INTO v1_career_signal_rules (label, rationale, conditions, priority) VALUES
  ('Research & Analytical Careers', 'You investigate deeply and reason from evidence -- a strong fit for research, data, or analytical roles.',
    '[{"traitCode":"critical_thinking_problem_solving","operator":"high"},{"traitCode":"curiosity_learning_agility","operator":"high"}]', 10),
  ('People & Leadership Careers', 'You''re comfortable directing and persuading groups -- a strong fit for management and people-leadership roles.',
    '[{"traitCode":"leadership_initiative","operator":"high"},{"traitCode":"communication_social_confidence","operator":"high"}]', 10),
  ('Builder / Founder Track', 'You act on ideas despite uncertainty -- a strong fit for entrepreneurship or early-stage product building.',
    '[{"traitCode":"entrepreneurial_innovative_thinking","operator":"high"},{"traitCode":"risk_appetite","operator":"high"}]', 10),
  ('People-Support Careers', 'You read and respond well to others'' emotional state -- a strong fit for HR, teaching, or counselling roles.',
    '[{"traitCode":"empathy_interpersonal_sensitivity","operator":"high"},{"traitCode":"communication_social_confidence","operator":"high"}]', 10),
  ('Structured / Operational Careers', 'You''re reliable, rule-following, and low-drift in execution -- a strong fit for finance, quality, or compliance roles.',
    '[{"traitCode":"discipline_time_management","operator":"high"},{"traitCode":"integrity_accountability","operator":"high"}]', 10),
  ('Fast-Change Environments', 'You treat disruption as routine, not a threat -- a strong fit for startups, consulting, or fast-moving tech roles.',
    '[{"traitCode":"adaptability_change_readiness","operator":"high"},{"traitCode":"growth_mindset","operator":"high"}]', 10),
  ('Innovation / Product Roles', 'You combine idea generation with active exploration -- a strong fit for design or product innovation roles.',
    '[{"traitCode":"entrepreneurial_innovative_thinking","operator":"high"},{"traitCode":"curiosity_learning_agility","operator":"high"}]', 10),
  ('Stability-Oriented Roles', 'You optimize for predictability over upside -- a strong fit for roles that reward consistency and security over constant change.',
    '[{"traitCode":"career_values_achievement_motivation","operator":"low"},{"traitCode":"risk_appetite","operator":"low"}]', 10)
ON CONFLICT DO NOTHING;

-- One static "next step" tip per trait, shown when that trait is a growth area.
INSERT INTO v1_trait_tips (trait_id, tip_text)
SELECT t.id, v.tip
FROM (VALUES
  ('communication_social_confidence', 'Practice initiating short conversations in low-stakes group settings to build comfort over time.'),
  ('empathy_interpersonal_sensitivity', 'Before responding in a disagreement, try restating the other person''s point of view first.'),
  ('discipline_time_management', 'Break goals into small daily actions and track them with a simple checklist for two weeks.'),
  ('leadership_initiative', 'Volunteer for a small coordination role, even informally, to build leadership experience in low-pressure settings.'),
  ('resilience_emotional_stability', 'When you notice stress building, pause for two minutes of slow breathing before responding.'),
  ('curiosity_learning_agility', 'Pick one topic outside your coursework each week and spend 20 minutes exploring it, just out of interest.'),
  ('growth_mindset', 'When something doesn''t go well, write down one specific thing you''d try differently next time, instead of labeling the result a success or failure.'),
  ('integrity_accountability', 'When you make a mistake, practice naming it out loud to someone before they notice it themselves.'),
  ('adaptability_change_readiness', 'The next time a plan changes on you, list what''s still possible before deciding how you feel about it.'),
  ('critical_thinking_problem_solving', 'Before accepting the first explanation for a problem, ask "what else could explain this?" at least once.'),
  ('entrepreneurial_innovative_thinking', 'Pick one small, recurring annoyance in your routine and try building or proposing a fix for it this week.'),
  ('risk_appetite', 'Choose one low-stakes decision this week and make it quickly, without over-researching it.'),
  ('career_values_achievement_motivation', 'Write down what "a good week of work" would actually feel like to you, separate from salary or title.')
) AS v(trait_code, tip)
JOIN v1_traits t ON t.code = v.trait_code
ON CONFLICT (trait_id) DO UPDATE SET tip_text = EXCLUDED.tip_text;

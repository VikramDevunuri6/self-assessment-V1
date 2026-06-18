-- Recommendation content used by the resultEngine. `condition` is matched
-- against the computed report (trait scores, dimension scores or matched
-- personality type) at submit/regenerate time.

-- Per-trait strengths (score >= 70), weaknesses and learning actions (score <= 40).
INSERT INTO recommendations (type, trait_id, condition, title, content, priority)
SELECT v.type, t.id, jsonb_build_object('trait', v.trait_code, v.bound_key, v.bound_val), v.title, v.content, v.priority
FROM (VALUES
  ('social', 'strength', 'min', 70, 'Natural Connector',
    'You naturally energize and connect with the people around you, building rapport quickly in groups.', 10),
  ('social', 'weakness', 'max', 40, 'Prefers Smaller Settings',
    'Group settings can feel draining -- you may prefer one-on-one or smaller interactions.', 10),
  ('social', 'learning', 'max', 40, 'Build Social Confidence',
    'Practice initiating short conversations in low-stakes group settings to build comfort over time.', 10),

  ('leadership', 'strength', 'min', 70, 'Steps Up Naturally',
    'You step up readily, organize others, and take ownership of outcomes.', 10),
  ('leadership', 'weakness', 'max', 40, 'Lets Others Lead',
    'You tend to let others take charge, even when you have useful ideas to contribute.', 10),
  ('leadership', 'learning', 'max', 40, 'Build Leadership Reps',
    'Volunteer for a small coordination role, even informally, to build leadership experience in low-pressure settings.', 10),

  ('empathy', 'strength', 'min', 70, 'Reads the Room',
    'You pick up on how others are feeling and respond with genuine care and patience.', 10),
  ('empathy', 'weakness', 'max', 40, 'Task-First Focus',
    'You may focus on tasks or outcomes before considering how others are affected.', 10),
  ('empathy', 'learning', 'max', 40, 'Practice Perspective-Taking',
    'Before responding in a disagreement, try restating the other person''s point of view first.', 10),

  ('discipline', 'strength', 'min', 70, 'Follows Through',
    'You follow through on plans and commitments, even when motivation dips.', 10),
  ('discipline', 'weakness', 'max', 40, 'Routines Fade Quickly',
    'Plans and routines can fall apart once the initial excitement fades.', 10),
  ('discipline', 'learning', 'max', 40, 'Build a Tracking Habit',
    'Break goals into small daily actions and track them with a simple checklist for two weeks.', 10),

  ('introspection', 'strength', 'min', 70, 'Reflective Learner',
    'You regularly reflect on your choices and motivations, learning from experience.', 10),
  ('introspection', 'weakness', 'max', 40, 'Moves On Quickly',
    'You may move quickly from one thing to the next without pausing to reflect.', 10),
  ('introspection', 'learning', 'max', 40, 'Daily Reflection Habit',
    'Spend five minutes at the end of each day writing down one thing that went well and one thing you''d do differently.', 10),

  ('creativity', 'strength', 'min', 70, 'Original Thinker',
    'You generate original ideas and enjoy approaching problems from unconventional angles.', 10),
  ('creativity', 'weakness', 'max', 40, 'Sticks to the Familiar',
    'You may default to familiar, proven approaches rather than experimenting.', 10),
  ('creativity', 'learning', 'max', 40, 'Practice Creative Reps',
    'Pick one routine task each week and try solving it in a completely new way.', 10),

  ('risk', 'strength', 'min', 70, 'Comfortable with Uncertainty',
    'You''re comfortable with uncertainty and willing to act before everything is fully confirmed.', 10),
  ('risk', 'weakness', 'max', 40, 'Prefers the Familiar',
    'Uncertainty and change can feel uncomfortable, leading you to stick with the familiar.', 10),
  ('risk', 'learning', 'max', 40, 'Practice Small Bets',
    'Choose one small, low-stakes decision each week to make quickly, without over-researching it.', 10),

  ('emotional_stability', 'strength', 'min', 70, 'Stays Composed',
    'You stay composed under pressure and recover quickly from setbacks.', 10),
  ('emotional_stability', 'weakness', 'max', 40, 'Stress Affects Focus',
    'Stressful situations can affect your mood and focus more than you''d like.', 10),
  ('emotional_stability', 'learning', 'max', 40, 'Build a Calming Reset',
    'When you notice stress building, pause for two minutes of slow breathing before responding.', 10)
) AS v(trait_code, type, bound_key, bound_val, title, content, priority)
JOIN traits t ON t.code = v.trait_code;

-- Career suggestions per RIASEC dimension (score >= 55 on that dimension).
INSERT INTO recommendations (type, dimension_id, condition, title, content, priority)
SELECT 'career', d.id, jsonb_build_object('framework', 'riasec', 'dimension', v.riasec_code, 'min', 55), v.title, v.content, 10
FROM (VALUES
  ('R', 'Engineering & Technical Careers',
    'Roles in engineering, manufacturing, IT infrastructure or applied sciences suit your hands-on, practical strengths.'),
  ('I', 'Research & Analytics Careers',
    'Roles in data analysis, research, science or strategy let you dig deep into problems and find evidence-based answers.'),
  ('A', 'Design & Creative Careers',
    'Roles in design, content creation, media or product innovation give your original thinking room to grow.'),
  ('S', 'Education, Counselling & HR Careers',
    'Roles in teaching, counselling, HR or community work let you put your people-focused strengths to use.'),
  ('E', 'Business & Entrepreneurship Careers',
    'Roles in sales, business development, management or founding ventures suit your drive and persuasion.'),
  ('C', 'Operations & Finance Careers',
    'Roles in operations, finance, project coordination or administration suit your structured, detail-oriented approach.')
) AS v(riasec_code, title, content)
JOIN dimensions d ON d.framework = 'riasec' AND d.code = v.riasec_code;

-- Interview focus areas per matched personality archetype.
INSERT INTO recommendations (type, personality_type_id, condition, title, content, priority)
SELECT 'interview_focus', p.id, '{}'::jsonb, v.title, v.content, 10
FROM (VALUES
  ('strategist', 'Lead with Structure',
    'In interviews, lead with structured frameworks -- walk through how you break a problem down, weigh trade-offs, and plan execution.'),
  ('visionary', 'Showcase Original Thinking',
    'In interviews, highlight original ideas you''ve pursued and how you connect unrelated concepts to find new solutions.'),
  ('connector', 'Highlight Relationship Building',
    'In interviews, emphasize examples of building relationships, resolving conflicts, and rallying a group around a shared goal.'),
  ('catalyst', 'Demonstrate Initiative',
    'In interviews, share stories where you took initiative and kept a project moving when momentum stalled.'),
  ('analyst', 'Walk Through Your Reasoning',
    'In interviews, walk through your reasoning process for a complex problem -- the data you gathered, assumptions you tested, and conclusions you reached.'),
  ('guardian', 'Emphasize Reliability',
    'In interviews, highlight your reliability -- examples where you kept commitments and brought structure to ambiguous situations.'),
  ('harmonizer', 'Show Team Support',
    'In interviews, share examples of supporting teammates, mediating disagreements, and building consensus.'),
  ('explorer', 'Show Range and Adaptability',
    'In interviews, draw on a range of experiences -- you adapt your approach based on what each situation calls for.')
) AS v(personality_code, title, content)
JOIN personality_types p ON p.code = v.personality_code;

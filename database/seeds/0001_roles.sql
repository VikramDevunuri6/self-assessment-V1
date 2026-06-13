INSERT INTO roles (code, name) VALUES
  ('student', 'Student'),
  ('admin', 'Administrator')
ON CONFLICT (code) DO NOTHING;

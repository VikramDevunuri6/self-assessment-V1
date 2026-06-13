INSERT INTO roles (code, name) VALUES
  ('super_admin', 'Super Admin'),
  ('assessment_manager', 'Assessment Manager'),
  ('reviewer', 'Reviewer'),
  ('viewer', 'Viewer')
ON CONFLICT (code) DO NOTHING;

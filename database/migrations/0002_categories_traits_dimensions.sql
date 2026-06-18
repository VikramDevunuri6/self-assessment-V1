-- Database-driven configuration for the scoring/formula engine:
-- categories (question groupings), traits (the 8 personality traits the
-- quiz measures), dimensions (Big Five / RIASEC), and the admin-editable
-- weight mapping between traits and dimensions.

BEGIN;

CREATE TABLE IF NOT EXISTS categories (
  id smallserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS traits (
  id smallserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS dimensions (
  id smallserial PRIMARY KEY,
  framework text NOT NULL CHECK (framework IN ('big_five', 'riasec')),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  UNIQUE (framework, code)
);

CREATE TABLE IF NOT EXISTS trait_dimension_weights (
  id bigserial PRIMARY KEY,
  trait_id smallint NOT NULL REFERENCES traits(id) ON DELETE CASCADE,
  dimension_id smallint NOT NULL REFERENCES dimensions(id) ON DELETE CASCADE,
  weight numeric NOT NULL,
  UNIQUE (trait_id, dimension_id)
);

COMMIT;

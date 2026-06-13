-- Adds an account-status flag so Super Admins can disable/reactivate users
-- without deleting their profile or auth record.

BEGIN;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

COMMIT;

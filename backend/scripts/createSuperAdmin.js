/**
 * Creates the first Super Admin account. There is no UI or API for this --
 * it must be run once during initial setup:
 *
 *   SUPER_ADMIN_EMAIL=admin@platform.com \
 *   SUPER_ADMIN_PASSWORD=ChangeMe123! \
 *   SUPER_ADMIN_NAME="Super Admin" \
 *   node backend/scripts/createSuperAdmin.js
 *
 * Idempotent: if a profile with this email already exists, it is just
 * (re)assigned the super_admin role instead of erroring.
 */
require("dotenv").config();

const supabase = require("../src/config/supabaseClient");
const authRepository = require("../src/repositories/authRepository");
const profileRepository = require("../src/repositories/profileRepository");
const roleRepository = require("../src/repositories/roleRepository");
const { ROLES } = require("../src/constants/roles");

async function findProfileByEmail(email) {
  const { data, error } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const fullName = process.env.SUPER_ADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set.");
    process.exit(1);
  }

  let profile = await findProfileByEmail(email);

  if (!profile) {
    const authUser = await authRepository.createUserWithPassword(email, password);
    profile = await profileRepository.createProfile({
      id: authUser.id,
      full_name: fullName,
      email,
    });
    console.log(`Created auth user + profile for ${email}`);
  } else {
    console.log(`Profile for ${email} already exists -- assigning super_admin role`);
  }

  await roleRepository.setUserRole(profile.id, ROLES.SUPER_ADMIN);
  console.log(`${email} is now a super_admin.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

const supabase = require("../config/supabaseClient");

async function signup({
  fullName,
  phoneNumber,
  email,
  rollNumber,
  branch,
  passingYear,
  password,
}) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  const user = authData.user;

  if (!user) {
    throw new Error("User not created");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        id: user.id,
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        roll_number: rollNumber,
        branch,
        passing_year: Number(passingYear),
      },
    ])
    .select()
    .single();

  if (profileError) throw profileError;

  return { user, profile };
}

async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data.user;
}

async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
}

module.exports = { signup, login, getProfile };

const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");
const { ROLES, ROLE_PRIORITY } = require("../constants/roles");
const { signAccessToken, generateRefreshToken, hashToken, getRefreshTokenExpiry } = require("../utils/tokens");

const authRepository = require("../repositories/authRepository");
const profileRepository = require("../repositories/profileRepository");
const roleRepository = require("../repositories/roleRepository");
const refreshTokenRepository = require("../repositories/refreshTokenRepository");

function resolvePrimaryRole(roles) {
  const codes = roles.map((role) => role.code);
  for (const role of ROLE_PRIORITY) {
    if (codes.includes(role)) return role;
  }
  throw new AppError(403, "User has no assigned role", ERROR_CODES.FORBIDDEN);
}

async function issueTokens({ id, email }, role) {
  const accessToken = signAccessToken({ userId: id, role, email });
  const { token: refreshToken, tokenHash } = generateRefreshToken();

  await refreshTokenRepository.create({
    userId: id,
    tokenHash,
    expiresAt: getRefreshTokenExpiry(),
  });

  return { accessToken, refreshToken };
}

async function signup({ fullName, phoneNumber, email, rollNumber, branch, passingYear, password }) {
  const authUser = await authRepository.signUpWithPassword(email, password);

  const profile = await profileRepository.createProfile({
    id: authUser.id,
    full_name: fullName,
    email,
    phone_number: phoneNumber,
    roll_number: rollNumber,
    branch,
    passing_year: Number(passingYear),
  });

  const studentRole = await roleRepository.getRoleByCode(ROLES.STUDENT);
  await roleRepository.assignRole(authUser.id, studentRole.id);

  const tokens = await issueTokens(authUser, ROLES.STUDENT);

  return { profile, role: ROLES.STUDENT, ...tokens };
}

async function login({ email, password }) {
  const authUser = await authRepository.signInWithPassword(email, password);
  const profile = await profileRepository.getProfileById(authUser.id);

  if (profile.is_active === false) {
    throw new AppError(403, "This account has been disabled", ERROR_CODES.FORBIDDEN);
  }

  const roles = await roleRepository.getRolesForUser(authUser.id);
  const role = resolvePrimaryRole(roles);

  const tokens = await issueTokens(authUser, role);

  return { userId: authUser.id, email: authUser.email, role, ...tokens };
}

async function refresh(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const stored = await refreshTokenRepository.findActiveByHash(tokenHash);

  if (!stored) {
    throw new AppError(401, "Invalid or expired refresh token", ERROR_CODES.UNAUTHORIZED);
  }

  await refreshTokenRepository.revoke(stored.id);

  const profile = await profileRepository.getProfileById(stored.user_id);

  if (profile.is_active === false) {
    throw new AppError(403, "This account has been disabled", ERROR_CODES.FORBIDDEN);
  }

  const roles = await roleRepository.getRolesForUser(stored.user_id);
  const role = resolvePrimaryRole(roles);

  return issueTokens({ id: stored.user_id, email: profile.email }, role);
}

async function logout(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const stored = await refreshTokenRepository.findActiveByHash(tokenHash);

  if (stored) {
    await refreshTokenRepository.revoke(stored.id);
  }
}

async function getProfile(userId) {
  const profile = await profileRepository.getProfileById(userId);
  const roles = await roleRepository.getRolesForUser(userId);
  const role = resolvePrimaryRole(roles);

  return { ...profile, role };
}

module.exports = { signup, login, refresh, logout, getProfile };

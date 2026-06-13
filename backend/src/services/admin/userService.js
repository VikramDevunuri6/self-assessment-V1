const AppError = require("../../utils/AppError");
const { ERROR_CODES } = require("../../constants/errorCodes");
const { ROLES, STAFF_ASSIGNABLE_ROLES } = require("../../constants/roles");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");

const authRepository = require("../../repositories/authRepository");
const profileRepository = require("../../repositories/profileRepository");
const roleRepository = require("../../repositories/roleRepository");

function toUserDto(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
  };
}

function assertNotSelf(actingUserId, targetUserId) {
  if (actingUserId === targetUserId) {
    throw new AppError(400, "You cannot perform this action on your own account", ERROR_CODES.VALIDATION_ERROR);
  }
}

async function assertNotSuperAdmin(targetUserId) {
  const roles = await roleRepository.getRolesForUser(targetUserId);
  if (roles.some((role) => role.code === ROLES.SUPER_ADMIN)) {
    throw new AppError(403, "Super Admin accounts cannot be modified", ERROR_CODES.FORBIDDEN);
  }
}

async function listUsers(query) {
  const pagination = parsePagination(query);
  const { data, count } = await profileRepository.listAllUsers({ ...pagination, search: query.search });

  return { users: data.map(toUserDto), pagination: buildPaginationMeta(pagination, count) };
}

/**
 * Creates a new staff account (Admin, Assessment Manager, Reviewer, or
 * Viewer). Only callable by a Super Admin -- enforced by the route's
 * MANAGE_USERS permission gate. Role is restricted to STAFF_ASSIGNABLE_ROLES
 * by the request schema.
 */
async function createAdmin({ fullName, email, password, role }) {
  if (!STAFF_ASSIGNABLE_ROLES.includes(role)) {
    throw new AppError(403, "Role is not assignable", ERROR_CODES.FORBIDDEN);
  }

  const authUser = await authRepository.createUserWithPassword(email, password);

  const profile = await profileRepository.createProfile({
    id: authUser.id,
    full_name: fullName,
    email,
  });

  await roleRepository.setUserRole(authUser.id, role);

  return toUserDto({ ...profile, role });
}

async function changeRole(actingUserId, targetUserId, role) {
  assertNotSelf(actingUserId, targetUserId);
  await assertNotSuperAdmin(targetUserId);

  const profile = await profileRepository.getProfileById(targetUserId);
  await roleRepository.setUserRole(targetUserId, role);

  return toUserDto({ ...profile, role });
}

async function setStatus(actingUserId, targetUserId, isActive) {
  assertNotSelf(actingUserId, targetUserId);
  await assertNotSuperAdmin(targetUserId);

  const profile = await profileRepository.setActive(targetUserId, isActive);
  const roles = await roleRepository.getRolesForUser(targetUserId);

  return toUserDto({ ...profile, role: roles[0]?.code ?? null });
}

async function deleteUser(actingUserId, targetUserId) {
  assertNotSelf(actingUserId, targetUserId);
  await assertNotSuperAdmin(targetUserId);

  await profileRepository.getProfileById(targetUserId);
  await profileRepository.deleteProfile(targetUserId);
  await authRepository.deleteAuthUser(targetUserId);
}

module.exports = { listUsers, createAdmin, changeRole, setStatus, deleteUser };

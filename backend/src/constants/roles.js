const ROLES = Object.freeze({
  STUDENT: "student",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  ASSESSMENT_MANAGER: "assessment_manager",
  REVIEWER: "reviewer",
  VIEWER: "viewer",
});

// Any role other than student is considered "staff" and may access /api/admin.
const ADMIN_PORTAL_ROLES = Object.freeze([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ASSESSMENT_MANAGER,
  ROLES.REVIEWER,
  ROLES.VIEWER,
]);

// Order in which roles are considered when a user has multiple role
// assignments -- the first match wins.
const ROLE_PRIORITY = Object.freeze([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ASSESSMENT_MANAGER,
  ROLES.REVIEWER,
  ROLES.VIEWER,
  ROLES.STUDENT,
]);

// Roles a Super Admin can assign when creating a new staff account.
const STAFF_ASSIGNABLE_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.ASSESSMENT_MANAGER,
  ROLES.REVIEWER,
  ROLES.VIEWER,
]);

// Roles a Super Admin can assign via the role-change endpoint.
// super_admin is intentionally excluded -- never assignable through the API.
const ASSIGNABLE_ROLES = Object.freeze([...STAFF_ASSIGNABLE_ROLES, ROLES.STUDENT]);

module.exports = { ROLES, ADMIN_PORTAL_ROLES, ROLE_PRIORITY, STAFF_ASSIGNABLE_ROLES, ASSIGNABLE_ROLES };

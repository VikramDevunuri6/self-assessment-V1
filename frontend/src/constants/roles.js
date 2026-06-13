export const ROLES = Object.freeze({
  STUDENT: "student",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  ASSESSMENT_MANAGER: "assessment_manager",
  REVIEWER: "reviewer",
  VIEWER: "viewer",
});

// Any role other than student is considered "staff" and may access /admin.
export const ADMIN_PORTAL_ROLES = Object.freeze([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.ASSESSMENT_MANAGER,
  ROLES.REVIEWER,
  ROLES.VIEWER,
]);

// Roles a Super Admin can assign when creating a new staff account.
export const STAFF_ASSIGNABLE_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.ASSESSMENT_MANAGER,
  ROLES.REVIEWER,
  ROLES.VIEWER,
]);

// Roles a Super Admin can assign via the role-change endpoint.
export const ASSIGNABLE_ROLES = Object.freeze([...STAFF_ASSIGNABLE_ROLES, ROLES.STUDENT]);

export const ROLE_LABELS = Object.freeze({
  [ROLES.STUDENT]: "Student",
  [ROLES.ADMIN]: "Administrator",
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ASSESSMENT_MANAGER]: "Assessment Manager",
  [ROLES.REVIEWER]: "Reviewer",
  [ROLES.VIEWER]: "Viewer",
});

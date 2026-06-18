const express = require("express");
const { z } = require("zod");
const router = express.Router();

const userController = require("../../controllers/admin/userController");
const { validate } = require("../../middleware/validationMiddleware");
const { auditLog } = require("../../middleware/auditLogMiddleware");
const { STAFF_ASSIGNABLE_ROLES, ASSIGNABLE_ROLES } = require("../../constants/roles");

const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

const createAdminSchema = z.object({
  body: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(STAFF_ASSIGNABLE_ROLES),
  }),
});

const roleSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    role: z.enum(ASSIGNABLE_ROLES),
  }),
});

router.get("/", userController.listUsers);
router.post("/", validate(createAdminSchema), auditLog("admin_created", "user"), userController.createAdmin);
router.put("/:id/role", validate(roleSchema), auditLog("role_changed", "user"), userController.changeRole);
router.post(
  "/:id/disable",
  validate(idParamSchema),
  auditLog("user_disabled", "user"),
  userController.disableUser
);
router.post(
  "/:id/enable",
  validate(idParamSchema),
  auditLog("user_enabled", "user"),
  userController.enableUser
);
router.delete("/:id", validate(idParamSchema), auditLog("admin_deleted", "user"), userController.deleteUser);

module.exports = router;

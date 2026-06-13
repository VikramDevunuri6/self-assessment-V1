const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const { ADMIN_PORTAL_ROLES } = require("../constants/roles");
const { PERMISSIONS } = require("../constants/permissions");

const userRoutes = require("./admin/userRoutes");
const studentRoutes = require("./admin/studentRoutes");
const sessionRoutes = require("./admin/sessionRoutes");
const reportRoutes = require("./admin/reportRoutes");
const questionRoutes = require("./admin/questionRoutes");
const categoryRoutes = require("./admin/categoryRoutes");
const traitRoutes = require("./admin/traitRoutes");
const weightRoutes = require("./admin/weightRoutes");
const formulaRoutes = require("./admin/formulaRoutes");
const recommendationRoutes = require("./admin/recommendationRoutes");
const personalityTypeRoutes = require("./admin/personalityTypeRoutes");
const exportRoutes = require("./admin/exportRoutes");
const auditLogRoutes = require("./admin/auditLogRoutes");
const analyticsRoutes = require("./admin/analyticsRoutes");

router.use(authMiddleware, requireRole(...ADMIN_PORTAL_ROLES));

router.use("/users", requirePermission(PERMISSIONS.MANAGE_USERS), userRoutes);
router.use("/students", requirePermission(PERMISSIONS.VIEW_USERS), studentRoutes);
router.use("/sessions", requirePermission(PERMISSIONS.VIEW_RESULTS), sessionRoutes);
router.use("/reports", requirePermission(PERMISSIONS.VIEW_RESULTS), reportRoutes);
router.use("/questions", requirePermission(PERMISSIONS.VIEW_RESULTS), questionRoutes);
router.use("/categories", requirePermission(PERMISSIONS.VIEW_RESULTS), categoryRoutes);
router.use("/traits", requirePermission(PERMISSIONS.VIEW_RESULTS), traitRoutes);
router.use("/trait-dimension-weights", requirePermission(PERMISSIONS.VIEW_RESULTS), weightRoutes);
router.use("/formulas", requirePermission(PERMISSIONS.VIEW_FORMULAS), formulaRoutes);
router.use("/recommendations", requirePermission(PERMISSIONS.VIEW_RESULTS), recommendationRoutes);
router.use("/personality-types", requirePermission(PERMISSIONS.VIEW_RESULTS), personalityTypeRoutes);
router.use("/export", requirePermission(PERMISSIONS.VIEW_ANALYTICS), exportRoutes);
router.use("/audit-logs", requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS), auditLogRoutes);
router.use("/analytics", requirePermission(PERMISSIONS.VIEW_ANALYTICS), analyticsRoutes);

module.exports = router;

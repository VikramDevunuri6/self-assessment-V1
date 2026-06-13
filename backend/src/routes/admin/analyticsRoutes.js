const express = require("express");
const { z } = require("zod");
const router = express.Router();

const analyticsController = require("../../controllers/admin/analyticsController");
const { validate } = require("../../middleware/validationMiddleware");

const trendQuerySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().positive().max(90).optional(),
  }),
});

router.get("/overview", analyticsController.getOverview);
router.get("/traits", analyticsController.getTraitAverages);
router.get("/personality-distribution", analyticsController.getPersonalityDistribution);
router.get("/career-distribution", analyticsController.getCareerDistribution);
router.get("/active-users", validate(trendQuerySchema), analyticsController.getActiveUsers);
router.get("/trends", validate(trendQuerySchema), analyticsController.getTrends);
router.get("/funnel", analyticsController.getFunnel);

module.exports = router;

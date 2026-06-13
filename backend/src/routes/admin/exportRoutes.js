const express = require("express");
const { z } = require("zod");
const router = express.Router();

const exportController = require("../../controllers/admin/exportController");
const { validate } = require("../../middleware/validationMiddleware");

const exportQuerySchema = z.object({
  query: z.object({
    resource: z.enum(["sessions", "results"]).optional(),
    format: z.enum(["json", "csv"]).optional(),
  }),
});

router.get("/", validate(exportQuerySchema), exportController.exportData);

module.exports = router;

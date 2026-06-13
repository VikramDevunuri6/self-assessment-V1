const express = require("express");
const { z } = require("zod");
const router = express.Router();

const studentController = require("../../controllers/admin/studentController");
const { validate } = require("../../middleware/validationMiddleware");

const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid("id must be a valid UUID") }),
});

router.get("/", studentController.listStudents);
router.get("/:id", validate(idParamSchema), studentController.getStudent);

module.exports = router;

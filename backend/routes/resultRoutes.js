const express = require("express");
const router = express.Router();

const { getResults } = require("../controllers/resultController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:userId", authMiddleware, getResults);

module.exports = router;

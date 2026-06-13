const express = require("express");
const router = express.Router();

const sessionController = require("../../controllers/admin/sessionController");

router.get("/", sessionController.listSessions);

module.exports = router;

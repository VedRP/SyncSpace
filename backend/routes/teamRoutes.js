const express = require("express");
const { createTeam, getTeams } = require("../controllers/teamController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getTeams);
router.post("/", protect, createTeam);

module.exports = router;


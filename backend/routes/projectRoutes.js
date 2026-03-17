const express = require("express");
const { createProject, getProjects } = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getProjects);
router.post("/", protect, createProject);

module.exports = router;


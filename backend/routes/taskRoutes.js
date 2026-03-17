const express = require("express");
const { createTask, getTasksByProject, updateTask, deleteTask } = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createTask);
router.get("/:projectId", protect, getTasksByProject);
router.put("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);

module.exports = router;


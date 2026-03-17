const Task = require("../models/Task");

async function createTask(req, res) {
  try {
    const { title, status = "todo", projectId } = req.body || {};
    if (!title || !projectId) {
      return res
        .status(400)
        .json({ success: false, data: { message: "title and projectId are required" } });
    }

    const task = await Task.create({
      title: String(title).trim(),
      status,
      projectId: String(projectId).trim(),
      owner: req.user._id,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Create task failed" } });
  }
}

async function getTasksByProject(req, res) {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ owner: req.user._id, projectId: String(projectId) })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: tasks });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Fetch tasks failed" } });
  }
}

async function updateTask(req, res) {
  try {
    const { taskId } = req.params;
    const { title, status } = req.body || {};

    const task = await Task.findOne({ _id: taskId, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, data: { message: "Task not found" } });
    }

    if (typeof title === "string") task.title = title.trim();
    if (typeof status === "string") task.status = status;

    await task.save();
    return res.json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Update task failed" } });
  }
}

async function deleteTask(req, res) {
  try {
    const { taskId } = req.params;
    const task = await Task.findOneAndDelete({ _id: taskId, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, data: { message: "Task not found" } });
    }
    return res.json({ success: true, data: { id: taskId } });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Delete task failed" } });
  }
}

module.exports = { createTask, getTasksByProject, updateTask, deleteTask };


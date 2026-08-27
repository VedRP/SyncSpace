const Project = require("../models/Project");
const Team = require("../models/Team");

async function createProject(req, res) {
  try {
    const {
      name,
      description = "",
      teamId = null,
      startDate,
      endDate,
      status = "active",
      priority = "medium",
      category = "Development",
      budget = 0,
    } = req.body || {};
    if (!name) {
      return res.status(400).json({ success: false, data: { message: "name is required" } });
    }

    let team = null;
    if (teamId) {
      team = await Team.findById(teamId);
      if (!team) {
        return res.status(400).json({ success: false, data: { message: "Invalid teamId" } });
      }
      const isMember =
        String(team.owner) === String(req.user._id) ||
        (team.members || []).some((m) => String(m) === String(req.user._id));
      if (!isMember) {
        return res.status(403).json({ success: false, data: { message: "Not allowed" } });
      }
    }

    const project = await Project.create({
      name: String(name).trim(),
      description: String(description).trim(),
      owner: req.user._id,
      team: team ? team._id : null,
      startDate,
      endDate,
      status,
      priority,
      category,
      budget: Number(budget),
    });

    return res.status(201).json({ success: true, data: project });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Create project failed" } });
  }
}

async function getProjects(req, res) {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: projects });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Fetch projects failed" } });
  }
}

module.exports = { createProject, getProjects };


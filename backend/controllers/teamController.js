const Team = require("../models/Team");

async function createTeam(req, res) {
  try {
    const { name } = req.body || {};
    if (!name) {
      return res.status(400).json({ success: false, data: { message: "name is required" } });
    }

    const team = await Team.create({
      name: String(name).trim(),
      owner: req.user._id,
      members: [req.user._id],
    });

    return res.status(201).json({ success: true, data: team });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Create team failed" } });
  }
}

async function getTeams(req, res) {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: teams });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Fetch teams failed" } });
  }
}

module.exports = { createTeam, getTeams };


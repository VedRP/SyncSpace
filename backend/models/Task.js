const mongoose = require("mongoose");

const allowedStatuses = ["todo", "progress", "done"];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    status: { type: String, required: true, enum: allowedStatuses, default: "todo" },
    projectId: { type: String, required: true, trim: true }, // matches frontend route param (e.g. "proj-1")
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);


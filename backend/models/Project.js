const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 300 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);


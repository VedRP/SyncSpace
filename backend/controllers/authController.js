const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, data: { message: "name, email, password are required" } });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, data: { message: "Email already in use" } });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashed,
    });

    const token = signToken(user._id);
    return res.status(201).json({ success: true, data: { token, user: sanitizeUser(user) } });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Signup failed" } });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, data: { message: "email and password are required" } });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, data: { message: "Invalid credentials" } });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, data: { message: "Invalid credentials" } });
    }

    const token = signToken(user._id);
    return res.json({ success: true, data: { token, user: sanitizeUser(user) } });
  } catch (err) {
    return res.status(500).json({ success: false, data: { message: "Login failed" } });
  }
}

module.exports = { signup, login };


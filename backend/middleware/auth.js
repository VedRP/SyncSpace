const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ success: false, data: { message: "Not authorized" } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, data: { message: "Not authorized" } });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, data: { message: "Not authorized" } });
  }
}

module.exports = { protect };


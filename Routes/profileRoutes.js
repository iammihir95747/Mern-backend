const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ username: user.username, email: user.email, address: user.address, phone: user.phone });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

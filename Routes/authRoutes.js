const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, address, phone } = req.body;

    if (![username, email, password, address, phone].every(Boolean))
      return res.status(400).json({ error: "All fields are required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, email, password: hashedPassword, address, phone }).save();

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (![email, password].every(Boolean))
      return res.status(400).json({ error: "Email and Password are required" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Invalid credentials" });

    res.json({ token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }) });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

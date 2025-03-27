const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const router = express.Router();


router.post("/register", async (req, res) => {
  try {

    const { username, role , email, password, address, phone } = req.body;
    if (![username, role, email, password, address, phone].every(Boolean))
      return res.status(400).json({ error: "All fields are required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await new User({ username, role, email, password: hashedPassword, address, phone }).save();

    console.log("User Registered:", newUser);
    res.status(201).json({ message: "User registered successfully ✅", user: newUser });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (![email, password].every(Boolean))
      return res.status(400).json({ error: "Email and Password are required" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Invalid credentials" });

    if (!process.env.JWT_SECRET) 
      return res.status(500).json({ error: "JWT Secret is missing in env" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log("Received data:", req.body);
    const { username, role, email, password, address, phone } = req.body;

    if (![username, role, email, password, address, phone].every(Boolean))
      return res.status(400).json({ error: "All fields are required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, role, email, password: hashedPassword, address, phone }).save();

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch {
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

    const token = jwt.sign({ id: user._id, role:user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("User Role:", user.role); 
    
    res.json({ token, role: user.role });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

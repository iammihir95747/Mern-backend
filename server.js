const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

dotenv.config();
const app = express();

app.use(cors({ origin: "https://steadydusk.netlify.app", credentials: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MONGO is connected ✅"))
  .catch(() => console.log("Failed to Connect ❌"));

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  address : String,
  phone : Number,
});


const User = mongoose.model("User", UserSchema);

app.get("/", (req, res) => res.send("Server is running ✅"));

app.get("/register", (req, res) => res.send("register is running ✅"));
app.get("/profile", (req, res) => res.send("Profile is running ✅"));
app.get("/login", (req, res) => res.send("login is running ✅"));



app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: "All fields are required" });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: "Email already in use" });

  const hashedPassword = await bcrypt.hash(password, 10);
  await new User({ username, email, password: hashedPassword }).save();
  res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and Password are required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Incorrect password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

app.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized - No Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ username: user.username, email: user.email , address: user.address ,phone: user.phone });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});



app.listen(10000, () => console.log("Server running on port 10000 🚀"));

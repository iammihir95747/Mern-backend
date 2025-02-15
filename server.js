const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

try{

  mongoose.connect(process.env.MONGO_URI);
  console.log("MONGO is connected✅");

}
catch(error){
  console.log("Failed to Connect ");
}


const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});


app.get('/' , async(req,res)=>{
   res.send("Server is running")
})

const User = mongoose.model('User', UserSchema);

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email }); // ✅ Check if email exists
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" }); // ✅ Return error if user exists
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password); // ✅ Compare hashed password
    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized - No Token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded User ID:", decoded.id); // ✅ Debugging line

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found in database" });

    res.json({ username: user.username, email: user.email });
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});



app.listen(10000, () => console.log('Server running on port 10000'));

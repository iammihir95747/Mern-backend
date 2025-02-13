const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
<<<<<<< HEAD
=======
//import section
>>>>>>> d106dc7 (save)

const app = express();
app.use(express.json());

<<<<<<< HEAD
app.use(cors({ 
  origin: "http://192.168.1.34:5173", 
  credentials: true 
}));


=======
//Connection for backend Project Using Cors
app.use(cors({ 
    origin: "https://steady-dusk.netlify.app/", 
    credentials: true 
  }));


  
>>>>>>> d106dc7 (save)
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;


//Connection of frontent with backend 
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.error("MongoDB Connection Error ❌", err));

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});
const User = mongoose.model('User', userSchema);





// Middleware to Verify JWT Token
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized ❌" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid Token ❌" });
    }
};

// User Registration Route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ message: "Registration Successful ✅" });
    } catch (error) {
        res.status(500).json({ error: "Registration Failed ❌" });
    }
});

// User Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid Credentials ❌" });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Login Failed ❌" });
    }
});

// User Profile Route (Protected)
app.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('username email');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Profile Fetch Failed ❌" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

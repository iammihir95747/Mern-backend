const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cors({ origin: "https://steady-dusk.netlify.app/", credentials: true }));

const { PORT, MONGO_URI, JWT_SECRET } = process.env;

// ✅ Database Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error", err));

// ✅ User Model
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    email: String,
    password: String
}));

// ✅ Middleware: Verify JWT Token
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "❌ Unauthorized" });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: "❌ Invalid Token" });
    }
};

// ✅ User Registration
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ username, email, password: hashedPassword }).save();
        res.json({ message: "✅ Registration Successful" });
    } catch {
        res.status(500).json({ error: "❌ Registration Failed" });
    }
});

// ✅ User Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "❌ Invalid Credentials" });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch {
        res.status(500).json({ error: "❌ Login Failed" });
    }
});

// ✅ User Profile (Protected)
app.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('username email');
        res.json(user);
    } catch {
        res.status(500).json({ error: "❌ Profile Fetch Failed" });
    }
});

// ✅ Start Server
app.listen(PORT || 5000, () => console.log(`🚀 Server running on port ${PORT || 5000}`));

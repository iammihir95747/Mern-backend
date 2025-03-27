const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./Routes/authRoutes");

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MONGO is connected ✅"))
  .catch((err) => console.log("Failed to Connect ❌", err));

app.use("/auth", authRoutes);

app.get("/", (req, res) => res.send("Server is running ✅"));

app.listen(10000, () => console.log("Server running on port 10000 🚀"));

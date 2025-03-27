const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  role: { type: String, required: true, default: "USER" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  agreeTerms: { type: Boolean, required: true }

});

const User = mongoose.model("User", userSchema);
module.exports = User;

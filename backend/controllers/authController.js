const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra user tồn tại
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Tạo user mới (hash sẽ tự động ở pre-save hook)
    user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    console.log("Request password:", password);
    console.log("Stored password:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Google OAuth2 callback
const googleCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=GoogleAuthFailed`);
    }

    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&username=${req.user.username}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=ServerError`);
  }
};

module.exports = { register, login, googleCallback };

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Tạo JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = generateToken(user);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const user = req.user; // passport gắn user vào req
    const token = generateToken(user);

    // Redirect về frontend, kèm token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, googleCallback };

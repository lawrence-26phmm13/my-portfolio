const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");

const router = express.Router();

function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in every field." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must contain at least 8 characters." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: "An account with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
    await Portfolio.create({ user: user._id });

    req.session.userId = user._id.toString();
    res.status(201).json({ message: "Account created successfully.", user: safeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create account. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Enter your email and password." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Incorrect email or password." });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ message: "Incorrect email or password." });

    req.session.userId = user._id.toString();
    res.json({ message: "Login successful.", user: safeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Please log in." });
  const user = await User.findById(req.session.userId).select("-password");
  if (!user) return res.status(401).json({ message: "Please log in." });
  res.json({ user: safeUser(user) });
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).json({ message: "Could not log out." });
    res.clearCookie("portfolio.sid");
    res.json({ message: "Logged out successfully." });
  });
});

module.exports = router;

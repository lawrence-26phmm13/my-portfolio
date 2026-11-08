const express = require("express");
const Portfolio = require("../models/Portfolio");

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: "Please log in first." });
  next();
}

router.use(requireLogin);

router.get("/", async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.session.userId });
    if (!portfolio) portfolio = await Portfolio.create({ user: req.session.userId });
    res.json({ portfolio });
  } catch (error) {
    res.status(500).json({ message: "Could not load portfolio." });
  }
});

// Update the main profile details.
router.put("/", async (req, res) => {
  try {
    const { headline, about, location, phone } = req.body;
    const portfolio = await Portfolio.findOneAndUpdate(
      { user: req.session.userId },
      { $set: { headline, about, location, phone } },
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ message: "Profile updated.", portfolio });
  } catch (error) {
    res.status(400).json({ message: "Could not update profile." });
  }
});

// Skills: add and delete.
router.post("/skills", async (req, res) => {
  const skill = String(req.body.skill || "").trim();
  if (!skill) return res.status(400).json({ message: "Enter a skill." });
  const portfolio = await Portfolio.findOneAndUpdate(
    { user: req.session.userId },
    { $addToSet: { skills: skill } },
    { new: true, upsert: true }
  );
  res.status(201).json({ message: "Skill added.", portfolio });
});

router.delete("/skills", async (req, res) => {
  const skill = String(req.body.skill || "").trim();
  const portfolio = await Portfolio.findOneAndUpdate(
    { user: req.session.userId },
    { $pull: { skills: skill } },
    { new: true }
  );
  res.json({ message: "Skill deleted.", portfolio });
});

// Education: create, update and delete one embedded record.
router.post("/education", async (req, res) => {
  const { course, institution, year } = req.body;
  if (!course || !institution) return res.status(400).json({ message: "Course and institution are required." });
  const portfolio = await Portfolio.findOne({ user: req.session.userId });
  portfolio.education.push({ course, institution, year });
  await portfolio.save();
  res.status(201).json({ message: "Education added.", portfolio });
});

router.put("/education/:itemId", async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.session.userId });
  const item = portfolio && portfolio.education.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: "Education record not found." });
  item.course = req.body.course;
  item.institution = req.body.institution;
  item.year = req.body.year || "";
  await portfolio.save();
  res.json({ message: "Education updated.", portfolio });
});

router.delete("/education/:itemId", async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.session.userId });
  if (!portfolio) return res.status(404).json({ message: "Portfolio not found." });
  portfolio.education.pull({ _id: req.params.itemId });
  await portfolio.save();
  res.json({ message: "Education deleted.", portfolio });
});

// Projects: create, update and delete.
router.post("/projects", async (req, res) => {
  const { title, description, link } = req.body;
  if (!title) return res.status(400).json({ message: "Project title is required." });
  const portfolio = await Portfolio.findOne({ user: req.session.userId });
  portfolio.projects.push({ title, description, link });
  await portfolio.save();
  res.status(201).json({ message: "Project added.", portfolio });
});

router.put("/projects/:itemId", async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.session.userId });
  const item = portfolio && portfolio.projects.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: "Project not found." });
  item.title = req.body.title;
  item.description = req.body.description || "";
  item.link = req.body.link || "";
  await portfolio.save();
  res.json({ message: "Project updated.", portfolio });
});

router.delete("/projects/:itemId", async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.session.userId });
  if (!portfolio) return res.status(404).json({ message: "Portfolio not found." });
  portfolio.projects.pull({ _id: req.params.itemId });
  await portfolio.save();
  res.json({ message: "Project deleted.", portfolio });
});

module.exports = router;

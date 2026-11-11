const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  course: { type: String, trim: true, required: true },
  institution: { type: String, trim: true, required: true },
  year: { type: String, trim: true, default: "" }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true },
  description: { type: String, trim: true, default: "" },
  link: { type: String, trim: true, default: "" }
});

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  headline: { type: String, default: "Student | Learner | Creator" },
  about: { type: String, default: "Write a little introduction about yourself." },
  location: { type: String, default: "" },
  phone: { type: String, default: "" },
  skills: [{ type: String, trim: true }],
  education: [educationSchema],
  projects: [projectSchema]
}, { timestamps: true });

module.exports = mongoose.model("Portfolio", portfolioSchema);


require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");

const authRoutes = require("./routes/auth");
const portfolioRoutes = require("./routes/portfolio");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Check your .env file.");
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.error("Missing SESSION_SECRET. Check your .env file.");
  process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  try {
    // Connect to MongoDB only once.
    await mongoose.connect(MONGODB_URI);

    console.log("Connected to MongoDB");

    // Reuse Mongoose's existing MongoDB client.
    const sessionStore = MongoStore.create({
      client: mongoose.connection.getClient(),
      collectionName: "sessions"
    });

    app.use(session({
      name: "portfolio.sid",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24
      }
    }));

    app.use(express.static(path.join(__dirname, "public")));

    app.use("/api/auth", authRoutes);
    app.use("/api/portfolio", portfolioRoutes);

    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    app.listen(PORT, () => {
      console.log(`Portfolio running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

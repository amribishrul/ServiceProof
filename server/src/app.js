const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");

const jobRoutes = require("./routes/jobRoutes");
const verificationRoutes = require("./routes/verificationRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());


app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ServiceProof backend is running.",
  });
});

app.use(async (req, res, next) => {
  if (req.path === "/api/health") {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/verify", verificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
  });
});

module.exports = app;
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import homeRoutes from "./routes/homeRouters/homeRoutes.js";
import featuresRoute from "./routes/homeRouters/featuresRoutes.js";
import aboutRoutes from "./routes/homeRouters/aboutRoutes.js";
import testimonialRoutes from "./routes/homeRouters/testimonialRoutes.js";
import pricingRoutes from "./routes/homeRouters/pricing.js";
import footerRoutes from "./routes/homeRouters/footerRoutes.js";
import taskCategoryRoutes from "./routes/taskCategoryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import tasklistRoutes from "./routes/tasklistRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import settingsRoutes from "./routes/settingsRoutes.js";
import authForm from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";


// ✅ .env load
dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();


// ✅ CORS Middleware (ONLY once)
app.use(cors({
  origin: "http://localhost:5173", // frontend ka port
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],  // ✅ PATCH add kiya
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/home", homeRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/features", featuresRoute);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tasklist", tasklistRoutes);
app.use("/api/categories", taskCategoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/tasks', dashboardRoutes); 
app.use("/api/settings", settingsRoutes);
app.use("/api/auth", authForm);
app.use("/api/profile", profileRoutes);
app.use("/api/reviews", reviewRoutes);


// ✅ MongoDB connect
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) throw new Error("❌ MONGO_URI missing in ENV");

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
    });
    cached.conn = conn;
    console.log("✅ MongoDB Connected");
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
    throw error;
  }
}

// Connect DB on each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ================================
// Default Route
// ================================
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// ================================
// Export app (Serverless Ready)
// ================================
module.exports = app;
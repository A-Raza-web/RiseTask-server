import express from "express";
import protect from "../Middleware/authMiddleware.js";
import { createReview, getReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", protect, getReviews);
router.post("/", protect, createReview);

export default router;

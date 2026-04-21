import express from "express";
import protect from "../Middleware/authMiddleware.js";
import { getProfile, updatePassword, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.put("/password", protect, updatePassword);

export default router;

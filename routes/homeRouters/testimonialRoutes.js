import express from "express";
import Testimonial from "../../models/homeModels/Testimonial.js";
import Review from "../../models/Review.js";

const router = express.Router();

// Get testimonials + user reviews for home section
router.get("/", async (req, res) => {
  try {
    const [testimonials, reviews] = await Promise.all([
      Testimonial.find().lean(),
      Review.find().sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const normalizedTestimonials = testimonials.map((item) => ({
      ...item,
      source: "testimonial",
    }));

    const normalizedReviews = reviews.map((item) => ({
      _id: `review-${item._id}`,
      name: item.name,
      role: item.role || "User",
      message: item.comment,
      image: "",
      rating: Number(item.rating) || 5,
      source: "review",
      createdAt: item.createdAt,
    }));

    return res.json([...normalizedTestimonials, ...normalizedReviews]);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching testimonials", error });
  }
});

// Add a testimonial (admin/manual use)
router.post("/", async (req, res) => {
  try {
    const { name, role, message, image, rating } = req.body;
    const newTestimonial = new Testimonial({ name, role, message, image, rating });
    await newTestimonial.save();
    return res.status(201).json(newTestimonial);
  } catch (error) {
    return res.status(500).json({ message: "Error saving testimonial", error });
  }
});

export default router;

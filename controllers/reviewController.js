import Review from "../models/Review.js";

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { name, role, category, rating, comment } = req.body;

    if (!name?.trim() || !role?.trim() || !comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, role, and comment are required",
      });
    }

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    if (comment.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: "Comment should be at least 15 characters",
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      name: name.trim(),
      role: role.trim(),
      category: (category || "General").trim(),
      rating: parsedRating,
      comment: comment.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

import Review from "../models/Review.js";

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.json(review);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

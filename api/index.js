import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import serverless from "serverless-http";

import reviewRoutes from "../routes/reviewRoutes.js";
import bookingRoutes from "../routes/bookingRoutes.js";

dotenv.config();

const app = express();

// MongoDB — only connect once
if (!mongoose.connection.readyState) {
  mongoose
    .connect(process.env.MONGODB_URI, { dbName: "tint_reviews" })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Error:", err.message));
}

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["POST", "GET"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ROUTES
app.use("/reviews", reviewRoutes);
app.use("/book", upload.array("images", 3), bookingRoutes);

// EXPORT FOR VERCEL
export const handler = serverless(app);
export default app;

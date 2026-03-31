import express from "express";
import multer from "multer";
import { handleBooking } from "../controllers/bookingController.js";

const router = express.Router();
const upload = multer(); // Initialize multer to handle memory storage

router.post("/", upload.array("images", 3), handleBooking);

export default router;

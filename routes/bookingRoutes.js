import express from "express";
import { handleBooking } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", handleBooking);

export default router;

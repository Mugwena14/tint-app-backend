import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import Brevo from "@getbrevo/brevo";

dotenv.config();

const app = express();

// Parse form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer (in-memory storage for images)
const upload = multer({ storage: multer.memoryStorage() });

// Brevo client
const brevoClient = new Brevo.TransactionalEmailsApi();
brevoClient.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Booking route
app.post("/api/book", upload.array("images", 3), async (req, res) => {
  try {
    const { name, email, location, service, message, preferredDate, preferredTime } = req.body;

    // Convert uploaded images into Brevo-compatible attachments
    const attachments = req.files.map((file) => ({
      name: file.originalname,
      content: file.buffer.toString("base64"), // Base64 required for Brevo
    }));

    /** --------------------------
     * 1️⃣ SEND EMAIL TO ADMIN
     * -------------------------- */
    await brevoClient.sendTransacEmail({
      sender: { email: process.env.ADMIN_EMAIL, name: "Booking System" },
      to: [{ email: process.env.ADMIN_EMAIL }],
      subject: `New Booking Request — ${name}`,
      htmlContent: `
        <h3>New Tinting Booking</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferredDate || "Not specified"}</p>
        <p><strong>Time:</strong> ${preferredTime || "Not specified"}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
      attachment: attachments,
    });

    /** --------------------------
     * 2️⃣ SEND CONFIRMATION EMAIL TO CLIENT
     * -------------------------- */
    await brevoClient.sendTransacEmail({
      sender: { email: process.env.ADMIN_EMAIL, name: "Tinting Team" },
      to: [{ email }],
      subject: "We've Received Your Booking Request",
      htmlContent: `
        <h3>Thank you, ${name}!</h3>
        <p>Your booking request has been received. We'll contact you shortly.</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Location:</strong> ${location}</p>
        <br>
        <p>Regards,<br>The Tinting Team</p>
      `,
    });

    res.json({ success: true, message: "Booking sent successfully using Brevo." });
  } catch (error) {
    console.error("Brevo Error:", error.response?.text || error);
    res.status(500).json({ success: false, error: "Failed to send booking via Brevo." });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

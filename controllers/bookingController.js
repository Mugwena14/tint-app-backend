import brevoClient from "../config/brevo.js";

export const handleBooking = async (req, res) => {
  try {
    const { name, email, location, service, message, preferredDate, preferredTime } = req.body;

    const attachments = req.files?.length
      ? req.files.map((file) => ({
          name: file.originalname,
          content: file.buffer.toString("base64"),
        }))
      : null;

    // 1️⃣ SEND TO ADMIN
    const adminEmail = {
      sender: { email: process.env.ADMIN_EMAIL, name: "Booking System" },
      to: [{ email: process.env.ADMIN_EMAIL }],
      subject: `New Booking Request — ${name}`,
      htmlContent: `
        <h3 style="color:#c9a24d">New Tinting Booking</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferredDate || "Not specified"}</p>
        <p><strong>Time:</strong> ${preferredTime || "Not specified"}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    };

    if (attachments) adminEmail.attachment = attachments;

    await brevoClient.sendTransacEmail(adminEmail);

    // 2️⃣ SEND CONFIRMATION TO CLIENT
    await brevoClient.sendTransacEmail({
      sender: { email: process.env.ADMIN_EMAIL, name: "Tintish Tinting Team" },
      to: [{ email }],
      subject: "We've Received Your Booking Request",
      htmlContent: `
        <h3 style="color:#c9a24d">Thank you, ${name}!</h3>
        <p>Your booking request has been received. We'll contact you shortly.</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Location:</strong> ${location}</p>
        <br>
        <p style="color:#333">Regards,<br>The Tintish Tinting Team</p>
      `,
    });

    res.json({ success: true, message: "Booking successfully sent via Brevo." });
  } catch (error) {
    console.error("Brevo Error:", error.response?.data || error);
    res.status(500).json({ success: false, error: "Failed to send booking via Brevo." });
  }
};

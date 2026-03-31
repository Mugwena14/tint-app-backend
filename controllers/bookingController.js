import brevoClient from "../config/brevo.js";

export const handleBooking = async (req, res) => {
  try {
    // 1. Get data from req.body (Ensure you have multer in your route!)
    const { name, phone, location, service, message, preferredDate, preferredTime } = req.body;

    // 2. Format phone for WhatsApp (South Africa)
    const formattedPhone = phone
      ? phone.replace(/^0/, "27").replace(/\s+/g, "").replace("+", "")
      : null;

    // 3. Handle Attachments (from multer)
    const attachments = req.files?.length
      ? req.files.map((file) => ({
          name: file.originalname,
          content: file.buffer.toString("base64"),
        }))
      : null;

    // -------------------
    // Admin Email (Sent to YOU)
    // -------------------
    const adminEmail = {
      sender: { email: process.env.ADMIN_EMAIL, name: "Booking System" },
      to: [{ email: process.env.ADMIN_EMAIL }],
      subject: `New Booking Request — ${name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; background: #f9f9f9; padding:20px; border-radius:10px; color:#1a1a1a;">
          <h2 style="color:#0390fc;">New Tinting Booking</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${preferredDate || "Not specified"}</p>
          <p><strong>Time:</strong> ${preferredTime || "Not specified"}</p>
          ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ""}
          <br>
          ${formattedPhone ? `
          <a href="https://wa.me/${formattedPhone}" style="display:inline-block; padding:10px 15px; background-color:#25D366; color:#fff; text-decoration:none; border-radius:6px;">WhatsApp Client</a>
          <a href="tel:${phone}" style="display:inline-block; padding:10px 15px; background-color:#000; color:#fff; text-decoration:none; border-radius:6px;">Call Client</a>
          ` : ""}
        </div>
      `,
    };

    if (attachments) adminEmail.attachment = attachments;
    
    await brevoClient.sendTransacEmail(adminEmail);

    res.json({ success: true, message: "Booking received!" });

  } catch (error) {
    console.error("Brevo Error:", error.response?.data || error);
    res.status(500).json({ success: false, error: "Failed to process booking." });
  }
};

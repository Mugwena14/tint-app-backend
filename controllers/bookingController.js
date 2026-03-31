import brevoClient from "../config/brevo.js";

export const handleBooking = async (req, res) => {
  try {
    const { name, phone, location, service, message, preferredDate, preferredTime } = req.body;

    // 1. Format phone for WhatsApp/Call links
    const formattedPhone = phone
      ? phone.replace(/^0/, "27").replace(/\s+/g, "").replace("+", "")
      : null;

    // 2. Map attachments from multer
    const attachments = req.files?.length
      ? req.files.map((file) => ({
          name: file.originalname,
          content: file.buffer.toString("base64"),
        }))
      : null;

    // 3. Admin Notification Email (Sent to YOU)
    const adminEmail = {
      sender: { email: process.env.ADMIN_EMAIL, name: "Tintish Booking System" },
      to: [{ email: process.env.ADMIN_EMAIL }],
      subject: `New Booking Request — ${name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; background: #f4f4f4; padding:20px; border-radius:10px;">
          <h2 style="color:#0390fc;">New Tinting Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${preferredDate || "Not specified"}</p>
          <p><strong>Time:</strong> ${preferredTime || "Not specified"}</p>
          ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ""}
          <br>
          <div style="margin-top:20px;">
            <a href="https://wa.me/${formattedPhone}" 
               style="display:inline-block; padding:12px 20px; background-color:#25D366; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
               WhatsApp Client
            </a>
            <a href="tel:${phone}" 
               style="display:inline-block; padding:12px 20px; background-color:#000; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold; margin-left:10px;">
               Call Now
            </a>
          </div>
        </div>
      `,
    };

    if (attachments) adminEmail.attachment = attachments;

    // Send the email to the Admin
    await brevoClient.sendTransacEmail(adminEmail);

    // Send success back to the frontend
    return res.status(200).json({ 
      success: true, 
      message: "Booking successfully sent to admin." 
    });

  } catch (error) {
    // Log the full error to Render's console so you can see details
    console.error("Brevo Error:", error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      error: "Server failed to process booking." 
    });
  }
};

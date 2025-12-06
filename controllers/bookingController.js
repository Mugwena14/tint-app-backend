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

    // -------------------
    // Admin Email
    // -------------------
    const adminEmail = {
      sender: { email: process.env.ADMIN_EMAIL, name: "Booking System" },
      to: [{ email: process.env.ADMIN_EMAIL }],
      subject: `New Booking Request — ${name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; background: linear-gradient(135deg, #e0f0ff 0%, #ffffff 100%); padding:20px; border-radius:10px; color:#1a1a1a;">
          <h2 style="color:#0390fc; margin-bottom:10px;">New Tinting Booking</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${preferredDate || "Not specified"}</p>
          <p><strong>Time:</strong> ${preferredTime || "Not specified"}</p>
          ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ""}
          <br>
          <a href="mailto:${email}" 
             style="display:inline-block; padding:12px 25px; background-color:#0390fc; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">
             Reply to Client
          </a>
        </div>
      `,
    };

    if (attachments) adminEmail.attachment = attachments;
    await brevoClient.sendTransacEmail(adminEmail);

    // -------------------
    // Client Confirmation Email
    // -------------------
    await brevoClient.sendTransacEmail({
      sender: { email: process.env.ADMIN_EMAIL, name: "Tintish Tinting Team" },
      to: [{ email }],
      subject: "Your Tinting Booking Request Received!",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; background: linear-gradient(135deg, #e0f0ff 0%, #ffffff 100%); padding:20px; border-radius:10px; color:#1a1a1a;">
          <h2 style="color:#0390fc; margin-bottom:10px;">Thank you, ${name}!</h2>
          <p>We have received your booking request and our team will contact you shortly.</p>
          <hr style="border:none; border-top:1px solid #ccc; margin:15px 0;">
          <p><strong>Booking Details:</strong></p>
          <ul style="padding-left:20px;">
            <li><strong>Service:</strong> ${service}</li>
            <li><strong>Location:</strong> ${location}</li>
            <li><strong>Preferred Date:</strong> ${preferredDate || "Not specified"}</li>
            <li><strong>Preferred Time:</strong> ${preferredTime || "Not specified"}</li>
          </ul>
          ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ""}
          <hr style="border:none; border-top:1px solid #ccc; margin:15px 0;">
          <p style="color:#555;">We’ll follow up with you soon. Meanwhile, check us out on social media:</p>
          <div style="margin-top:10px;">
            <a href="https://www.tiktok.com/@tint.ish" target="_blank" style="margin-right:10px;">
              <img src="https://img.icons8.com/color/48/000000/tiktok--v1.png" width="32" alt="TikTok"/>
            </a>
            <a href="https://wa.me/27688287061" target="_blank" style="margin-right:10px;">
              <img src="https://img.icons8.com/color/48/000000/whatsapp.png" width="32" alt="WhatsApp"/>
            </a>
            <a href="https://www.instagram.com/tint.ish" target="_blank">
              <img src="https://img.icons8.com/color/48/000000/instagram-new.png" width="32" alt="Instagram"/>
            </a>
          </div>
          <br>
          <p style="color:#0390fc; font-weight:bold;">The Tintish Tinting Team</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Booking successfully sent via Brevo." });
  } catch (error) {
    console.error("Brevo Error:", error.response?.data || error);
    res.status(500).json({ success: false, error: "Failed to send booking via Brevo." });
  }
};

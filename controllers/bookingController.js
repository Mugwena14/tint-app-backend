import brevoClient from "../config/brevo.js";

export const handleBooking = async (req, res) => {
  try {
    // 1. Destructure only what you are actually sending from the frontend
    const { name, phone, location, service, message, preferredDate, preferredTime } = req.body;

    // 2. Format phone for WhatsApp (SA support)
    const formattedPhone = phone
      ? phone.replace(/^0/, "27").replace(/\s+/g, "").replace("+", "")
      : null;

    const attachments = req.files?.length
      ? req.files.map((file) => ({
          name: file.originalname,
          content: file.buffer.toString("base64"),
        }))
      : null;

    // 3. Admin Email (This sends the notification to YOU)
    const adminEmail = {
      sender: { email: process.env.ADMIN_EMAIL, name: "Booking System" },
      to: [{ email: process.env.ADMIN_EMAIL }],
      subject: `New Booking Request — ${name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; background: #ffffff; padding:20px; border-radius:10px; color:#1a1a1a; border: 1px solid #eee;">
          <h2 style="color:#0390fc;">New Tinting Booking</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${preferredDate || "Not specified"}</p>
          <p><strong>Time:</strong> ${preferredTime || "Not specified"}</p>
          <p><strong>Message:</strong> ${message || "No message"}</p>
          <br>
          <hr />
          <div style="margin-top: 20px;">
            <a href="https://wa.me/${formattedPhone}" style="background-color:#25D366; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">WhatsApp Client</a>
            <a href="tel:${phone}" style="background-color:#000; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold; margin-left:10px;">Call</a>
          </div>
        </div>
      `,
    };

    if (attachments) adminEmail.attachment = attachments;

    // Send the email to yourself
    await brevoClient.sendTransacEmail(adminEmail);

    // 4. Send Success response
    res.json({ success: true, message: "Booking successfully received." });

  } catch (error) {
    // This logs the actual error to your Render logs so you can see it
    console.error("Brevo/Server Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

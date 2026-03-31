import brevoClient from "../config/brevo.js";

export const handleBooking = async (req, res) => {
  try {
    // 1. Destructure ONLY what exists. 'email' is gone.
    const { name, phone, location, service, message, preferredDate, preferredTime } = req.body;

    // 2. Format phone for the WhatsApp link in your notification email
    const formattedPhone = phone ? phone.replace(/\D/g, "") : "";

    // 3. Handle images
    const attachments = req.files?.map((file) => ({
      name: file.originalname,
      content: file.buffer.toString("base64"),
    })) || [];

    // 4. ADMIN EMAIL (Sent to you, the owner)
    const adminEmail = {
      sender: { email: process.env.ADMIN_EMAIL, name: "Tintish Booking" },
      to: [{ email: process.env.ADMIN_EMAIL }], // Sent to YOUR email
      subject: `New Booking: ${name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #0390fc;">New Tinting Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${preferredDate} at ${preferredTime}</p>
          <p><strong>Message:</strong> ${message}</p>
          <br>
          <a href="https://wa.me/${formattedPhone.replace(/^0/, "27")}" 
             style="background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             Reply via WhatsApp
          </a>
        </div>
      `,
    };

    if (attachments.length > 0) adminEmail.attachment = attachments;

    // SEND ONLY ONE EMAIL (to admin). 
    // You cannot send a 'Confirmation Email' to the client because you don't have their email address anymore!
    await brevoClient.sendTransacEmail(adminEmail);

    return res.status(200).json({ success: true, message: "Booking received!" });

  } catch (error) {
    console.error("CRASH ERROR:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

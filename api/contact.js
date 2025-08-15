import nodemailer from "nodemailer";
import axios from "axios";

export default async (req, res) => {
  try {
    // 1. Parse the JSON
    const data = await new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error("Invalid JSON"));
        }
      });
      req.on("error", reject);
    });
    // 2. Validate
    if (!data.name || !data.email || !data.message) {
      res.status(400).json({ error: "All fields are required!" });
    }

    const turnstileResponse = await axios
      .post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: data["cf-turnstile-response"],
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 3000,
        }
      )
      .catch(() => ({ data: { success: false } }));

    if (!turnstileResponse.data.success) {
      return res.status(400).json({ error: "CAPTCHA verification failed" });
    }

    // 3. Send the email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
    });

    await transporter.sendMail({
      from: `Contact form <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `New message from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`,
    });

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Server error: ", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

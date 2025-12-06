// test-smtp.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    ...(Number(process.env.SMTP_PORT) === 587 ? { requireTLS: true } : {}),
    logger: true,
    debug: true,
  });

  try {
    await transporter.verify();
    console.log("SMTP OK - transporter verified");
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "Test SMTP - T-Music",
      text: "Đây là email test SMTP từ T-Music.",
    });
    console.log("Sent OK:", info.messageId || info);
  } catch (err) {
    console.error("SMTP test failed:", err);
  } finally {
    process.exit();
  }
})();

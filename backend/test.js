require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL port
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // your Google App Password
  },
});

transporter.sendMail(
  {
    from: `"SmartFit Test" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // send to yourself to check
    subject: "SMTP Test Email",
    text: "If you receive this, your Gmail SMTP is working ✅",
  },
  (err, info) => {
    if (err) {
      console.error("❌ SMTP Test Failed:", err);
    } else {
      console.log("✅ SMTP Test Success:", info.response);
    }
  }
);

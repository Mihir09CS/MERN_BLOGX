
const axios = require("axios");

if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
  throw new Error("Email service not configured");
}

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.SENDER_EMAIL,
          name: "Blog App",
        },
        to: [{ email: to }],
        subject,
        textContent: text || "Please view this email in HTML format.",
        htmlContent: html || `<p>${text}</p>`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error("BREVO EMAIL ERROR:", error.response?.data || error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;

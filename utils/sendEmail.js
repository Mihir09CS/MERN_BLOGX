// const nodemailer = require("nodemailer");

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     // host: process.env.SMTP_HOST, // smtp-relay.brevo.com
//     // port: process.env.SMTP_PORT, // 587
//     // secure: false, // must be false for 587
    
//     auth: {
//       user: process.env.SMTP_USER, // Brevo SMTP user
//       pass: process.env.SMTP_PASS, // Brevo SMTP key
//     },
//   });

//   const mailOptions = {
//     from: `"Blog App" <${process.env.SENDER_EMAIL}>`,
//     to: options.to,
//     subject: options.subject,
//     text: options.text,
//     html: options.html || undefined,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;


const axios = require("axios");

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
        textContent: text,
        htmlContent: html || `<p>${text}</p>`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("BREVO EMAIL ERROR:", error.response?.data || error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;

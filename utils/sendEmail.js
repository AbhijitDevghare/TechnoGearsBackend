require('dotenv').config();
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT, // SMTP server port
    secure: false, // false for STARTTLS (port 587)
    auth: {
      user: process.env.EMAIL_USER , // Your email address
      pass: process.env.EMAIL_PASS  // Your email password or API key
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Set up email options
  let mailOptions = {
    from: "kishordevghare6@gmail.com", // Sender address
    to: options.to, // List of recipients
    subject: options.subject, // Subject line
    text: options.text, // Plain text body
    html: options.html // HTML body
  };

  // Send the email
  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

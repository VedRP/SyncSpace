const nodemailer = require("nodemailer");

let transporter;

if (process.env.EMAIL_USER && process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
    },
  });
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });
}

async function sendMail({ to, subject, text }) {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  if (!user) {
    console.log("-----------------------------------------");
    console.log(`Email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${text}`);
    console.log("-----------------------------------------");
    return;
  }
  await transporter.sendMail({
    from: `"SyncSpace" <${user}>`,
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };

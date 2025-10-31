import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendOtpEmail = async (to, otp) => {
  console.log("Sending verification code");
  await transporter.sendMail({
    from: `"Kura – Secure Chat" <${process.env.SENDER_EMAIL}>`,
    to,
    subject: "Verify Your Email – Kura Secure Chat",
    html: `
      <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px; color:#333;">
        <div style="max-width:500px; margin:auto; background:white; border-radius:10px; padding:20px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="color:#2b6cb0; text-align:center;">Welcome to <span style="color:#38a169;">Kura</span></h2>
          <p style="font-size:15px; line-height:1.6;">
            Thank you for joining <b>Kura</b>, your super secure chat app. <br/>
            To complete your registration, please verify your email using the One-Time Password (OTP) below:
          </p>
          
          <div style="text-align:center; margin:30px 0;">
            <span style="display:inline-block; font-size:24px; font-weight:bold; letter-spacing:4px; color:#2d3748; background:#edf2f7; padding:12px 24px; border-radius:8px; border:1px solid #cbd5e0;">
              ${otp}
            </span>
          </div>

          <p style="font-size:14px; color:#555;">
            ⚠️ This OTP will expire in <b>5 minutes</b>. If you did not request this, please ignore this email.
          </p>

          <p style="font-size:13px; color:#999; text-align:center; margin-top:30px;">
            — The <b>Kura</b> Team <br/>
            <span style="font-size:12px;">Secure. Private. Reliable.</span>
          </p>
        </div>
      </div>
    `,
  });
};

export default transporter;

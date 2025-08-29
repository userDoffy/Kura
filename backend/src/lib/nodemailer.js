import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    }
});

export const sendOtpEmail = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject: 'Your OTP for Email Verification',
        html: `<p>Thank you for joining us. <br> Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`
    });
};

export default transporter
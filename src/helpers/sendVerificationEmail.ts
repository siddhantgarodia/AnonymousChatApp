// lib/mailer.ts
import nodemailer from "nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
  isPasswordReset: boolean = false
): Promise<ApiResponse> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });
    const subject = isPasswordReset
      ? "AnonyChat - Password Reset Request"
      : "AnonyChat - Verify Your Email Address";

    const messageIntro = isPasswordReset
      ? "You requested to reset your password. Your verification code is:"
      : "Your verification code is:";

    const mailOptions = {
      from: `"AnonyChat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <h2>Hello ${username},</h2>
        <p>${messageIntro}</p>
        <h1>${verifyCode}</h1>
        <p>This code will expire in 10 minutes.</p>
        <br/>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <br/>
        <p>Thanks,<br/>The AnonyChat Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email.",
    };
  }
}

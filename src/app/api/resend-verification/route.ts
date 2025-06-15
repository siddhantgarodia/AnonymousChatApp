import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import crypto from "crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Define schema for resend verification
const resendVerificationSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().email({ message: "Valid email is required" }),
});

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json(
      {
        success: false,
        message: "Method not allowed. Only POST requests are allowed.",
      },
      { status: 405 }
    );
  }

  await dbConnect();

  try {
    const body = await request.json();

    const validationResult = resendVerificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { username, email } = validationResult.data;

    // Find user by both username and email to ensure they match
    const user = await UserModel.findOne({ username, email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No user found with the provided username and email combination.",
        },
        { status: 404 }
      );
    }

    // Generate a random 6-digit code
    const verifyCode = crypto.randomInt(100000, 999999).toString();
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 10 * 60000); // 10 minutes from now

    // Update user with new verification code
    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = expiryTime;
    await user.save();

    // Send verification email with password reset flag
    await sendVerificationEmail(user.email, user.username, verifyCode, true);

    return NextResponse.json(
      {
        success: true,
        message: "Verification code has been resent to your email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resending verification code:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

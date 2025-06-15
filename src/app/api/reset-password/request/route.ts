import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { resetPasswordRequestSchema } from "@/schemas/resetPasswordSchema";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import crypto from "crypto";

export const dynamic = "force-dynamic";

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

    const validationResult = resetPasswordRequestSchema.safeParse(body);
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

    const { identifier } = validationResult.data;

    // Find user by email or username
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      // Return success even if user not found for security reasons
      // This prevents user enumeration attacks
      return NextResponse.json(
        {
          success: true,
          message:
            "If the account exists, a verification code has been sent to your email.",
        },
        { status: 200 }
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
        message:
          "If the account exists, a verification code has been sent to your email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

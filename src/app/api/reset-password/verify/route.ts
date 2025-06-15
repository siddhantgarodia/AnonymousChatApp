import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { resetPasswordVerifySchema } from "@/schemas/resetPasswordSchema";
import bcrypt from "bcryptjs";

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

    const validationResult = resetPasswordVerifySchema.safeParse(body);
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

    const { username, code, newPassword } = validationResult.data;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;

    if (!isCodeValid) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code." },
        { status: 400 }
      );
    }

    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (!isCodeNotExpired) {
      return NextResponse.json(
        { success: false, message: "Verification code has expired." },
        { status: 400 }
      );
    }

    if (isCodeNotExpired && isCodeValid) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt); // Update user password
      user.password = hashedPassword;
      // Set verification code to a placeholder to satisfy schema requirements
      user.verifyCode = "USED";
      user.verifyCodeExpiry = new Date(0);
      await user.save();

      return NextResponse.json(
        { success: true, message: "Password updated successfully." },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error verifying code and updating password:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

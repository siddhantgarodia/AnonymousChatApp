import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  
  if (request.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method not allowed. Only POST requests are allowed." },
      { status: 405 }
    );
  }

  await dbConnect();

  try {
    const {username, code} = await request.json();

    const CodeVerificationSchema = z.object({
      username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
      code: z.string().length(6, { message: "Code must be exactly 6 characters long" }),
    });

    const decodedUsername = decodeURIComponent(username);
    
    const user = await UserModel.findOne({ username: decodedUsername })

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
      user.isVerified = true;
      await user.save();
      return NextResponse.json(
        { success: true, 
          message: "User verified successfully." 
        },
        { status: 200 }
      );
    }

  }
  catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { success: false, 
        message: "An error occurred while verifying the code." 
      },
      { status: 500 }
    );
  }
}
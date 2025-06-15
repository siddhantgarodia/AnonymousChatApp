import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextRequest } from "next/server";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

/**
 * API endpoint to check if a username exists and accepts messages
 * This endpoint is specifically designed to be used before sending messages
 * 
 * @param request - Next.js request object with username query parameter
 * @returns Response object with:
 *   - success: boolean indicating if the operation was successful
 *   - exists: boolean indicating if username exists
 *   - acceptsMessages: boolean indicating if user accepts messages
 *   - message: descriptive message for UI display
 */
export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    // Validate username format
    const result = UsernameQuerySchema.safeParse({ username });
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          exists: false,
          acceptsMessages: false,
          message: usernameErrors.length > 0
            ? usernameErrors.join(", ")
            : "Invalid username format.",
        },
        { status: 400 }
      );
    }

    const { username: validatedUsername } = result.data;

    // Find user and check if verified
    const existingUser = await UserModel.findOne({
      username: new RegExp(`^${validatedUsername}$`, "i"), // Case-insensitive match
      isVerified: true,
    });

    // If user doesn't exist, return appropriate response
    if (!existingUser) {
      return Response.json(
        {
          success: true, // API call was successful even though user wasn't found
          exists: false,
          acceptsMessages: false,
          message: "Username does not exist or is not verified.",
        },
        { status: 200 } // Using 200 because this is a valid result, not an error
      );
    }

    // User exists, return their message acceptance status
    return Response.json(
      {
        success: true,
        exists: true,
        acceptsMessages: existingUser.isAcceptingMessage,
        message: existingUser.isAcceptingMessage
          ? "User exists and is accepting messages."
          : "User exists but is not accepting messages.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking message eligibility:", error);
    return Response.json(
      {
        success: false,
        exists: false,
        acceptsMessages: false,
        message: "An error occurred while checking if this user can receive messages.",
      },
      { status: 500 }
    );
  }
}

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();
  try {
    // Normalize the username to lowercase for case-insensitive matching
    const normalizedUsername = username.toLowerCase();
    console.log(
      "Looking for user with normalized username:",
      normalizedUsername
    ); // First check if user exists regardless of verification status
    const userExists = await UserModel.findOne({
      username: new RegExp(`^${username}$`, "i"), // Case-insensitive match
    });

    if (!userExists) {
      console.log("User not found in database:", username);
      return Response.json(
        {
          success: false,
          message: "User does not exist.",
        },
        { status: 404 }
      );
    }

    // Then check if they're verified
    if (!userExists.isVerified) {
      console.log("User found but not verified:", username);
      return Response.json(
        {
          success: false,
          message: "User exists but is not verified.",
        },
        { status: 404 } // Using same status code to prevent user enumeration
      );
    }

    const user = userExists; // For clarity in the rest of the code

    console.log("User found:", user.username, "Is verified:", user.isVerified);
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting feedback.",
        },
        { status: 403 }
      );
    }

    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);

    await user.save();
    return Response.json(
      {
        success: true,
        message: "Feedback sent successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending feedback:", error);
    return Response.json(
      {
        success: false,
        message: "Error finding user.",
      },
      { status: 500 }
    );
  }
}

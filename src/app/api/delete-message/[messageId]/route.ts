import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized. Please log in.",
      },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);
  const messageId = params.messageId;

  if (!messageId) {
    return Response.json(
      {
        success: false,
        message: "Message ID is required.",
      },
      { status: 400 }
    );
  }

  try {
    // Find user and pull the message with the given ID from the messages array
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      {
        success: false,
        message: "An error occurred while deleting the message.",
      },
      { status: 500 }
    );
  }
}

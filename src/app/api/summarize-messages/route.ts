import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Do NOT use edge runtime (default is fine)
export async function POST(request: Request) {
  try {
    // Parse request body (even though we might not need it)
    const body = await request.json().catch(() => ({}));

    // 1. Connect to the DB
    await dbConnect();

    // 2. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user._id);

    // 3. Fetch messages for the logged-in user
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
          username: { $first: "$username" },
        },
      },
    ]);

    // 4. Handle missing messages
    if (
      !user ||
      user.length === 0 ||
      !user[0].messages ||
      user[0].messages.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "No messages found for this user." },
        { status: 404 }
      );
    }

    const messages = user[0].messages;
    const messageTexts = messages.map((msg: any) => msg.content).join("\n");

    if (!messageTexts || messageTexts.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Not enough message content to generate a summary.",
        },
        { status: 400 }
      );
    }

    // 5. Build prompt for Gemini
    const prompt = `
Summarize the following anonymous messages sent to a user on a messaging platform.
Please identify:
- Main themes or topics in the messages
- Overall tone (positive, negative, neutral, mixed)
- Any frequently asked questions or recurring topics
- Any notable or interesting patterns

Format the summary as 3-5 clear bullet points.
Be concise, insightful, and focus on the most meaningful observations.

Messages:
${messageTexts}
`;

    // 6. Ensure Gemini API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // 7. Call Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summaryText = response.text();

    if (!summaryText) {
      return NextResponse.json(
        { success: false, message: "No output from Gemini" },
        { status: 500 }
      );
    }    // IMPORTANT: useCompletion expects a specific JSON format
    // The format is: { text: "content" }
    // But we need to return it as a proper JSON response
    return new Response(
      JSON.stringify({ text: summaryText }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error summarizing messages:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate summary",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

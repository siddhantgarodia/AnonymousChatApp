import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const runtime = "edge";

export async function POST() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const prompt = `Generate 5 open-ended, friendly, and constructive feedback prompts for a feedback platform. 
Each prompt should be 30-100 characters. Respond ONLY as a JSON array of strings.
Do NOT include any explanation or markdown formatting like \`\`\`json.`; // forcing no markdown

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // ✅ Remove ```json or ``` wrappers if they exist
    if (text.startsWith("```")) {
      text = text.replace(/```(json)?/gi, "").trim(); // remove ``` or ```json
      text = text.replace(/```$/, "").trim(); // remove ending ```
    }

    const questions = JSON.parse(text); // now it's valid JSON

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gemini API failed.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

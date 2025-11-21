import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBDInoxvdkzTRCdZGd0QDy6Umc0Mq2opI0");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
if (!process.env.GEMINI_API_KEY) {
  console.log("no api key found");
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: "Prompt is required." },
        { status: 422 },
      );
    }

    const AIResponse = await model.generateContent([
      prompt +
        "Give me Answer in english only no markdown symbols else the response will be rejected",
    ]);
    const text = AIResponse.response.text();
    return NextResponse.json({ success: true, data: text }, { status: 201 });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process the request." },
      { status: 500 },
    );
  }
}

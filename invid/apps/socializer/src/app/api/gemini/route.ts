import { NextRequest, NextResponse } from "next/server";
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { success: false, message: "Prompt is required." },
                { status: 422 },
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is not set");
            return NextResponse.json(
                { success: false, message: "API configuration error." },
                { status: 500 },
            );
        }

        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: prompt + "\n\nGive me the answer in English only with no markdown symbols.",
            temperature: 0.7,
        });

        return NextResponse.json({ success: true, data: text }, { status: 201 });
    } catch (error: any) {
        console.error("Error generating text:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to process the request." },
            { status: 500 },
        );
    }
}

// TODO: avoid doing it in development mode


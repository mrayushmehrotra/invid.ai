import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { InvidAgent } from "@/lib/agent";
import { canPerformAction, incrementUsage, User } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    // Get user from cookie
    const userId = req.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    await connectDB();

    // Get user's plan
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Check if user can perform this action
    const check = await canPerformAction(
      userId,
      "metadataGenerations",
      user.plan,
    );
    if (!check.allowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Daily limit reached for metadata generation. Resets in 24 hours.",
          limit: check.limit,
          used: check.used,
          remaining: check.remaining,
        },
        { status: 429 },
      );
    }

    const {
      video_topic,
      video_description,
      target_audience,
      keywords,
      structure,
    } = await req.json();

    // video_topic is always required
    if (!video_topic) {
      return NextResponse.json(
        {
          success: false,
          message: "video_topic is required.",
        },
        { status: 422 },
      );
    }

    // Build the query for InvidAgent
    const query = {
      video_topic,
      video_description: video_description || null,
      target_audience: target_audience || "beginners",
      keywords: keywords || [],
      structure: structure || null,
    };

    // Invoke the InvidAgent to generate metadata
    const response = await InvidAgent.invoke({
      messages: [
        {
          role: "user",
          content: JSON.stringify(query),
        },
      ],
    });

    // Extract the response data from the agent
    const responseData = response.messages?.[response.messages.length - 1]?.content || response;

    // Increment usage after successful generation
    await incrementUsage(userId, "metadataGenerations");

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error generating metadata:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to process the request.";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}

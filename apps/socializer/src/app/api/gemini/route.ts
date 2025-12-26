import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const { video_topic, video_description, target_audience, keywords, structure } =
      await req.json();

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

    // If structure is provided, use the dynamic endpoint
    // Example structure: { "title": "" } -> only generates title
    // Example structure: { "title": "", "description": "" } -> generates title and description
    if (structure && typeof structure === "object" && Object.keys(structure).length > 0) {
      const response = await axios.post(
        `${PYTHON_API_URL}/generate/dynamic`,
        {
          video_topic,
          video_description: video_description || null,
          target_audience: target_audience || "beginners",
          keywords: keywords || [],
          structure,
        },
      );

      return NextResponse.json({ success: true, data: response.data }, { status: 200 });
    }

    // Fallback: If no structure provided, generate all metadata (legacy behavior)
    if (!video_description || !target_audience) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Either provide 'structure' for dynamic generation, or provide video_description and target_audience for full metadata.",
        },
        { status: 422 },
      );
    }

    const response = await axios.post(
      `${PYTHON_API_URL}/generate/metadata`,
      {
        video_topic,
        video_description,
        target_audience,
        keywords: keywords || [],
      },
    );

    return NextResponse.json({ success: true, data: response.data }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating metadata:", error);

    // Handle axios errors with more detail
    const errorMessage = error.response?.data?.detail || error.message || "Failed to process the request.";
    const statusCode = error.response?.status || 500;

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: statusCode },
    );
  }
}

// TODO: avoid doing API calls in development mode

import { type NextRequest, NextResponse } from "next/server";

// Stream Speech (Beta) (POST /v1/speech/stream)
export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = "Matthew", model = "FALCON", locale = "en-US" } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    console.log(`Generating speech: Voice=${voiceId}, Model=${model}, Locale=${locale}`);
    console.log("Text preview:", `${text.substring(0, 50)}...`);

    const response = await fetch("https://api.murf.ai/v1/speech/stream", {
      method: "POST",
      headers: {
        "api-key": process.env.MURF_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voiceId: voiceId,
        model: model,
        multiNativeLocale: locale,
      }),
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Murf API Error Response:", errorText);
      return NextResponse.json(
        { error: `Murf API error: ${response.statusText}. ${errorText}` },
        { status: response.status },
      );
    }

    // Handle audio response
    if (contentType?.includes("audio/")) {
      // Get the audio as array buffer
      const audioBuffer = await response.arrayBuffer();
      console.log(
        "Received audio buffer, size:",
        audioBuffer.byteLength,
        "bytes",
      );

      // Convert to base64
      const base64Audio = Buffer.from(audioBuffer).toString("base64");

      // Return as data URL
      const dataUrl = `data:${contentType};base64,${base64Audio}`;

      return NextResponse.json({
        success: true,
        audioFile: dataUrl,
        contentType: contentType,
        size: audioBuffer.byteLength,
      });
    }

    // Handle JSON response (if API returns JSON for some reason)
    if (contentType?.includes("application/json")) {
      const body = await response.json();
      console.log("Murf API JSON Response:", body);
      return NextResponse.json(body);
    }

    // Unknown response type
    const responseText = await response.text();
    console.log(
      "Murf API Unknown Response (first 200 chars):",
      responseText.substring(0, 200),
    );

    return NextResponse.json(
      {
        error: "Unexpected response format from Murf API",
        details: responseText.substring(0, 500),
      },
      { status: 500 },
    );
  } catch (error: any) {
    console.error("Voice generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate speech" },
      { status: 500 },
    );
  }
}

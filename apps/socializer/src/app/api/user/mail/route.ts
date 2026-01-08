import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { subscriberEmail } from "@/lib/prompts";
import { EmailService } from "@/lib/mail-service";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address", details: result.error.issues },
        { status: 400 },
      );
    }

    await EmailService({
      to: result.data.email,
      message: subscriberEmail,
      subject:
        "🎉 Welcome to invid.ai — Let's Create Amazing Content Together!",
    });

    return NextResponse.json(
      { message: "Thanks for subscribing!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email subscription error:", error);
    return NextResponse.json(
      { error: "Failed to send subscription email" },
      { status: 500 },
    );
  }
}

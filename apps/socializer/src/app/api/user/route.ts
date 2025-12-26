import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
    User,
    getDailyUsage,
    USAGE_LIMITS,
    checkSession,
} from "@/lib/models";

export async function GET(request: NextRequest) {
    try {
        const userId = request.cookies.get("user_id")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "Not authenticated", authenticated: false },
                { status: 401 }
            );
        }

        await connectDB();

        // Check if session is valid
        const session = await checkSession(userId);

        if (!session.valid || !session.user) {
            // Clear cookies if session expired
            const response = NextResponse.json(
                { error: "Session expired", authenticated: false, expired: true },
                { status: 401 }
            );
            response.cookies.delete("user_id");
            response.cookies.delete("youtube_access_token");
            return response;
        }

        const user = session.user;

        // Get daily usage
        const dailyUsage = await getDailyUsage(userId);

        // Get limits based on plan
        const limits = USAGE_LIMITS[user.plan];

        return NextResponse.json({
            success: true,
            authenticated: true,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                image: user.image,
                youtubeChannelId: user.youtubeChannelId,
                youtubeChannelName: user.youtubeChannelName,
                youtubeChannelImage: user.youtubeChannelImage,
                youtubeConnectedAt: user.youtubeConnectedAt,
                sessionExpiresAt: user.sessionExpiresAt,
                plan: user.plan,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            usage: {
                metadataGenerations: dailyUsage.metadataGenerations,
                ttsGenerations: dailyUsage.ttsGenerations,
                videoUploads: dailyUsage.videoUploads,
                videoUpdates: dailyUsage.videoUpdates,
                analyticsViews: dailyUsage.analyticsViews,
                date: dailyUsage.date,
            },
            limits: {
                metadataGenerations: limits.metadataGenerations,
                ttsGenerations: limits.ttsGenerations,
                videoUploads: limits.videoUploads,
                videoUpdates: limits.videoUpdates,
                analyticsViews: limits.analyticsViews,
                maxVideosStored: limits.maxVideosStored,
            },
            session: {
                expiresAt: session.expiresAt,
                remainingHours: session.remainingHours,
            },
        });
    } catch (error) {
        console.error("User API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: 500 }
        );
    }
}

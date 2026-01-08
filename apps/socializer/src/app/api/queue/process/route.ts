import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { connectDB } from "@/lib/db";
import { User, incrementUsage } from "@/lib/models";
import {
    dequeueUpload,
    completeUpload,
    failUpload,
    getQueueStats,
} from "@/lib/upload-queue";

// This endpoint processes the upload queue
// Should be called by a cron job or triggered periodically

export async function POST(request: NextRequest) {
    try {
        // Verify this is an authorized call (e.g., from cron or admin)
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Get the next job from the queue (highest priority first)
        const job = await dequeueUpload();

        if (!job) {
            return NextResponse.json({
                success: true,
                message: "No pending jobs in queue",
                processed: 0,
            });
        }

        console.log(`Processing upload job: ${job._id} for user ${job.userId} (${job.userPlan} plan)`);

        try {
            // Get user's YouTube credentials
            const user = await User.findById(job.userId);

            if (!user || !user.youtubeAccessToken) {
                await failUpload(job._id, "User not found or YouTube not connected");
                return NextResponse.json({
                    success: false,
                    error: "User credentials not found",
                    jobId: job._id,
                });
            }

            // Initialize OAuth2 client
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );

            oauth2Client.setCredentials({
                access_token: user.youtubeAccessToken,
                refresh_token: user.youtubeRefreshToken,
            });

            const youtube = google.youtube({ version: "v3", auth: oauth2Client });

            // TODO: Retrieve the video file from storage (S3, temp storage, etc.)
            // For now, this is a placeholder - you need to implement file retrieval
            // const videoBuffer = await retrieveVideoFile(job.videoFileKey);

            // For demonstration, we'll mark as failed if no file retrieval is implemented
            // In production, you'd retrieve the file and upload it

            /*
            const { Readable } = await import("node:stream");
            const stream = Readable.from(videoBuffer);

            const response = await youtube.videos.insert({
                part: ["snippet", "status"],
                requestBody: {
                    snippet: {
                        title: job.title,
                        description: job.description,
                        tags: job.tags,
                    },
                    status: {
                        privacyStatus: job.privacy,
                    },
                },
                media: {
                    body: stream,
                },
            });

            // Mark job as completed
            await completeUpload(job._id, response.data.id!);
            
            // Increment usage
            await incrementUsage(job.userId, "videoUploads");

            return NextResponse.json({
                success: true,
                jobId: job._id,
                youtubeVideoId: response.data.id,
                userPlan: job.userPlan,
            });
            */

            // Placeholder response - remove this when implementing file retrieval
            await failUpload(job._id, "File retrieval not implemented yet");
            return NextResponse.json({
                success: false,
                error: "Queue worker needs file storage implementation",
                jobId: job._id,
            });

        } catch (uploadError: any) {
            console.error(`Upload failed for job ${job._id}:`, uploadError);
            await failUpload(job._id, uploadError.message || "Upload failed");

            return NextResponse.json({
                success: false,
                error: uploadError.message,
                jobId: job._id,
            });
        }

    } catch (error: any) {
        console.error("Queue worker error:", error);
        return NextResponse.json(
            { error: error.message || "Queue worker failed" },
            { status: 500 }
        );
    }
}

// GET endpoint to check queue status
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const stats = await getQueueStats();

        return NextResponse.json({
            success: true,
            stats,
            message: `${stats.pending} pending uploads (Enterprise: ${stats.pendingByPlan.enterprise}, Pro: ${stats.pendingByPlan.pro}, Free: ${stats.pendingByPlan.free})`,
        });
    } catch (error: any) {
        console.error("Queue stats error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get queue stats" },
            { status: 500 }
        );
    }
}

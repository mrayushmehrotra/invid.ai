import { google } from "googleapis";
import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  User,
  canPerformAction,
  incrementUsage,
  getUsageSummary,
  getSessionExpiryDate,
  checkSession,
  USAGE_LIMITS
} from "@/lib/models";

/**
 * Sanitize tags for YouTube API requirements
 */
function sanitizeTags(tags: string[]): string[] {
  if (!tags || !Array.isArray(tags)) return [];

  const sanitized: string[] = [];
  let totalLength = 0;
  const maxTotalLength = 500;

  for (const tag of tags) {
    let cleanTag = tag
      .replace(/#/g, "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanTag) continue;
    if (cleanTag.length > 30) {
      cleanTag = cleanTag.substring(0, 30).trim();
    }

    const tagLength = cleanTag.length + (sanitized.length > 0 ? 1 : 0);
    if (totalLength + tagLength > maxTotalLength) break;

    sanitized.push(cleanTag);
    totalLength += tagLength;
  }

  return sanitized;
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const code = searchParams.get("code");

  if (action === "auth") {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Force to get refresh token
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
      ],
    });
    return NextResponse.json({ authUrl });
  }

  if (action === "callback" && code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const html = `
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, window.location.origin);
              window.close();
            </script>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (_error) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let action, accessToken, data, userId;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      action = formData.get("action") as string;
      accessToken = formData.get("accessToken") as string;
      userId = formData.get("userId") as string;
      data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        tags: (formData.get("tags") as string)?.split(",").map((t) => t.trim()) || [],
        privacy: formData.get("privacy") as string,
        videoFile: formData.get("videoFile") as File,
      };
    } else {
      const jsonBody = await request.json();
      action = jsonBody.action;
      accessToken = jsonBody.accessToken;
      userId = jsonBody.userId;
      const { action: _a, accessToken: _at, userId: _uid, ...rest } = jsonBody;
      data = rest;
    }

    // =====================================================
    // ACTION: Exchange Code & Save User to Database
    // =====================================================
    if (action === "exchangeCode") {
      const { code } = data;
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfoResponse = await oauth2.userinfo.get();
      const userInfo = userInfoResponse.data;

      // Get YouTube channel info
      const youtube = google.youtube({ version: "v3", auth: oauth2Client });
      const channelResponse = await youtube.channels.list({
        part: ["snippet", "statistics"],
        mine: true,
      });
      const channel = channelResponse.data.items?.[0];

      // Save user to MongoDB
      await connectDB();

      // Session expires in 24 hours
      const sessionExpiresAt = getSessionExpiryDate();

      const existingUser = await User.findOne({ email: userInfo.email });

      let user;
      if (existingUser) {
        // Update existing user with new YouTube tokens
        user = await User.findByIdAndUpdate(
          existingUser._id,
          {
            $set: {
              name: userInfo.name,
              image: userInfo.picture,
              youtubeChannelId: channel?.id,
              youtubeChannelName: channel?.snippet?.title,
              youtubeChannelImage: channel?.snippet?.thumbnails?.default?.url,
              youtubeAccessToken: tokens.access_token,
              youtubeRefreshToken: tokens.refresh_token || existingUser.youtubeRefreshToken,
              youtubeConnectedAt: new Date(),
              sessionExpiresAt: sessionExpiresAt,
            },
          },
          { new: true }
        );
      } else {
        // Create new user
        user = await User.create({
          _id: crypto.randomUUID(),
          email: userInfo.email!,
          name: userInfo.name,
          image: userInfo.picture,
          youtubeChannelId: channel?.id,
          youtubeChannelName: channel?.snippet?.title,
          youtubeChannelImage: channel?.snippet?.thumbnails?.default?.url,
          youtubeAccessToken: tokens.access_token,
          youtubeRefreshToken: tokens.refresh_token,
          youtubeConnectedAt: new Date(),
          sessionExpiresAt: sessionExpiresAt,
          plan: "free",
        });
      }

      const response = NextResponse.json({
        success: true,
        tokens,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          plan: user.plan,
          youtubeChannelId: user.youtubeChannelId,
          youtubeChannelName: user.youtubeChannelName,
          youtubeChannelImage: user.youtubeChannelImage,
          sessionExpiresAt: user.sessionExpiresAt,
        }
      });

      if (tokens.access_token) {
        // Set cookies to expire with session (24 hours)
        response.cookies.set("youtube_access_token", tokens.access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24, // 24 hours
        });
        response.cookies.set("user_id", user._id, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24, // 24 hours
        });
      }

      return response;
    }

    // =====================================================
    // ACTION: Check Session (is user still logged in?)
    // =====================================================
    if (action === "checkSession") {
      if (!userId) {
        return NextResponse.json({ valid: false, error: "User ID required" }, { status: 400 });
      }

      await connectDB();
      const session = await checkSession(userId);

      if (!session.valid) {
        return NextResponse.json({
          valid: false,
          error: "Session expired. Please reconnect your YouTube account.",
          expired: true
        });
      }

      return NextResponse.json({
        success: true,
        valid: true,
        user: session.user ? {
          id: session.user._id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          plan: session.user.plan,
          youtubeChannelId: session.user.youtubeChannelId,
          youtubeChannelName: session.user.youtubeChannelName,
        } : null,
        expiresAt: session.expiresAt,
        remainingHours: session.remainingHours,
      });
    }

    // =====================================================
    // ACTION: Get Usage Summary
    // =====================================================
    if (action === "getUsage") {
      if (!userId) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
      }

      await connectDB();
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const usage = await getUsageSummary(userId, user.plan);
      return NextResponse.json({ success: true, ...usage });
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 401 },
      );
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });

    // Get user's plan for limit checks
    let userPlan: "free" | "pro" | "enterprise" = "free";
    if (userId) {
      await connectDB();
      const user = await User.findById(userId);
      if (user) userPlan = user.plan;
    }

    // =====================================================
    // ACTION: Update Video (with usage limit)
    // =====================================================
    if (action === "updateVideo") {
      // Check usage limit
      if (userId) {
        const check = await canPerformAction(userId, "videoUpdates", userPlan);
        if (!check.allowed) {
          return NextResponse.json({
            success: false,
            error: `Daily limit reached (${check.limit} updates/day). Upgrade to Pro for more.`,
            limitReached: true,
            usage: check,
          }, { status: 429 });
        }
      }

      try {
        if (!data.videoId) {
          return NextResponse.json(
            { success: false, error: "Video ID is required" },
            { status: 400 },
          );
        }

        if (!data.title || data.title.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: "Title is required" },
            { status: 400 },
          );
        }

        const currentVideo = await youtube.videos.list({
          part: ["snippet"],
          id: [data.videoId],
        });

        const currentSnippet = currentVideo.data.items?.[0]?.snippet;
        if (!currentSnippet) {
          return NextResponse.json(
            { success: false, error: "Video not found" },
            { status: 404 },
          );
        }

        const response = await youtube.videos.update({
          part: ["snippet"],
          requestBody: {
            id: data.videoId,
            snippet: {
              ...currentSnippet,
              title: data.title,
              description: data.description || "",
              tags: sanitizeTags(data.tags || []),
              categoryId: currentSnippet.categoryId,
            },
          },
        });

        // Increment usage
        if (userId) {
          await incrementUsage(userId, "videoUpdates");
        }

        return NextResponse.json({ success: true, data: response.data });
      } catch (error: any) {
        console.error("Update Video Error:", error);
        const errorMessage =
          error.response?.data?.error?.message ||
          error.message ||
          "Failed to update video";
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: error.response?.status || 500 },
        );
      }
    }

    // =====================================================
    // ACTION: Upload Video (with usage limit)
    // =====================================================
    if (action === "uploadVideo") {
      // Check usage limit
      if (userId) {
        const check = await canPerformAction(userId, "videoUploads", userPlan);
        if (!check.allowed) {
          return NextResponse.json({
            success: false,
            error: `Daily limit reached (${check.limit} uploads/day). Upgrade to Pro for more.`,
            limitReached: true,
            usage: check,
          }, { status: 429 });
        }
      }

      if (!data.videoFile) {
        return NextResponse.json(
          { error: "No video file provided" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await data.videoFile.arrayBuffer());
      const { Readable } = await import("node:stream");
      const stream = Readable.from(buffer);

      const response = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: data.title,
            description: data.description,
            tags: sanitizeTags(data.tags || []),
          },
          status: {
            privacyStatus: data.privacy || "private",
          },
        },
        media: {
          body: stream,
        },
      });

      // Increment usage
      if (userId) {
        await incrementUsage(userId, "videoUploads");
      }

      return NextResponse.json({ success: true, videoId: response.data.id });
    }

    // =====================================================
    // ACTION: Get Channel Data (with free tier video limit)
    // =====================================================
    if (action === "getChannelData") {
      const channelResponse = await youtube.channels.list({
        part: ["snippet", "statistics", "brandingSettings", "contentDetails"],
        mine: true,
      });

      const channel = channelResponse.data.items?.[0];
      const uploadsPlaylistId =
        channel?.contentDetails?.relatedPlaylists?.uploads;

      // Get video limit based on plan
      const maxVideos = USAGE_LIMITS[userPlan].maxVideosStored;

      let recentVideos: any[] = [];
      if (uploadsPlaylistId) {
        const videosResponse = await youtube.playlistItems.list({
          part: ["snippet", "status"],
          playlistId: uploadsPlaylistId,
          maxResults: maxVideos === -1 ? 50 : Math.min(maxVideos, 50),
        });

        const playlistItems = videosResponse.data.items || [];

        const videoIds = playlistItems
          .map((item: any) => item.snippet?.resourceId?.videoId)
          .filter(Boolean);

        if (videoIds.length > 0) {
          const statsResponse = await youtube.videos.list({
            part: ["statistics", "contentDetails"],
            id: videoIds,
          });

          const videoStats = statsResponse.data.items || [];
          const statsMap = new Map(
            videoStats.map((video: any) => [video.id, video]),
          );

          recentVideos = playlistItems.map((item: any) => {
            const videoId = item.snippet?.resourceId?.videoId;
            const stats = statsMap.get(videoId);
            return {
              ...item,
              statistics: stats?.statistics,
              contentDetails: stats?.contentDetails,
            };
          });
        } else {
          recentVideos = playlistItems;
        }
      }

      return NextResponse.json({
        success: true,
        channel: channel,
        recentVideos: recentVideos,
        plan: userPlan,
        videoLimit: maxVideos,
      });
    }

    // =====================================================
    // ACTION: Get Analytics (with usage limit)
    // =====================================================
    if (action === "getAnalytics") {
      // Check usage limit
      if (userId) {
        const check = await canPerformAction(userId, "analyticsViews", userPlan);
        if (!check.allowed) {
          return NextResponse.json({
            success: false,
            error: `Daily limit reached (${check.limit} analytics views/day). Upgrade to Pro for unlimited.`,
            limitReached: true,
            usage: check,
          }, { status: 429 });
        }
        await incrementUsage(userId, "analyticsViews");
      }

      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const channelResponse = await youtube.channels.list({
        part: ["id"],
        mine: true,
      });

      const channelId = channelResponse.data.items?.[0]?.id;

      if (!channelId) {
        return NextResponse.json(
          { error: "Channel not found" },
          { status: 404 },
        );
      }

      const analyticsResponse = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics:
          "views,estimatedMinutesWatched,averageViewDuration,subscribersGained",
        dimensions: "day",
      });

      const overviewResponse = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics:
          "views,estimatedMinutesWatched,likes,comments,shares,subscribersGained",
      });

      return NextResponse.json({
        success: true,
        dailyStats: analyticsResponse.data,
        overview: overviewResponse.data,
      });
    }

    // =====================================================
    // ACTION: Get Video Analytics
    // =====================================================
    if (action === "getVideoAnalytics") {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const response = await youtubeAnalytics.reports.query({
        ids: `video==${data.videoId}`,
        startDate,
        endDate,
        metrics:
          "views,likes,dislikes,comments,shares,estimatedMinutesWatched,averageViewDuration",
      });

      return NextResponse.json({ success: true, data: response.data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}

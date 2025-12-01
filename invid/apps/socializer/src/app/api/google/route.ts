import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

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
      scope: [
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

      // Return HTML that sends tokens back to opener
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
        headers: { 'Content-Type': 'text/html' },
      });
    } catch (error) {
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

    let action, accessToken, data;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      action = formData.get("action") as string;
      accessToken = formData.get("accessToken") as string;
      data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        tags: (formData.get("tags") as string)?.split(",").map(t => t.trim()) || [],
        privacy: formData.get("privacy") as string,
        videoFile: formData.get("videoFile") as File,
      };
    } else {
      const jsonBody = await request.json();
      action = jsonBody.action;
      accessToken = jsonBody.accessToken;
      const { action: _a, accessToken: _at, ...rest } = jsonBody;
      data = rest;
    }

    if (action === "exchangeCode") {
      const { code } = data;
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      return NextResponse.json({ success: true, tokens });
    }

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });

    if (action === "updateVideo") {
      try {
        if (!data.videoId) {
          return NextResponse.json({ success: false, error: "Video ID is required" }, { status: 400 });
        }

        if (!data.title || data.title.trim().length === 0) {
          return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
        }

        // First, get the current video data to preserve categoryId and other fields
        const currentVideo = await youtube.videos.list({
          part: ["snippet"],
          id: [data.videoId],
        });

        const currentSnippet = currentVideo.data.items?.[0]?.snippet;
        if (!currentSnippet) {
          return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 });
        }

        // Update the video with merged data
        const response = await youtube.videos.update({
          part: ["snippet"],
          requestBody: {
            id: data.videoId,
            snippet: {
              ...currentSnippet, // Preserve existing data
              title: data.title,
              description: data.description || "",
              tags: data.tags && data.tags.length > 0 ? data.tags : [],
              categoryId: currentSnippet.categoryId, // Required by YouTube API
            },
          },
        });

        return NextResponse.json({ success: true, data: response.data });
      } catch (error: any) {
        console.error("Update Video Error:", error);
        const errorMessage = error.response?.data?.error?.message || error.message || "Failed to update video";
        return NextResponse.json({ success: false, error: errorMessage }, { status: error.response?.status || 500 });
      }
    }

    if (action === "uploadVideo") {
      if (!data.videoFile) {
        return NextResponse.json({ error: "No video file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await data.videoFile.arrayBuffer());
      const { Readable } = await import("stream");
      const stream = Readable.from(buffer);

      const response = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: data.title,
            description: data.description,
            tags: data.tags,
          },
          status: {
            privacyStatus: data.privacy || "private",
          },
        },
        media: {
          body: stream,
        },
      });
      return NextResponse.json({ success: true, videoId: response.data.id });
    }

    if (action === "getChannelData") {
      const channelResponse = await youtube.channels.list({
        part: ["snippet", "statistics", "brandingSettings", "contentDetails"],
        mine: true,
      });

      const channel = channelResponse.data.items?.[0];
      const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;

      let recentVideos: any[] = [];
      if (uploadsPlaylistId) {
        const videosResponse = await youtube.playlistItems.list({
          part: ["snippet", "status"],
          playlistId: uploadsPlaylistId,
          maxResults: 50,
        });

        const playlistItems = videosResponse.data.items || [];

        // Extract video IDs to fetch statistics
        const videoIds = playlistItems
          .map((item: any) => item.snippet?.resourceId?.videoId)
          .filter(Boolean);

        if (videoIds.length > 0) {
          // Fetch video statistics (including view counts)
          const statsResponse = await youtube.videos.list({
            part: ["statistics", "contentDetails"],
            id: videoIds,
          });

          const videoStats = statsResponse.data.items || [];

          // Create a map of videoId to statistics
          const statsMap = new Map(
            videoStats.map((video: any) => [video.id, video])
          );

          // Merge statistics with playlist items
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
      });
    }

    if (action === "getAnalytics") {
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

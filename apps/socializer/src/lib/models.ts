import mongoose, { Schema, Document, Model } from "mongoose";

// ===========================================
// CONSTANTS
// ===========================================
export const AUTH_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// ===========================================
// USER MODEL - Stores when user connects YouTube
// ===========================================
export interface IUser extends Document<string> {
    _id: string;
    // Basic info from Google OAuth
    email: string;
    name?: string;
    image?: string;

    // YouTube connection data
    youtubeChannelId?: string;
    youtubeChannelName?: string;
    youtubeChannelImage?: string;
    youtubeAccessToken?: string;
    youtubeRefreshToken?: string;
    youtubeConnectedAt?: Date;

    // Session/Auth (expires after 24 hours)
    sessionExpiresAt?: Date;

    // Subscription & Limits
    plan: "free" | "pro" | "enterprise";

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        _id: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        name: { type: String },
        image: { type: String },

        // YouTube connection
        youtubeChannelId: { type: String },
        youtubeChannelName: { type: String },
        youtubeChannelImage: { type: String },
        youtubeAccessToken: { type: String },
        youtubeRefreshToken: { type: String },
        youtubeConnectedAt: { type: Date },

        // Session expiry (24 hours)
        sessionExpiresAt: { type: Date },

        // Plan
        plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },

    },
    { timestamps: true }
);

// ===========================================
// DAILY USAGE MODEL - Track usage limits
// ===========================================
export interface IDailyUsage extends Document {
    userId: string;
    date: string; // Format: YYYY-MM-DD

    // Feature usage counts
    metadataGenerations: number;
    ttsGenerations: number;
    videoUploads: number;
    videoUpdates: number;
    analyticsViews: number;

    createdAt: Date;
    updatedAt: Date;
}

const dailyUsageSchema = new Schema<IDailyUsage>(
    {
        userId: { type: String, required: true, index: true },
        date: { type: String, required: true },

        metadataGenerations: { type: Number, default: 0 },
        ttsGenerations: { type: Number, default: 0 },
        videoUploads: { type: Number, default: 0 },
        videoUpdates: { type: Number, default: 0 },
        analyticsViews: { type: Number, default: 0 },
    },
    { timestamps: true }
);

dailyUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

// ===========================================
// USAGE LIMITS CONFIGURATION
// ===========================================
export const USAGE_LIMITS = {
    free: {
        metadataGenerations: 3,
        ttsGenerations: 1,
        videoUploads: 1,
        videoUpdates: 3,
        analyticsViews: 5,
        maxVideosStored: 5,
    },
    pro: {
        metadataGenerations: 10,
        ttsGenerations: 10,
        videoUploads: 5,
        videoUpdates: 10,
        analyticsViews: 10,
        maxVideosStored: 100,
    },
    enterprise: {
        metadataGenerations: -1,
        ttsGenerations: -1,
        videoUploads: -1,
        videoUpdates: -1,
        analyticsViews: -1,
        maxVideosStored: -1,
    },
} as const;

// ===========================================
// CREATE MODELS
// ===========================================
export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export const DailyUsage: Model<IDailyUsage> =
    mongoose.models.DailyUsage || mongoose.model<IDailyUsage>("DailyUsage", dailyUsageSchema);

// ===========================================
// SESSION/AUTH HELPER FUNCTIONS (24 hour expiry)
// ===========================================

/**
 * Calculate session expiry date (24 hours from now)
 */
export function getSessionExpiryDate(): Date {
    return new Date(Date.now() + AUTH_SESSION_DURATION);
}

/**
 * Check if user's session is still valid (not expired)
 */
export function isSessionValid(user: IUser): boolean {
    if (!user.sessionExpiresAt) return false;
    return new Date() < new Date(user.sessionExpiresAt);
}

/**
 * Check if user session is valid and return detailed status
 */
export async function checkSession(userId: string): Promise<{
    valid: boolean;
    user: IUser | null;
    expiresAt: Date | null;
    remainingMs: number;
    remainingHours: number;
}> {
    const user = await User.findById(userId);

    if (!user) {
        return { valid: false, user: null, expiresAt: null, remainingMs: 0, remainingHours: 0 };
    }

    if (!user.sessionExpiresAt) {
        return { valid: false, user, expiresAt: null, remainingMs: 0, remainingHours: 0 };
    }

    const now = Date.now();
    const expiresAt = new Date(user.sessionExpiresAt).getTime();
    const remainingMs = Math.max(0, expiresAt - now);
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const valid = remainingMs > 0;

    return { valid, user, expiresAt: user.sessionExpiresAt, remainingMs, remainingHours };
}

/**
 * Refresh user's session (extend by 24 hours)
 */
export async function refreshSession(userId: string): Promise<IUser | null> {
    const newExpiresAt = getSessionExpiryDate();

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { sessionExpiresAt: newExpiresAt } },
        { new: true }
    );

    return user;
}

/**
 * Invalidate user's session (logout)
 */
export async function invalidateSession(userId: string): Promise<void> {
    await User.findByIdAndUpdate(
        userId,
        { $set: { sessionExpiresAt: null, youtubeAccessToken: null } }
    );
}

// ===========================================
// USAGE HELPER FUNCTIONS
// ===========================================

export function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}

export async function getDailyUsage(userId: string): Promise<IDailyUsage> {
    const today = getTodayDate();

    let usage = await DailyUsage.findOne({ userId, date: today });

    if (!usage) {
        usage = await DailyUsage.create({
            userId,
            date: today,
            metadataGenerations: 0,
            ttsGenerations: 0,
            videoUploads: 0,
            videoUpdates: 0,
            analyticsViews: 0,
        });
    }

    return usage;
}

export async function canPerformAction(
    userId: string,
    action: keyof Omit<typeof USAGE_LIMITS.free, "maxVideosStored">,
    userPlan: "free" | "pro" | "enterprise" = "free"
): Promise<{ allowed: boolean; remaining: number; limit: number; used: number }> {
    const usage = await getDailyUsage(userId);
    const limits = USAGE_LIMITS[userPlan];
    const limit = limits[action];
    const used = usage[action];

    if (limit === -1) {
        return { allowed: true, remaining: -1, limit: -1, used };
    }

    const remaining = Math.max(0, limit - used);
    return { allowed: used < limit, remaining, limit, used };
}

export async function incrementUsage(
    userId: string,
    action: keyof Omit<typeof USAGE_LIMITS.free, "maxVideosStored">
): Promise<IDailyUsage> {
    const today = getTodayDate();

    const usage = await DailyUsage.findOneAndUpdate(
        { userId, date: today },
        { $inc: { [action]: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return usage;
}

export async function getUsageSummary(userId: string, userPlan: "free" | "pro" | "enterprise" = "free") {
    const usage = await getDailyUsage(userId);
    const limits = USAGE_LIMITS[userPlan];

    return {
        date: usage.date,
        plan: userPlan,
        usage: {
            metadataGenerations: {
                used: usage.metadataGenerations,
                limit: limits.metadataGenerations,
                remaining: limits.metadataGenerations === -1 ? -1 : Math.max(0, limits.metadataGenerations - usage.metadataGenerations),
            },
            ttsGenerations: {
                used: usage.ttsGenerations,
                limit: limits.ttsGenerations,
                remaining: limits.ttsGenerations === -1 ? -1 : Math.max(0, limits.ttsGenerations - usage.ttsGenerations),
            },
            videoUploads: {
                used: usage.videoUploads,
                limit: limits.videoUploads,
                remaining: limits.videoUploads === -1 ? -1 : Math.max(0, limits.videoUploads - usage.videoUploads),
            },
            videoUpdates: {
                used: usage.videoUpdates,
                limit: limits.videoUpdates,
                remaining: limits.videoUpdates === -1 ? -1 : Math.max(0, limits.videoUpdates - usage.videoUpdates),
            },
            analyticsViews: {
                used: usage.analyticsViews,
                limit: limits.analyticsViews,
                remaining: limits.analyticsViews === -1 ? -1 : Math.max(0, limits.analyticsViews - usage.analyticsViews),
            },
        },
    };
}

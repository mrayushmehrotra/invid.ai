"use client";

import { atom, selector } from "recoil";

// ===========================================
// USER STATE TYPES
// ===========================================
export interface UserState {
    _id: string;
    email: string;
    name?: string;
    image?: string;
    youtubeChannelId?: string;
    youtubeChannelName?: string;
    youtubeChannelImage?: string;
    youtubeConnectedAt?: string;
    sessionExpiresAt?: string;
    plan: "free" | "pro" | "enterprise";
    createdAt: string;
    updatedAt: string;
}

export interface UsageState {
    metadataGenerations: number;
    ttsGenerations: number;
    videoUploads: number;
    videoUpdates: number;
    analyticsViews: number;
    date: string;
}

export interface UsageLimits {
    metadataGenerations: number;
    ttsGenerations: number;
    videoUploads: number;
    videoUpdates: number;
    analyticsViews: number;
    maxVideosStored: number;
}

// ===========================================
// ATOMS
// ===========================================

// User atom - stores user profile data
export const userAtom = atom<UserState | null>({
    key: "userAtom",
    default: null,
});

// User loading state
export const userLoadingAtom = atom<boolean>({
    key: "userLoadingAtom",
    default: true,
});

// Daily usage atom - stores today's usage
export const usageAtom = atom<UsageState | null>({
    key: "usageAtom",
    default: null,
});

// Usage limits based on plan
export const usageLimitsAtom = atom<UsageLimits>({
    key: "usageLimitsAtom",
    default: {
        metadataGenerations: 3,
        ttsGenerations: 1,
        videoUploads: 1,
        videoUpdates: 3,
        analyticsViews: 5,
        maxVideosStored: 5,
    },
});

// ===========================================
// SELECTORS
// ===========================================

// Computed total usage for the progress bar
export const totalUsageSelector = selector({
    key: "totalUsageSelector",
    get: ({ get }) => {
        const usage = get(usageAtom);
        const limits = get(usageLimitsAtom);

        if (!usage) {
            return { used: 0, limit: 0, percentage: 0 };
        }

        // Sum up all usage types (excluding unlimited -1 values)
        const usedTotal =
            usage.metadataGenerations +
            usage.ttsGenerations +
            usage.videoUploads +
            usage.videoUpdates +
            usage.analyticsViews;

        // Sum up limits (treating -1 as 0 for calculation purposes)
        const limitTotal =
            (limits.metadataGenerations === -1 ? 0 : limits.metadataGenerations) +
            (limits.ttsGenerations === -1 ? 0 : limits.ttsGenerations) +
            (limits.videoUploads === -1 ? 0 : limits.videoUploads) +
            (limits.videoUpdates === -1 ? 0 : limits.videoUpdates) +
            (limits.analyticsViews === -1 ? 0 : limits.analyticsViews);

        const percentage = limitTotal > 0 ? (usedTotal / limitTotal) * 100 : 0;

        return {
            used: usedTotal,
            limit: limitTotal,
            percentage: Math.min(percentage, 100),
        };
    },
});

// Detailed usage breakdown
export const usageBreakdownSelector = selector({
    key: "usageBreakdownSelector",
    get: ({ get }) => {
        const usage = get(usageAtom);
        const limits = get(usageLimitsAtom);

        if (!usage) {
            return null;
        }

        return {
            metadataGenerations: {
                used: usage.metadataGenerations,
                limit: limits.metadataGenerations,
                remaining:
                    limits.metadataGenerations === -1
                        ? -1
                        : Math.max(0, limits.metadataGenerations - usage.metadataGenerations),
            },
            ttsGenerations: {
                used: usage.ttsGenerations,
                limit: limits.ttsGenerations,
                remaining:
                    limits.ttsGenerations === -1
                        ? -1
                        : Math.max(0, limits.ttsGenerations - usage.ttsGenerations),
            },
            videoUploads: {
                used: usage.videoUploads,
                limit: limits.videoUploads,
                remaining:
                    limits.videoUploads === -1
                        ? -1
                        : Math.max(0, limits.videoUploads - usage.videoUploads),
            },
            videoUpdates: {
                used: usage.videoUpdates,
                limit: limits.videoUpdates,
                remaining:
                    limits.videoUpdates === -1
                        ? -1
                        : Math.max(0, limits.videoUpdates - usage.videoUpdates),
            },
            analyticsViews: {
                used: usage.analyticsViews,
                limit: limits.analyticsViews,
                remaining:
                    limits.analyticsViews === -1
                        ? -1
                        : Math.max(0, limits.analyticsViews - usage.analyticsViews),
            },
        };
    },
});

// User display info selector
export const userDisplaySelector = selector({
    key: "userDisplaySelector",
    get: ({ get }) => {
        const user = get(userAtom);

        if (!user) {
            return {
                name: "Guest",
                email: "",
                initial: "G",
                image: null,
                plan: "free" as const,
            };
        }

        return {
            name: user.name || user.youtubeChannelName || "User",
            email: user.email,
            initial: (user.name || user.email || "U")[0].toUpperCase(),
            image: user.youtubeChannelImage || user.image || null,
            plan: user.plan,
        };
    },
});

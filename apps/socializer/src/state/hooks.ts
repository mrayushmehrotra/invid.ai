"use client";

import { useEffect, useCallback } from "react";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import {
    userAtom,
    userLoadingAtom,
    usageAtom,
    usageLimitsAtom,
    type UserState,
    type UsageState,
    type UsageLimits,
} from "./atoms";

interface UserDataResponse {
    success: boolean;
    authenticated: boolean;
    user: UserState;
    usage: UsageState;
    limits: UsageLimits;
    session: {
        expiresAt: string;
        remainingHours: number;
    };
}

export function useUserData() {
    const [user, setUser] = useRecoilState(userAtom);
    const [isLoading, setIsLoading] = useRecoilState(userLoadingAtom);
    const setUsage = useSetRecoilState(usageAtom);
    const setLimits = useSetRecoilState(usageLimitsAtom);

    const fetchUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/user", {
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Not authenticated or session expired
                    setUser(null);
                    setUsage(null);
                    return { authenticated: false };
                }
                throw new Error("Failed to fetch user data");
            }

            const data: UserDataResponse = await response.json();

            if (data.success && data.authenticated) {
                setUser(data.user);
                setUsage(data.usage);
                setLimits(data.limits);
                return { authenticated: true, user: data.user };
            } else {
                setUser(null);
                setUsage(null);
                return { authenticated: false };
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
            setUsage(null);
            return { authenticated: false, error };
        } finally {
            setIsLoading(false);
        }
    }, [setUser, setUsage, setLimits, setIsLoading]);

    const refreshUsage = useCallback(async () => {
        try {
            const response = await fetch("/api/user", {
                credentials: "include",
            });

            if (response.ok) {
                const data: UserDataResponse = await response.json();
                if (data.success) {
                    setUsage(data.usage);
                }
            }
        } catch (error) {
            console.error("Error refreshing usage:", error);
        }
    }, [setUsage]);

    return {
        user,
        isLoading,
        fetchUserData,
        refreshUsage,
    };
}

// Hook to initialize user data on mount
export function useInitializeUser() {
    const { fetchUserData, isLoading } = useUserData();

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    return { isLoading };
}

// Types for usage actions
export type UsageAction =
    | "metadataGenerations"
    | "ttsGenerations"
    | "videoUploads"
    | "videoUpdates"
    | "analyticsViews";

// Hook to check if a specific action can be performed
export function useCanPerformAction(action: UsageAction) {
    const usage = useRecoilValue(usageAtom);
    const limits = useRecoilValue(usageLimitsAtom);
    const isLoading = useRecoilValue(userLoadingAtom);

    const used = usage?.[action] ?? 0;
    const limit = limits[action];

    // -1 means unlimited
    const isUnlimited = limit === -1;
    const remaining = isUnlimited ? -1 : Math.max(0, limit - used);
    const allowed = isUnlimited || used < limit;
    const percentage = isUnlimited ? 0 : (used / limit) * 100;

    return {
        allowed,
        used,
        limit,
        remaining,
        isUnlimited,
        percentage,
        isLoading,
    };
}

// Hook to get all usage limits at once
export function useUsageLimits() {
    const usage = useRecoilValue(usageAtom);
    const limits = useRecoilValue(usageLimitsAtom);
    const isLoading = useRecoilValue(userLoadingAtom);

    const getActionStatus = (action: UsageAction) => {
        const used = usage?.[action] ?? 0;
        const limit = limits[action];
        const isUnlimited = limit === -1;
        const remaining = isUnlimited ? -1 : Math.max(0, limit - used);
        const allowed = isUnlimited || used < limit;

        return { allowed, used, limit, remaining, isUnlimited };
    };

    return {
        isLoading,
        metadataGenerations: getActionStatus("metadataGenerations"),
        ttsGenerations: getActionStatus("ttsGenerations"),
        videoUploads: getActionStatus("videoUploads"),
        videoUpdates: getActionStatus("videoUpdates"),
        analyticsViews: getActionStatus("analyticsViews"),
    };
}

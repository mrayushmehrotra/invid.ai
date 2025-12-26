// =====================================================
// DATABASE USAGE EXAMPLES
// =====================================================
// This file shows how to use the new Mongoose models
// with MongoDB for the invid.ai application.

import { connectDB } from "@/lib/db";
import {
    User,
    DailyUsage,
    canPerformAction,
    incrementUsage,
    getUsageSummary,
    USAGE_LIMITS
} from "@/lib/models";

// =====================================================
// Example: Check if user can perform an action
// =====================================================
async function checkMetadataGeneration(userId: string) {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const check = await canPerformAction(userId, "metadataGenerations", user.plan);

    if (!check.allowed) {
        console.log(`❌ Limit reached: ${check.used}/${check.limit} used`);
        return false;
    }

    console.log(`✅ Allowed: ${check.remaining} remaining`);
    return true;
}

// =====================================================
// Example: Perform action with limit check
// =====================================================
async function generateMetadata(userId: string, prompt: string) {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Check limit first
    const check = await canPerformAction(userId, "metadataGenerations", user.plan);
    if (!check.allowed) {
        return {
            error: "Daily limit reached",
            upgrade: true,
            limit: check.limit,
            used: check.used
        };
    }

    // Perform the action...
    const result = `Generated metadata for: ${prompt}`;

    // Increment usage counter
    await incrementUsage(userId, "metadataGenerations");

    return { success: true, result };
}

// =====================================================
// Example: Get user's usage summary
// =====================================================
async function getUserUsageSummary(userId: string) {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) return null;

    const summary = await getUsageSummary(userId, user.plan);

    console.log(`
    📊 Usage Summary for ${user.name} (${user.plan} plan)
    ────────────────────────────────────────
    📝 Metadata Generations: ${summary.usage.metadataGenerations.used}/${summary.usage.metadataGenerations.limit}
    🎤 TTS Generations: ${summary.usage.ttsGenerations.used}/${summary.usage.ttsGenerations.limit}
    📤 Video Uploads: ${summary.usage.videoUploads.used}/${summary.usage.videoUploads.limit}
    ✏️ Video Updates: ${summary.usage.videoUpdates.used}/${summary.usage.videoUpdates.limit}
    📈 Analytics Views: ${summary.usage.analyticsViews.used}/${summary.usage.analyticsViews.limit}
  `);

    return summary;
}

// =====================================================
// Example: Find user by email
// =====================================================
async function findUserByEmail(email: string) {
    await connectDB();
    return await User.findOne({ email });
}

// =====================================================
// Example: Update user's plan
// =====================================================
async function upgradeUserPlan(userId: string, newPlan: "pro" | "enterprise") {
    await connectDB();

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { plan: newPlan } },
        { new: true }
    );

    console.log(`✅ Upgraded ${user?.name} to ${newPlan} plan`);
    return user;
}

// =====================================================
// Usage Limits Reference
// =====================================================
console.log("📋 Usage Limits:");
console.log(USAGE_LIMITS);

/*
  LIMITS:
  
  FREE PLAN:
  - 5 metadata generations/day
  - 3 TTS generations/day  
  - 1 video upload/day
  - 5 video updates/day
  - 10 analytics views/day
  - See only last 10 videos
  
  PRO PLAN:
  - 50 metadata generations/day
  - 30 TTS generations/day
  - 10 video uploads/day
  - 50 video updates/day
  - Unlimited analytics
  - See last 100 videos
  
  ENTERPRISE PLAN:
  - Unlimited everything
*/

export {
    checkMetadataGeneration,
    generateMetadata,
    getUserUsageSummary,
    findUserByEmail,
    upgradeUserPlan
};

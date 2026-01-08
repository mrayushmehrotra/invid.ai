import mongoose, { Schema, Document, Model } from "mongoose";

// ===========================================
// UPLOAD JOB MODEL - Priority Queue for Video Uploads
// ===========================================

export interface IUploadJob extends Document {
    _id: string;
    userId: string;
    userPlan: "free" | "pro" | "enterprise";
    priority: number; // 1=free, 2=pro, 3=enterprise
    status: "pending" | "processing" | "completed" | "failed";

    // Upload data
    title: string;
    description: string;
    tags: string[];
    privacy: "private" | "public" | "unlisted";
    videoFileKey: string; // Reference to stored file (e.g., S3 key or temp path)
    videoFileName: string;
    videoFileSize: number;

    // YouTube response
    youtubeVideoId?: string;
    error?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

const uploadJobSchema = new Schema<IUploadJob>(
    {
        _id: { type: String, required: true },
        userId: { type: String, required: true, index: true },
        userPlan: { type: String, enum: ["free", "pro", "enterprise"], required: true },
        priority: { type: Number, required: true, index: true }, // Higher = processed first
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
            index: true
        },

        title: { type: String, required: true },
        description: { type: String, default: "" },
        tags: [{ type: String }],
        privacy: { type: String, enum: ["private", "public", "unlisted"], default: "private" },
        videoFileKey: { type: String, required: true },
        videoFileName: { type: String, required: true },
        videoFileSize: { type: Number, required: true },

        youtubeVideoId: { type: String },
        error: { type: String },

        startedAt: { type: Date },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

// Compound index for efficient queue polling (status + priority descending + createdAt ascending)
uploadJobSchema.index({ status: 1, priority: -1, createdAt: 1 });

export const UploadJob: Model<IUploadJob> =
    mongoose.models.UploadJob || mongoose.model<IUploadJob>("UploadJob", uploadJobSchema);

// ===========================================
// PRIORITY QUEUE HELPER FUNCTIONS
// ===========================================

/**
 * Get priority number based on user plan
 * Higher number = higher priority (processed first)
 */
export function getPlanPriority(plan: "free" | "pro" | "enterprise"): number {
    const priorities = {
        free: 1,
        pro: 2,
        enterprise: 3,
    };
    return priorities[plan] || 1;
}

/**
 * Add a new upload job to the queue
 */
export async function enqueueUpload(jobData: {
    userId: string;
    userPlan: "free" | "pro" | "enterprise";
    title: string;
    description: string;
    tags: string[];
    privacy: "private" | "public" | "unlisted";
    videoFileKey: string;
    videoFileName: string;
    videoFileSize: number;
}): Promise<IUploadJob> {
    const jobId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job = await UploadJob.create({
        _id: jobId,
        ...jobData,
        priority: getPlanPriority(jobData.userPlan),
        status: "pending",
    });

    return job;
}

/**
 * Get the next job to process (highest priority first, then oldest)
 * Uses findOneAndUpdate for atomic operation (prevents race conditions)
 */
export async function dequeueUpload(): Promise<IUploadJob | null> {
    const job = await UploadJob.findOneAndUpdate(
        { status: "pending" },
        {
            $set: {
                status: "processing",
                startedAt: new Date(),
            }
        },
        {
            sort: { priority: -1, createdAt: 1 }, // Max-heap behavior: highest priority first
            new: true,
        }
    );

    return job;
}

/**
 * Mark job as completed
 */
export async function completeUpload(jobId: string, youtubeVideoId: string): Promise<IUploadJob | null> {
    return await UploadJob.findByIdAndUpdate(
        jobId,
        {
            $set: {
                status: "completed",
                youtubeVideoId,
                completedAt: new Date(),
            }
        },
        { new: true }
    );
}

/**
 * Mark job as failed
 */
export async function failUpload(jobId: string, error: string): Promise<IUploadJob | null> {
    return await UploadJob.findByIdAndUpdate(
        jobId,
        {
            $set: {
                status: "failed",
                error,
                completedAt: new Date(),
            }
        },
        { new: true }
    );
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    pendingByPlan: { free: number; pro: number; enterprise: number };
}> {
    const [stats, pendingByPlan] = await Promise.all([
        UploadJob.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        UploadJob.aggregate([
            { $match: { status: "pending" } },
            { $group: { _id: "$userPlan", count: { $sum: 1 } } }
        ])
    ]);

    const statusMap = stats.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
    }, {} as Record<string, number>);

    const planMap = pendingByPlan.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
    }, {} as Record<string, number>);

    return {
        pending: statusMap.pending || 0,
        processing: statusMap.processing || 0,
        completed: statusMap.completed || 0,
        failed: statusMap.failed || 0,
        pendingByPlan: {
            free: planMap.free || 0,
            pro: planMap.pro || 0,
            enterprise: planMap.enterprise || 0,
        }
    };
}

/**
 * Get user's upload jobs
 */
export async function getUserUploadJobs(
    userId: string,
    limit: number = 10
): Promise<IUploadJob[]> {
    return await UploadJob.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
}

/**
 * Get job by ID
 */
export async function getUploadJob(jobId: string): Promise<IUploadJob | null> {
    return await UploadJob.findById(jobId);
}

/**
 * Get estimated wait time for a new job based on plan
 */
export async function getEstimatedWaitTime(userPlan: "free" | "pro" | "enterprise"): Promise<{
    position: number;
    estimatedMinutes: number;
}> {
    const priority = getPlanPriority(userPlan);

    // Count jobs that would be processed before this one
    // (higher priority OR same priority but created earlier)
    const position = await UploadJob.countDocuments({
        status: "pending",
        priority: { $gte: priority }
    });

    // Estimate 2 minutes per upload on average
    const estimatedMinutes = position * 2;

    return { position, estimatedMinutes };
}

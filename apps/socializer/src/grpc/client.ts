/**
 * gRPC Client for YouTube Metadata Generator
 * Communicates with the Python gRPC server
 */

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory of this file and resolve proto path
// In monorepo: apps/socializer/src/grpc -> ../../.. -> apps/socializer -> ../.. -> root/proto
const getProtoPath = (): string => {
    // Try multiple possible locations
    const possiblePaths = [
        // From project root (when running from monorepo root)
        path.resolve(process.cwd(), "proto/metadata.proto"),
        // From socializer app root
        path.resolve(process.cwd(), "../../proto/metadata.proto"),
        // Absolute fallback
        path.resolve(__dirname, "../../../../proto/metadata.proto"),
    ];

    return possiblePaths[0]; // Primary path from monorepo root
};

const PROTO_PATH = getProtoPath();

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const MetadataService = protoDescriptor.metadata.MetadataService;

// Types for gRPC requests and responses
export interface MetadataRequest {
    video_topic: string;
    video_description?: string;
    target_audience?: string;
    keywords?: string[];
    use_ai?: boolean;
}

export interface DynamicRequest extends MetadataRequest {
    fields: string[];
}

export interface MetadataResponse {
    titles: string[];
    description: string;
    hashtags: string[];
    tags: string[];
    generated_by: string;
}

export interface TitlesResponse {
    titles: string[];
    generated_by: string;
}

export interface DescriptionResponse {
    description: string;
    generated_by: string;
}

export interface HashtagsResponse {
    hashtags: string[];
    generated_by: string;
}

export interface TagsResponse {
    tags: string[];
    total_characters: number;
    generated_by: string;
}

export interface DynamicResponse {
    title?: string;
    titles?: string[];
    description?: string;
    hashtags?: string[];
    tags?: string[];
    generated_by: string;
}

export interface HealthResponse {
    status: string;
    version: string;
    ai_loaded: boolean;
    model: string;
    device: string;
}

class MetadataGrpcClient {
    private client: any;

    constructor() {
        const grpcUrl = process.env.GRPC_SERVER_URL || "localhost:50051";
        console.log(`🔗 Connecting to gRPC server at ${grpcUrl}`);
        this.client = new MetadataService(
            grpcUrl,
            grpc.credentials.createInsecure()
        );
    }

    /**
     * Promisify gRPC call
     */
    private promisify<TRequest, TResponse>(
        method: (
            request: TRequest,
            callback: (error: grpc.ServiceError | null, response: TResponse) => void
        ) => void,
        request: TRequest
    ): Promise<TResponse> {
        return new Promise((resolve, reject) => {
            method.call(this.client, request, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Generate all metadata at once
     */
    async generateMetadata(request: MetadataRequest): Promise<MetadataResponse> {
        return this.promisify<MetadataRequest, MetadataResponse>(
            this.client.GenerateMetadata,
            request
        );
    }

    /**
     * Generate only titles
     */
    async generateTitles(request: MetadataRequest): Promise<TitlesResponse> {
        return this.promisify<MetadataRequest, TitlesResponse>(
            this.client.GenerateTitles,
            request
        );
    }

    /**
     * Generate only description
     */
    async generateDescription(request: MetadataRequest): Promise<DescriptionResponse> {
        return this.promisify<MetadataRequest, DescriptionResponse>(
            this.client.GenerateDescription,
            request
        );
    }

    /**
     * Generate only hashtags
     */
    async generateHashtags(request: MetadataRequest): Promise<HashtagsResponse> {
        return this.promisify<MetadataRequest, HashtagsResponse>(
            this.client.GenerateHashtags,
            request
        );
    }

    /**
     * Generate only tags
     */
    async generateTags(request: MetadataRequest): Promise<TagsResponse> {
        return this.promisify<MetadataRequest, TagsResponse>(
            this.client.GenerateTags,
            request
        );
    }

    /**
     * Generate dynamic metadata based on structure
     */
    async generateDynamic(request: DynamicRequest): Promise<DynamicResponse> {
        return this.promisify<DynamicRequest, DynamicResponse>(
            this.client.GenerateDynamic,
            request
        );
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<HealthResponse> {
        return this.promisify<{}, HealthResponse>(
            this.client.HealthCheck,
            {}
        );
    }

    /**
     * Close the client connection
     */
    close(): void {
        grpc.closeClient(this.client);
    }
}

// Singleton instance
let clientInstance: MetadataGrpcClient | null = null;

export function getGrpcClient(): MetadataGrpcClient {
    if (!clientInstance) {
        clientInstance = new MetadataGrpcClient();
    }
    return clientInstance;
}

export { MetadataGrpcClient };

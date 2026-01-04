import { z } from "zod";

/**
 * ============================================================================
 * ENVIRONMENT CONFIGURATION
 * ============================================================================
 * Industry-standard environment variable configuration with:
 * - Type-safe validation using Zod
 * - Server/Client separation for Next.js
 * - Grouped configuration by service
 * - Detailed error messages
 * - Environment detection
 * ============================================================================
 */

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

/**
 * Server-side environment variables schema
 * These are only available on the server and should NEVER be exposed to the client
 */
const serverEnvSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Google OAuth & YouTube API
  GOOGLE_YT_KEY: z
    .string({ error: "GOOGLE_YT_KEY is required for YouTube API access" })
    .min(1, "GOOGLE_YT_KEY cannot be empty"),
  GOOGLE_CLIENT_ID: z
    .string({ error: "GOOGLE_CLIENT_ID is required for OAuth" })
    .min(1, "GOOGLE_CLIENT_ID cannot be empty"),
  GOOGLE_CLIENT_SECRET: z
    .string({ error: "GOOGLE_CLIENT_SECRET is required for OAuth" })
    .min(1, "GOOGLE_CLIENT_SECRET cannot be empty"),
  GOOGLE_REDIRECT_URI: z
    .string({ error: "GOOGLE_REDIRECT_URI is required for OAuth callback" })
    .url("GOOGLE_REDIRECT_URI must be a valid URL"),

  // Database
  MONGODB_URI: z
    .string({ error: "MONGODB_URI is required for database connection" })
    .min(1, "MONGODB_URI cannot be empty")
    .refine(
      (uri) => uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"),
      "MONGODB_URI must be a valid MongoDB connection string",
    ),

  // External Services
  RESEND_API_KEY: z
    .string({ error: "RESEND_API_KEY is required for email services" })
    .min(1, "RESEND_API_KEY cannot be empty")
    .startsWith("re_", "RESEND_API_KEY must start with 're_'"),
  MURF_API_KEY: z
    .string({ error: "MURF_API_KEY is required for voice synthesis" })
    .min(1, "MURF_API_KEY cannot be empty"),

  // Optional: Better Auth Secret (if using better-auth)
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
});

/**
 * Client-side environment variables schema
 * These are exposed to the browser via NEXT_PUBLIC_ prefix
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string({ error: "NEXT_PUBLIC_APP_URL is required" })
    .url("NEXT_PUBLIC_APP_URL must be a valid URL"),

  // Add other NEXT_PUBLIC_ variables here as needed
  // Example: NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Inferred types from schemas for type-safe access
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type Env = ServerEnv & ClientEnv;

// ============================================================================
// VALIDATION HELPER
// ============================================================================

/**
 * Formats Zod errors into readable messages
 */
function formatZodErrors(zodError: z.ZodError): string {
  return zodError.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return `  ❌ ${path}: ${issue.message}`;
    })
    .join("\n");
}

/**
 * Validates environment variables and provides detailed error messages
 */
function validateEnv<T extends z.ZodSchema>(
  schema: T,
  env: Record<string, string | undefined>,
  label: string,
): z.infer<T> {
  const parsed = schema.safeParse(env);

  if (!parsed.success) {
    const errorMessage = formatZodErrors(parsed.error);

    console.error(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                        ⚠️  ENVIRONMENT VALIDATION ERROR                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ${label} environment variables are invalid or missing:
╠══════════════════════════════════════════════════════════════════════════════╣
${errorMessage}
╠══════════════════════════════════════════════════════════════════════════════╣
║  Please check your .env file or environment configuration.                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);

    throw new Error(`Invalid ${label.toLowerCase()} environment variables`);
  }

  return parsed.data;
}

// ============================================================================
// ENVIRONMENT DETECTION
// ============================================================================

const isServer = typeof window === "undefined";
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

// ============================================================================
// VALIDATED ENVIRONMENT OBJECTS
// ============================================================================

/**
 * Server environment variables
 * Only validated and accessible on the server
 */
const serverEnv = isServer
  ? validateEnv(serverEnvSchema, process.env, "Server")
  : ({} as ServerEnv);

/**
 * Client environment variables
 * Safe to use on both server and client
 */
const clientEnv = validateEnv(
  clientEnvSchema,
  {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // Add other NEXT_PUBLIC_ variables here
  },
  "Client",
);

// ============================================================================
// GROUPED CONFIGURATION EXPORTS
// ============================================================================

/**
 * Google OAuth & YouTube API configuration
 */
export const googleConfig = {
  ytApiKey: serverEnv.GOOGLE_YT_KEY,
  clientId: serverEnv.GOOGLE_CLIENT_ID,
  clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
  redirectUri: serverEnv.GOOGLE_REDIRECT_URI,
} as const;

/**
 * Database configuration
 */
export const dbConfig = {
  mongoUri: serverEnv.MONGODB_URI,
} as const;

/**
 * Email service configuration (Resend)
 */
export const emailConfig = {
  resendApiKey: serverEnv.RESEND_API_KEY,
} as const;

/**
 * Voice synthesis configuration (Murf)
 */
export const voiceConfig = {
  murfApiKey: serverEnv.MURF_API_KEY,
} as const;

/**
 * Application URL configuration
 */
export const appConfig = {
  url: clientEnv.NEXT_PUBLIC_APP_URL,
  isDevelopment,
  isProduction,
  isTest,
} as const;

/**
 * Authentication configuration (Better Auth - optional)
 */
export const authConfig = {
  secret: serverEnv.BETTER_AUTH_SECRET,
  url: serverEnv.BETTER_AUTH_URL,
} as const;

// ============================================================================
// MAIN ENV EXPORT
// ============================================================================

/**
 * Combined environment configuration
 * Use this for direct access to all environment variables
 *
 * @example
 * ```ts
 * import { env } from '@/lib/env';
 *
 * // Access grouped config
 * const { clientId } = env.google;
 *
 * // Access raw values
 * const ytKey = env.server.GOOGLE_YT_KEY;
 * ```
 */
export const env = {
  // Raw validated environment objects
  server: serverEnv,
  client: clientEnv,

  // Grouped configurations for cleaner imports
  google: googleConfig,
  db: dbConfig,
  email: emailConfig,
  voice: voiceConfig,
  app: appConfig,
  auth: authConfig,

  // Environment flags
  isDevelopment,
  isProduction,
  isTest,
  isServer,
} as const;

// ============================================================================
// LEGACY SUPPORT (Backward Compatibility)
// ============================================================================

/**
 * @deprecated Use `env` or grouped configs instead
 * Kept for backward compatibility
 */
export const ENV = {
  GOOGLE_YT_KEY: serverEnv.GOOGLE_YT_KEY,
  GOOGLE_CLIENT_ID: serverEnv.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: serverEnv.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: serverEnv.GOOGLE_REDIRECT_URI,
  RESEND_API_KEY: serverEnv.RESEND_API_KEY,
  NEXT_PUBLIC_APP_URL: clientEnv.NEXT_PUBLIC_APP_URL,
  MONGODB_URI: serverEnv.MONGODB_URI,
  MURF_API_KEY: serverEnv.MURF_API_KEY,
} as const;

// Default export for convenience
export default env;

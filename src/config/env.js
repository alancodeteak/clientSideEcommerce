import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4100),
    CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
    /** Omit in local dev to use the default below; required in production. */
    DATABASE_URL: z.string().min(1).optional(),

    JWT_SECRET: z.string().min(16).default("dev_only_change_me_please"),
    JWT_ISSUER: z.string().min(1).default("clientside-ecommerce"),
    JWT_AUDIENCE: z.string().min(1).default("clientside-ecommerce"),
    JWT_EXPIRES_IN: z.string().min(1).default("8h"),

    /** Min 32 chars; used by Better Auth (Google OAuth). */
    BETTER_AUTH_SECRET: z.string().min(32).default("dev_better_auth_secret_change_me_32chars!!"),
    /**
     * Public origin of this API (no path). Used for OAuth callbacks.
     * Example: `http://localhost:4100`
     */
    BETTER_AUTH_URL: z.string().url().optional(),
    /** Where Better Auth routes are mounted (must match Express + frontend client `basePath`). */
    BETTER_AUTH_BASE_PATH: z.string().startsWith("/").default("/api/oauth"),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional()
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV === "production" && !val.DATABASE_URL?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL is required in production"
      });
    }
    if (val.NODE_ENV === "production" && val.JWT_SECRET === "dev_only_change_me_please") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET must be set in production"
      });
    }
    if (val.NODE_ENV === "production") {
      if (!val.BETTER_AUTH_URL?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["BETTER_AUTH_URL"],
          message: "BETTER_AUTH_URL is required in production for OAuth callbacks"
        });
      }
      if (
        val.BETTER_AUTH_SECRET === "dev_better_auth_secret_change_me_32chars!!" ||
        val.BETTER_AUTH_SECRET.length < 32
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["BETTER_AUTH_SECRET"],
          message: "Set a strong BETTER_AUTH_SECRET in production (32+ characters)"
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const DEV_DEFAULT_DATABASE_URL = "postgresql://localhost:5432/postgres";

const databaseUrlRaw = parsed.data.DATABASE_URL?.trim();

const port = parsed.data.PORT;

export const env = {
  ...parsed.data,
  DATABASE_URL:
    parsed.data.NODE_ENV === "production"
      ? databaseUrlRaw
      : databaseUrlRaw || DEV_DEFAULT_DATABASE_URL,
  BETTER_AUTH_URL:
    parsed.data.BETTER_AUTH_URL?.trim() ||
    `http://localhost:${port}`
};

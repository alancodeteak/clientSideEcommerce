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

    /** Max distance (meters) from shop address hub for purchase eligibility; per-shop override later. */
    SERVICE_AREA_RADIUS_METERS: z.coerce.number().int().positive().default(5000),

    /**
     * DANGEROUS: allows `POST /api/auth/oauth/jwt` with only `{ email }` (no proof of ownership).
     * Forced off in production. Enable only for tightly controlled local/dev tooling.
     */
    ALLOW_EMAIL_ONLY_JWT_EXCHANGE: z.preprocess((val) => {
      if (val === true || val === 1) return true;
      if (val === false || val === 0) return false;
      if (val === undefined || val === null || val === "") return false;
      const s = String(val).toLowerCase();
      return s === "true" || s === "1" || s === "yes";
    }, z.boolean())
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
    if (val.NODE_ENV === "production" && val.ALLOW_EMAIL_ONLY_JWT_EXCHANGE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ALLOW_EMAIL_ONLY_JWT_EXCHANGE"],
        message: "ALLOW_EMAIL_ONLY_JWT_EXCHANGE must be false in production (insecure email-only JWT minting)"
      });
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

export const env = {
  ...parsed.data,
  DATABASE_URL:
    parsed.data.NODE_ENV === "production"
      ? databaseUrlRaw
      : databaseUrlRaw || DEV_DEFAULT_DATABASE_URL
};

import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4100),
    CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
    DATABASE_URL: z.string().min(1),

    JWT_SECRET: z.string().min(16).default("dev_only_change_me_please"),
    JWT_ISSUER: z.string().min(1).default("clientside-ecommerce"),
    JWT_AUDIENCE: z.string().min(1).default("clientside-ecommerce"),
    JWT_EXPIRES_IN: z.string().min(1).default("8h")
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV === "production" && val.JWT_SECRET === "dev_only_change_me_please") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET must be set in production"
      });
    }
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

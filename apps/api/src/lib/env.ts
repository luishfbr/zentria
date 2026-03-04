import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
  BETTER_AUTH_URL: z.string().trim().min(1),
  CLIENT_URL: z.string().trim().min(1),
  EMAIL_HOST: z.string().trim().min(1),
  EMAIL_USER: z.string().trim().min(1),
  EMAIL_PASSWORD: z.string().trim().min(1),
  EMAIL_FROM: z.string().trim().min(1),
  SUPERADMIN_NAME: z.string().trim().min(1),
  SUPERADMIN_EMAIL: z.string().trim().min(1),
  SUPERADMIN_PASSWORD: z.string().trim().min(1),
});

export const env = envSchema.parse(Bun.env);

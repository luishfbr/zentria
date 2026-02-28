import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.url().startsWith("postgresql://"),
    EMAIL_HOST: z.string(),
    EMAIL_USER: z.string(),
    EMAIL_PASSWORD: z.string(),
    EMAIL_FROM: z.string(),
})

export const env = envSchema.parse(Bun.env);
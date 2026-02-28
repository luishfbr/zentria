import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client";
import { SendResetPassword } from "./mails/sendResetPassword";
import { SendVerificationEmail } from "./mails/sendVerificationEmail";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
    basePath: "/auth",
    trustedOrigins: ["http://localhost:5173"],
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
    }),
    advanced: {
        database: {
            generateId: () => Bun.randomUUIDv7()
        },
    },
    emailAndPassword: {
        enabled: true,
        password: {
            hash: (password) => Bun.password.hash(password),
            verify: ({ password, hash }) => Bun.password.verify(password, hash),
        },
        autoSignIn: true,
        sendResetPassword: async ({ url, user }) => {
            await SendResetPassword({ email: user.email, url });
        },
        revokeSessionsOnPasswordReset: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ url, user }) => {
            await SendVerificationEmail({ email: user.email, url });
        },
        autoSignInAfterVerification: true,
        sendOnSignIn: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        }
    },
    plugins: [
        openAPI()
    ]
});
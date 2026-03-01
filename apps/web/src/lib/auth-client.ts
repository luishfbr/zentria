import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    basePath: "/auth",
    baseURL: "http://localhost:3000",
})

import type { User } from 'better-auth'
import * as React from 'react'
import { authClient } from './lib/auth-client'


export interface AuthContext {
    isAuthenticated: boolean
    user: User | null
}

const AuthContext = React.createContext<AuthContext | null>(null)


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const session = authClient.useSession()

    const user = session?.data?.user

    const isAuthenticated = !!user

    return (
        <AuthContext.Provider value={{ isAuthenticated, user: user ?? null }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
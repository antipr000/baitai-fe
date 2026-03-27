import { cookies } from 'next/headers'
import { cache } from 'react'
import { getTokens as getFirebaseTokens } from 'next-firebase-auth-edge'
import { clientConfig, serverConfig } from '@/lib/auth/config'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: Record<string, unknown>
    cache?: RequestCache
    next?: {
        revalidate?: number | false
        tags?: string[]
    }
}

const getAuthTokens = cache(async () => {
    return getFirebaseTokens(await cookies(), {
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
    })
})

export interface UserProfile {
    first_name: string
    last_name: string
    email: string
    profile_picture_url: string | null
    preferences_set: boolean
    phone_number?: string | null
    location?: string | null
    website?: string | null
    role?: string | null
    experience?: string | null
}

export const getUserProfile = cache(async () => {
    return serverFetch<UserProfile>('/api/v1/user/profile/')
})

export interface MetadataOption {
    value: string;
    label: string;
}

export interface PreferencesMetadata {
    roles: string[];
    experience_levels: MetadataOption[];
}

export const getPreferencesMetadata = cache(async () => {
    return serverFetch<PreferencesMetadata>('/api/v1/user/preferences/metadata', {
        cache: 'force-cache',
        next: { revalidate: 3600 } // Cache for 1 hour
    })
})

export interface UserPreferences {
    role: string
    experience: string
    preferences_set: boolean
}

export const getUserPreferences = cache(async () => {
    return serverFetch<UserPreferences>('/api/v1/user/preferences/')
})

export async function serverFetch<T>(url: string, options?: FetchOptions): Promise<T | null> {
    const tokens = await getAuthTokens()

    if (!tokens?.token) {
        console.error(`[serverFetch] No auth token available for ${url}`)
        return null
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: options?.method || 'GET',
            headers: {
                'Authorization': `Bearer ${tokens.token}`,
                'Content-Type': 'application/json',
            },
            body: options?.body ? JSON.stringify(options.body) : undefined,
            cache: 'no-store',
        })

        if (!response.ok) {
            console.error(`[serverFetch] ${url} failed with status ${response.status}`)
            return null
        }
        return response.json()
    } catch (error) {
        console.error(`[serverFetch] Error fetching ${url}:`, error)
        return null
    }
}

import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'
import { clientConfig, serverConfig } from '@/lib/auth/config'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function serverFetch<T>(url: string): Promise<T | null> {
    const tokens = await getTokens(await cookies(), {
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
    })

    if (!tokens?.token) {
        console.error(`[serverFetch] No auth token available for ${url}`)
        return null
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Authorization': `Bearer ${tokens.token}`,
                'Content-Type': 'application/json',
            },
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

import React from 'react'
import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'
import { clientConfig, serverConfig } from '@/lib/auth/config'
import { serverFetch, getPreferencesMetadata } from '@/lib/api/server'
import { CreateInterviewForm } from '@/components/company/create/create-interview-form'

interface Company {
    id: string
    name: string
}

export default async function CreateInterviewPage() {
    // Get auth token from cookies
    const tokens = await getTokens(await cookies(), {
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
    })

    // Fetch data in parallel
    const [company, roles, metadata] = await Promise.all([
        serverFetch<Company>('/api/v1/company/hiring-managers/company'),
        serverFetch<string[]>('/api/v1/company/roles/'),
        getPreferencesMetadata()
    ])

    const companyId = company?.id
    return (
        <CreateInterviewForm
            companyId={companyId}
            authToken={tokens?.token}
            roles={roles || []}
            metadata={metadata}
        />
    )
}

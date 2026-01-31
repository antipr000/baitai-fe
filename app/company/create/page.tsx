import React from 'react'
import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'
import { clientConfig, serverConfig } from '@/lib/auth/config'
import { serverFetch } from '@/lib/api/server'
import { CreateInterviewForm } from '@/components/company/create/create-interview-form'

interface HiringManager {
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

    // Fetch company details
    const hiringManager = await serverFetch<HiringManager>('/api/v1/company/hiring-managers/company')
    const companyId = hiringManager?.id

    return (
        <CreateInterviewForm
            companyId={companyId}
            authToken={tokens?.token}
        />
    )
}

import React from 'react'
import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'
import { clientConfig, serverConfig } from '@/lib/auth/config'
import { serverFetch } from '@/lib/api/server'
import { EditInterviewForm, InterviewTemplateData } from "@/components/company/edit/edit-interview-form"

interface PageProps {
    params: Promise<{ templateId: string }>
}

export default async function EditInterviewPage({ params }: PageProps) {
    const { templateId } = await params

    // Get auth token from cookies
    const tokens = await getTokens(await cookies(), {
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
    })

    // Fetch interview template data
    const templateData = await serverFetch<InterviewTemplateData>(
        `/api/v1/company/interviews/${templateId}/`
    )

    if (!templateData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-700">Interview not found</h1>
                    <p className="text-gray-500 mt-2">The interview template you're looking for doesn't exist.</p>
                </div>
            </div>
        )
    }

    return (
        <EditInterviewForm
            templateId={templateId}
            templateData={templateData}
            authToken={tokens?.token}
        />
    )
}

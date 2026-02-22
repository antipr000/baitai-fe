import { serverFetch } from "@/lib/api/server"
import { ResumeCheckResponse } from "@/lib/api/resume"
import InterviewClient, { InterviewTemplateData } from "@/components/interview/interview-client"
import { Suspense } from "react"
import { getTokens } from "next-firebase-auth-edge"
import { cookies } from "next/headers"
import { clientConfig, serverConfig } from "@/lib/auth/config"
import { InterviewSkeleton } from "@/components/interview/interview-skeletons"

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ templateId: string }>
}

// ─── Async Content Component ──────────────────────────────────────────────────

async function InterviewContent({ templateId }: { templateId: string }) {
    // Parallel data fetching for performance
    const [tokens, templateData, resumeCheckResult] = await Promise.all([
        getTokens(await cookies(), {
            apiKey: clientConfig.apiKey,
            cookieName: serverConfig.cookieName,
            cookieSignatureKeys: serverConfig.cookieSignatureKeys,
            serviceAccount: serverConfig.serviceAccount,
        }),
        serverFetch<InterviewTemplateData>(`/api/v1/user/interview/${templateId}/`),
        serverFetch<ResumeCheckResponse>('/api/v1/resume/check/')
    ])

    return (
        <InterviewClient
            templateId={templateId}
            templateData={templateData}
            authToken={tokens?.token}
            initialResumeCheck={resumeCheckResult}
        />
    )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function InterviewPage({ params }: PageProps) {
    const { templateId } = await params

    return (
        <Suspense fallback={<InterviewSkeleton />}>
            <InterviewContent templateId={templateId} />
        </Suspense>
    )
}
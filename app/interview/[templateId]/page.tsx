import { serverFetch } from "@/lib/api/server"
import InterviewClient, { InterviewTemplateData } from "@/components/interview/interview-client"

interface PageProps {
    params: Promise<{ templateId: string }>
}

import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { clientConfig, serverConfig } from "@/lib/auth/config";

export default async function InterviewPage({ params }: PageProps) {
    const { templateId } = await params
    const tokens = await getTokens(await cookies(), {
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
    });


    // Fetch template data on the server
    const templateData = await serverFetch<InterviewTemplateData>(
        `/api/v1/user/interview/${templateId}/`
    )

    return <InterviewClient templateId={templateId} templateData={templateData} authToken={tokens?.token} />
}
import { serverFetch } from "@/lib/api/server"
import InterviewClient, { InterviewTemplateData } from "@/components/interview/interview-client"

interface PageProps {
    params: Promise<{ templateId: string }>
}

export default async function InterviewPage({ params }: PageProps) {
    const { templateId } = await params

    // Fetch template data on the server
    const templateData = await serverFetch<InterviewTemplateData>(
        `/api/v1/user/interview/${templateId}/`
    )

    return <InterviewClient templateId={templateId} templateData={templateData} />
}
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackButton2 } from '@/components/ui/back-button2'
import Image from 'next/image'
import Link from 'next/link'
import { SessionTable } from './session-table'
import { Candidate } from './columns'
import { BackButton } from '@/components/ui/back-button'
import { InviteForm } from '@/components/invite-form'
import { serverFetch } from '@/lib/api/server'
import { formatDate } from '@/lib/utils'
import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'
import { clientConfig, serverConfig } from '@/lib/auth/config'

interface SessionItem {
    id: string
    name: string
    email: string
    status: string
    score: number
    applied_date: string
    session_id: string
}

interface SessionListResponse {
    items: SessionItem[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

interface SessionStats {
    invites_sent: number
    appeared: number
    pending: number
    avg_score: number
    template_name: string
}

async function getStats(templateId: string): Promise<SessionStats> {
    const response = await serverFetch<SessionStats>(`/api/v1/company/sessions/${templateId}/stats`)
    return response || { invites_sent: 0, appeared: 0, pending: 0, avg_score: 0, template_name: "Interview Dashboard" }
}

async function getSessions(templateId: string): Promise<Candidate[]> {
    const response = await serverFetch<SessionListResponse>(`/api/v1/company/sessions/${templateId}/`, {
        method: 'POST',
        body: { page: 1, page_size: 100 }
    })

    if (!response?.items) return []

    return response.items.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        status: (item.status.charAt(0).toUpperCase() + item.status.slice(1)) as "Completed" | "In Progress" | "Pending",
        score: item.score,
        appliedDate: formatDate(item.applied_date),
        sessionId: item.session_id
    }))
}

export default async function SessionPage({ params }: { params: Promise<{ templateId: string }> }) {
    const { templateId } = await params
    const [candidates, stats, tokens] = await Promise.all([
        getSessions(templateId),
        getStats(templateId),
        getTokens(await cookies(), {
            apiKey: clientConfig.apiKey,
            cookieName: serverConfig.cookieName,
            cookieSignatureKeys: serverConfig.cookieSignatureKeys,
            serviceAccount: serverConfig.serviceAccount,
        })
    ])
    const authToken = tokens?.token

    return (
        <div className='w-full min-h-screen bg-white'>
            <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto">
                <div className="max-w-7xl mx-auto p-6 mt-5 space-y-10">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className='flex items-center gap-4'>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-[rgba(58,63,187,1)]">{stats.template_name}</h1>
                                <p className="text-[rgba(107,114,128,1)] font-medium text-sm">Interview Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <InviteForm templateId={templateId} authToken={authToken}>
                                <Button size="lg" className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white flex items-center gap-2 rounded-sm px-6 h-11">
                                    <Image src="/company/candidates/mail.svg" alt="Mail" width={18} height={18} />
                                    <span className="font-semibold text-sm">Send Invites</span>
                                </Button>
                            </InviteForm>
                            <Link href="/company/dashboard">
                                <Button variant="outline" size="lg" className="border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:text-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.05)] rounded-sm px-6 h-11">
                                    <span className="font-semibold text-sm">Back Home</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Invites Sent  */}
                        <Card className="rounded-xl border-[rgba(58,63,187,1)] shadow-none bg-white">
                            <CardContent className="p-6 flex flex-row items-center gap-5 py-3">
                                    <Image src="/company/candidates/invite.svg" alt="Mail" width={30} height={30} />
                                <div className='space-y-0.5'>
                                    <p className="text-xl font-medium text-[rgba(10,13,26,0.6)] whitespace-nowrap">Invites Sent</p>
                                    <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.invites_sent}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appeared  */}
                        <Card className="rounded-xl border-[rgba(58,63,187,1)] shadow-none bg-white">
                            <CardContent className="p-6 flex flex-row items-center gap-5 py-3">
                                    <Image src="/company/candidates/tick.svg" alt="tick" width={30} height={30}  />
                                <div className='space-y-0.5'>
                                    <p className="text-xl font-medium text-[rgba(10,13,26,0.6)] whitespace-nowrap">Appeared</p>
                                    <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.appeared}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending */}
                        <Card className="rounded-xl border-[rgba(58,63,187,1)] shadow-none bg-white">
                            <CardContent className="p-6 flex flex-row items-center gap-5 py-3">
                                    <Image src="/company/candidates/clock.svg" alt="clock" width={30} height={30}  />
                                <div className='space-y-0.5'>
                                    <p className="text-xl font-medium text-[rgba(10,13,26,0.6)] whitespace-nowrap">Pending</p>
                                    <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.pending}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Avg Score */}
                        <Card className="rounded-xl border-[rgba(58,63,187,1)] shadow-none bg-white">
                            <CardContent className="p-6 flex flex-row items-center gap-5 py-3">
                                    <Image src="/company/candidates/people.svg" alt="people" width={40} height={40} />
                                <div className='space-y-0.5'>
                                    <p className="text-xl font-medium text-[rgba(10,13,26,0.6)] whitespace-nowrap">Avg Score</p>
                                    <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.avg_score}%</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div>
                        <div className="flex flex-col gap-4 mb-6">
                            <SessionTable data={candidates} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

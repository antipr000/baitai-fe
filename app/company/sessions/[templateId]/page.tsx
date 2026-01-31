import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackButton2 } from '@/components/ui/back-button2'
import Image from 'next/image'
import { DataTable } from './data-table'
import { columns, Candidate } from './columns'
import { BackButton } from '@/components/ui/back-button'
import { InviteForm } from '@/components/invite-form'
import { serverFetch } from '@/lib/api/server'
import { formatDate } from '@/lib/utils'

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
}

async function getStats(templateId: string): Promise<SessionStats> {
    const response = await serverFetch<SessionStats>(`/api/v1/company/sessions/${templateId}/stats`)
    return response || { invites_sent: 0, appeared: 0, pending: 0, avg_score: 0 }
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
        appliedDate: formatDate(item.applied_date)
    }))
}

export default async function SessionPage({ params }: { params: Promise<{ templateId: string }> }) {
    const { templateId } = await params
    const [candidates, stats] = await Promise.all([
        getSessions(templateId),
        getStats(templateId)
    ])

    return (
        <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
            <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto">
                <div className="max-w-7xl mx-auto p-6 space-y-10">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className='flex items-center gap-4'>
                            <BackButton className="self-start" />
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)]">Software Engineer Interview</h1>
                                <p className="text-[rgba(84,86,95,0.5)]  font-medium">Interview Dashboard</p>
                            </div>
                        </div>
                        <InviteForm templateId={templateId}>
                            <Button size="lg" className="bg-[linear-gradient(93.21deg,rgba(242,129,68,0.9)_-31.21%,rgba(255,178,136,0.9)_174.4%)] hover:opacity-90 text-white flex items-center gap-2 rounded-lg px-6 ">
                                <Image src="/company/candidates/mail.svg" alt="Mail" width={20} height={20} className="h-4 w-4" />
                                <span className="font-semibold">Send Invites</span>
                            </Button>
                        </InviteForm>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Invites Sent  */}
                        <Card className="bg-[rgba(104,100,247,0.05)] border border-[rgba(104,100,247,0.3)] ">
                            <CardContent className="">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[rgba(104,100,247,0.15)] shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[rgba(104,100,247,1)]">
                                        <Image src="/company/candidates/invite.svg" alt="Mail" width={24} height={24} className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-medium text-gray-500 mb-0.5">Invites Sent</p>
                                        <p className="text-2xl font-semibold text-[rgba(10,13,26,0.7)]">{stats.invites_sent}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appeared  */}
                        <Card className="bg-[rgba(50,255,36,0.05)] border border-[rgba(50,255,36,0.3)] ">
                            <CardContent className="">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[rgba(50,255,36,0.15)] shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[rgba(40,199,29,1)]">
                                        <Image src="/company/candidates/tick.svg" alt="tick" width={24} height={24} className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-medium text-[rgba(10,13,26,0.46)] mb-0.5">Appeared</p>
                                        <p className="text-2xl font-semibold text-[rgba(10,13,26,0.7)]">{stats.appeared}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending */}
                        <Card className="bg-[rgba(242,129,68,0.05)] border border-[rgba(242,129,68,0.3)] ">
                            <CardContent className="">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[rgba(242,129,68,0.15)] shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[rgba(242,129,68,1)]">
                                        <Image src="/company/candidates/clock.svg" alt="clock" width={24} height={24} className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-medium text-[rgba(10,13,26,0.46)] mb-0.5">Pending</p>
                                        <p className="text-2xl font-semibold text-[rgba(10,13,26,0.7)]">{stats.pending}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Avg Score */}
                        <Card className="bg-[rgba(58,170,255,0.05)] border border-[rgba(58,170,255,0.3)] ">
                            <CardContent className="">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[rgba(58,170,255,0.15)] shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[rgba(58,170,255,1)]">
                                        <Image src="/company/candidates/people.svg" alt="people" width={24} height={24} className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-medium text-[rgba(10,13,26,0.46)] mb-0.5">Avg Score</p>
                                        <p className="text-2xl font-semibold text-[rgba(10,13,26,0.7)]">{stats.avg_score}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div>
                        <div className="flex flex-col gap-4 mb-6">
                            <DataTable columns={columns} data={candidates} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

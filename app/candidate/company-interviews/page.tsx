import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import Image from 'next/image'
import React, { Suspense } from 'react'
import { DataTable } from './data-table'
import { columns, CompanyInterview } from './columns'
import { serverFetch } from '@/lib/api/server'
import {
    CompanyStatsSkeleton,
    CompanyTableSkeleton,
} from '@/components/candidate/company-interviews/company-skeletons'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface StatsResponse {
    pending: number
    companies: number
    positions: number
}

interface InterviewInvite {
    id: string
    status: string
    end_date: string
    created_at: string
    template_id: string
    title: string
    company_name: string
}

interface InvitesResponse {
    items: InterviewInvite[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

// ─── Async server sub-components ──────────────────────────────────────────────

async function CompanyStats() {
    const data = await serverFetch<StatsResponse>('/api/v1/user/interview/invites/stats/')
    const stats = data ?? { pending: 0, companies: 0, positions: 0 }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pending Interviews */}
            <Card className="bg-[rgba(104,100,247,0.05)] border border-[rgba(104,100,247,0.3)]">
                <CardContent className="">
                    <div className=" flex items-center gap-3">
                        <Image src="/candidate/company-interviews/interview.svg" className='translate-y-1' alt="Pending Interviews" width={60} height={60} />
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70  ">Pending Interviews</p>
                            <p className=" text-2xl font-bold text-[rgba(104,100,247,1)]">{stats.pending}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Companies */}
            <Card className="bg-[rgba(51,204,204,0.05)] border border-[rgba(51,204,204,0.3)]">
                <CardContent className="">
                    <div className=" flex items-center gap-3">
                        <Image src="/candidate/company-interviews/building.png" className='translate-y-1' alt="Company" width={60} height={60} />
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Companies</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)] ">{stats.companies}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Positions */}
            <Card className="bg-[rgba(242,129,68,0.05)] border border-[rgba(252,183,50,0.3)]">
                <CardContent className="">
                    <div className=" flex items-center gap-3">
                        <Image src="/candidate/company-interviews/bag.svg" className="translate-y-1" alt="positions" width={60} height={60} />
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Positions</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">{stats.positions}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

async function CompanyTable() {
    const data = await serverFetch<InvitesResponse>('/api/v1/user/interview/invites/', {
        method: 'POST',
        body: {
            page: 1,
            page_size: 100 // Fetching more items to show in the table
        }
    })

    const invites: CompanyInterview[] = data?.items
        ? data.items.map(invite => {
            const endDate = new Date(invite.end_date)
            const now = new Date()
            const diffTime = endDate.getTime() - now.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            // Simple "Due in X days" formatting
            let deadlineDisplay = endDate.toLocaleDateString()
            if (diffDays > 0 && diffDays <= 30) {
                deadlineDisplay = `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
            } else if (diffDays === 0) {
                deadlineDisplay = 'Due today'
            } else if (diffDays < 0) {
                deadlineDisplay = 'Expired'
            }

            return {
                id: invite.id,
                company: invite.company_name,
                position: invite.title,
                sentDate: new Date(invite.created_at).toLocaleDateString(),
                deadline: deadlineDisplay,
                status: (invite.status === 'invited' ? 'pending' : invite.status) as CompanyInterview['status'],
                templateId: invite.template_id,
            }
        })
        : []

    return <DataTable columns={columns} data={invites} />
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CompanyInterviews() {
    return (
        <div>
            <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
                <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto">
                    <div className="max-w-7xl mx-auto p-6 space-y-8">

                        {/* Header */}
                        <div className="flex justify-between items-center ">
                            <div className='flex items-center justify-center gap-4'>
                                <BackButton />
                                <h1 className="text-2xl tracking-wide font-semibold bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)] bg-clip-text text-transparent">Interview Invites</h1>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <Suspense fallback={<CompanyStatsSkeleton />}>
                            <CompanyStats />
                        </Suspense>

                        {/* Data table */}
                        <Suspense fallback={<CompanyTableSkeleton />}>
                            <CompanyTable />
                        </Suspense>

                    </div>
                </div>
            </div>
        </div>
    )
}

import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import React, { Suspense } from 'react'
import { DataTable } from './components/data-table'
import { columns, CompanyInterview } from './components/columns'
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

async function CompanyHeader() {  // need to optimize 
    const data = await serverFetch<StatsResponse>('/api/v1/user/interview/invites/stats/')
    const stats = data ?? { pending: 0, companies: 0, positions: 0 }

    return (
        <div className="flex flex-col gap-1.5 pt-2">
            <h1 className="text-3xl font-semibold text-[rgba(17,24,39,1)] tracking-tight">Interview Invites</h1>
            {stats.pending > 0 && (
                <p className="text-[rgba(255,107,107,1)] font-medium text-base">
                    You have {stats.pending} pending interviews
                </p>
            )}
        </div>
    )
}

async function CompanyStats() {
    const data = await serverFetch<StatsResponse>('/api/v1/user/interview/invites/stats/')
    const stats = data ?? { pending: 0, companies: 0, positions: 0 }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Pending Interviews */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/company-interviews2/pending.svg" alt="Pending" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.pending}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Pending Interviews</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Companies */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/company-interviews2/company.svg" alt="Companies" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.companies}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Companies</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Positions */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/company-interviews2/bag.svg" alt="Positions" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.positions}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Positions</p>
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
            page_size: 100
        }
    })

    const invites: CompanyInterview[] = data?.items
        ? data.items.map(invite => {
            const endDate = new Date(invite.end_date)
            const now = new Date()
            const diffTime = endDate.getTime() - now.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

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
                sentDate: new Date(invite.created_at).toISOString().split('T')[0],
                deadline: deadlineDisplay,
                status: (invite.status === 'invited' ? 'pending' : invite.status) as CompanyInterview['status'],
                templateId: invite.template_id,
            }
        })
        : []

    return <DataTable columns={columns} data={invites} />
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function InterviewInvitesV2() {
    return (
        <div className="max-w-7xl mx-auto px-5 pt-10 w-full space-y-7 pb-10">
            <Suspense fallback={
                <div className="flex flex-col gap-1.5 pt-2">
                    <h1 className="text-3xl font-semibold text-[rgba(17,24,39,1)] tracking-tight">Interview Invites</h1>
                </div>
            }>
                <CompanyHeader />
            </Suspense>

            <Suspense fallback={<CompanyStatsSkeleton />}>
                <CompanyStats />
            </Suspense>

            <Suspense fallback={<CompanyTableSkeleton />}>
                <CompanyTable />
            </Suspense>
        </div>
    )
}

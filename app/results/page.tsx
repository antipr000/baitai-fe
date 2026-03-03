import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import Image from 'next/image'
import React, { Suspense } from 'react'
import { DataTable } from './data-table'
import { columns, Result } from './columns'
import { serverFetch } from '@/lib/api/server'
import { ScorePoller } from '@/components/candidate/dashboard/score-poller'
import {
    ResultsStatsSkeleton,
    ResultsTableSkeleton,
} from '@/components/candidate/results/results-skeletons'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ApiResultItem {
    session_id: string
    template_id: string
    template_title: string
    role: string
    interview_type: string
    company_name: string
    date: string
    score: number
    status: string
    is_scored: boolean
    started_at: string
    ended_at: string
}

interface ApiResponse {
    items: ApiResultItem[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

interface StatsResponse {
    total_interviews: number
    practice_interviews: number
    interview_invites: number
    avg_score: number
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-CA') // Returns YYYY-MM-DD format
}

function capitalize(str: string): string {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// ─── Async server sub-components ──────────────────────────────────────────────

async function ResultsStats() {
    const response = await serverFetch<StatsResponse>('/api/v1/user/interview/results/stats/')

    const stats = response
        ? {
            total_interviews: response.total_interviews ?? 0,
            practice_interviews: response.practice_interviews ?? 0,
            interview_invites: response.interview_invites ?? 0,
            avg_score: response.avg_score ?? 0,
        }
        : { total_interviews: 0, practice_interviews: 0, interview_invites: 0, avg_score: 0 }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Interviews */}
            <Card className="bg-[rgba(104,100,247,0.05)] border border-[rgba(104,100,247,0.3)]">
                <CardContent className="">
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                            <Image src="/candidate/results/people.svg" alt="Total Interviews" width={48} height={48} />
                        </div>
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Total Interviews</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)] ">{stats.total_interviews}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Practice Interviews */}
            <Card className="bg-[rgba(74,222,11,0.05)] border border-[rgba(74,222,11,0.3)]">
                <CardContent className="">
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                            <Image src="/candidate/results/target.svg" alt="Practice Interviews" width={48} height={48} />
                        </div>
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Practice Interviews</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">{stats.practice_interviews}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Interview Invites */}
            <Card className="bg-[rgba(242,129,68,0.05)] border border-[rgba(242,129,68,0.3)]">
                <CardContent className="">
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                            <Image src="/candidate/results/note.svg" alt="Interview Invites" width={48} height={48} />
                        </div>
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Interview Invites</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">{stats.interview_invites}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Average Score */}
            <Card className="bg-[rgba(58,170,255,0.05)] border border-[rgba(58,170,255,0.3)]">
                <CardContent className="">
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                            <Image src="/candidate/results/people2.svg" alt="Average Score" width={48} height={48} />
                        </div>
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Avg Score</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">{stats.avg_score.toFixed(1)}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

async function ResultsTable() {
    const response = await serverFetch<ApiResponse>('/api/v1/user/interview/results/filter/', {
        method: 'POST',
        body: {
            status: 'completed',
            is_scored: true,
            page: 1,
            page_size: 100
        }
    })

    const data: Result[] = response?.items
        ? response.items.map((item) => ({
            id: item.session_id,
            jobRole: item.role || 'General',
            interviewType: capitalize(item.interview_type) as Result['interviewType'],
            company: item.company_name || '------',
            date: formatDate(item.date),
            score: `${item.score}%`,
            isScored: item.is_scored,
        }))
        : []

    const hasPending = data.some(r => !r.isScored)

    return (
        <>
            {hasPending && <ScorePoller />}
            <DataTable columns={columns} data={data} />
        </>
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
    return (
        <div>
            <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
                <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto  ">
                    <div className="max-w-7xl mx-auto p-6 space-y-8 mb-5">

                        {/* Header */}
                        <div className="flex justify-between items-center ">
                            <div className='flex items-center justify-center gap-4'>
                                <BackButton />
                                <h1 className="text-2xl tracking-wide font-semibold bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)] bg-clip-text text-transparent">All Results</h1>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <Suspense fallback={<ResultsStatsSkeleton />}>
                            <ResultsStats />
                        </Suspense>

                        {/* Data table + ScorePoller */}
                        <Suspense fallback={<ResultsTableSkeleton />}>
                            <ResultsTable />
                        </Suspense>

                    </div>
                </div>
            </div>
        </div>
    )
}

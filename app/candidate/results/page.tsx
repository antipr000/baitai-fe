import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import React, { Suspense } from 'react'
import { DataTable } from './components/data-table'
import { columns, Result } from './components/columns'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Total Interviews */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/results2/all.svg" alt="Total Interviews" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.total_interviews}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Total Interviews</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Interview Invites */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/results2/people.svg" alt="Interview Invites" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.interview_invites}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Interview Invites</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Practice Interviews */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/results2/target.svg" alt="Practice Interviews" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.practice_interviews}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Practice Interviews</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Average Score */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/results2/page.svg" alt="Average Score" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.avg_score.toFixed(0)}%</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Avg Score</p>
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

export default function ResultsV2() {
    return (
        <div className="max-w-7xl mx-auto px-5 pt-10 w-full space-y-7 pb-10">
            <div className="flex flex-col gap-1.5 pt-2">
                <h1 className="text-3xl font-semibold text-[rgba(17,24,39,1)] tracking-tight">Results</h1>
                <p className="text-[rgba(17,24,39,0.6)] text-base">Review your performance to ace interviews</p>
            </div>

            <Suspense fallback={<ResultsStatsSkeleton />}>
                <ResultsStats />
            </Suspense>

            <Suspense fallback={<ResultsTableSkeleton />}>
                <ResultsTable />
            </Suspense>
        </div>
    )
}

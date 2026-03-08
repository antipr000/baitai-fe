import React, { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { serverFetch } from '@/lib/api/server'
import { Button } from '@/components/ui/button'
import {
    InterviewInvitesCard,
    CompanyPracticeCard,
    PracticeInterviewsCard,
    LatestResultsCard
} from './components/dashboard-sections'

interface InterviewStats {
    average_score: number
    total_time: number
    completed: number
    pending: number
}

function formatTime(seconds: number): string {
    const totalMinutes = Math.floor(seconds / 60)
    if (totalMinutes < 60) return `${totalMinutes}m`
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}


async function DashboardHeader() {
    const response = await serverFetch<InterviewStats>('/api/v1/user/interview/stats/')
    const pending = response?.pending ?? 0

    return (
        <div className="mb-4">
            <h1 className="text-3xl font-semibold text-[rgba(17,24,39,1)] mb-2 tracking-tight">Dashboard</h1>
            <p className="text-[rgba(17,24,39,0.6)] text-base">
                You have <span className="text-[rgba(255,20,20,1)]">{pending} pending interviews</span> this week
            </p>
        </div>
    )
}

async function StatsCards() {
    const response = await serverFetch<InterviewStats>('/api/v1/user/interview/stats/')
    const stats: InterviewStats = response ?? { average_score: 0, total_time: 0, completed: 0, pending: 0 }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending */}
            <Card className="border-[rgba(107,124,255,1)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden py-2">
                <CardContent className="p-5 flex flex-col gap-3 justify-between">
                    <div className="flex items-start justify-between">
                        <div className="w-8 h-8 rounded-md bg-[rgba(240,243,255,1)] flex items-center justify-center">
                            <Image src="/candidate/dashboard2/time.svg" alt="Pending" width={20} height={20} />
                        </div>
                        <div className="text-[12px] text-[rgba(14,163,3,1)] flex items-center gap-1 mt-1">
                            <Image src="/candidate/dashboard2/up.svg" alt="Up" width={10} height={10} />
                            +2 this week
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-tight mb-0.5">{stats.pending}</h3>
                        <p className="text-[rgba(10,13,26,1)] opacity-70 text-sm font-medium">Pending</p>
                    </div>
                </CardContent>
            </Card>

            {/* Completed */}
            <Card className="border-[rgba(107,124,255,1)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden py-2">
                <CardContent className="p-5 flex flex-col gap-3 justify-between">
                    <div className="flex items-start justify-between">
                        <div className="w-8 h-8 rounded-md bg-[rgba(240,243,255,1)] flex items-center justify-center">
                            <Image src="/candidate/dashboard2/tick.svg" alt="Completed" width={20} height={20} />
                        </div>
                        <div className="text-[12px] text-[rgba(14,163,3,1)] flex items-center gap-1 mt-1">
                            <Image src="/candidate/dashboard2/up.svg" alt="Up" width={10} height={10} />
                            +3 this week
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-tight mb-0.5">{stats.completed}</h3>
                        <p className="text-[rgba(10,13,26,1)] opacity-70 text-sm font-medium">Completed</p>
                    </div>
                </CardContent>
            </Card>

            {/* Average Score */}
            <Card className="border-[rgba(107,124,255,1)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden py-2">
                <CardContent className="p-5 flex flex-col gap-3 justify-between">
                    <div className="flex items-start justify-between">
                        <div className="w-8 h-8 rounded-md bg-[rgba(240,243,255,1)] flex items-center justify-center">
                            <Image src="/candidate/dashboard2/doc.svg" alt="Score" width={20} height={20} />
                        </div>
                        <div className="text-[12px] text-[rgba(14,163,3,1)] flex items-center gap-1 mt-1">
                            <Image src="/candidate/dashboard2/up.svg" alt="Up" width={10} height={10} />
                            5% from last
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-tight mb-0.5">{stats.average_score.toFixed(0)}%</h3>
                        <p className="text-[rgba(10,13,26,1)] opacity-70 text-sm font-medium">Avg Score</p>
                    </div>
                </CardContent>
            </Card>

            {/* Streak */}
            <Card className="border-[rgba(107,124,255,1)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden py-2">
                <CardContent className="p-5 flex flex-col gap-3 justify-between">
                    <div className="flex items-start justify-between">
                        <div className="w-8 h-8 rounded-md bg-[rgba(240,243,255,1)] flex items-center justify-center">
                            <Image src="/candidate/dashboard2/fire.svg" alt="Streak" width={20} height={20} />
                        </div>
                        <div className="text-[12px] text-[rgba(14,163,3,1)] mt-1">
                            Keep it up!
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-tight mb-0.5">7 Days</h3>
                        <p className="text-[rgba(10,13,26,1)] opacity-70 text-sm font-medium">Streak</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

interface InvitesResponse {
    items: any[]
}
interface PracticeResponse {
    items: any[]
}
interface ResultsResponse {
    items: any[]
}

async function MainGrid() {
    const [invitesResponse, practiceResponse, resultsResponse] = await Promise.all([
        serverFetch<InvitesResponse>('/api/v1/user/interview/invites/', {
            method: 'POST',
            body: { page: 1, page_size: 2 }
        }),
        serverFetch<PracticeResponse>('/api/v1/user/interview/practice/filter/', {
            method: 'POST',
            body: { page: 1, page_size: 2, role: '' }
        }),
        serverFetch<ResultsResponse>('/api/v1/user/interview/results/filter/', {
            method: 'POST',
            body: { page: 1, page_size: 2, status: 'completed', is_scored: true }
        })
    ]);

    const invites = invitesResponse?.items || [];
    const practice = practiceResponse?.items || [];
    const results = resultsResponse?.items || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InterviewInvitesCard items={invites} />
            <CompanyPracticeCard items={[]} />
            <PracticeInterviewsCard items={practice} />
            <LatestResultsCard items={results} />
        </div>
    )
}

export default function Dashboard2Page() {
    return (
        <div className="min-h-screen w-full p-8 lg:p-10 pb-20 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                    <Suspense fallback={<Skeleton className="h-16 w-[300px]" />}>
                        <DashboardHeader />
                    </Suspense>
                </div>
            </div>

            {/* Stats Cards */}
            <Suspense fallback={<Skeleton className="h-[140px] w-full" />}>
                <StatsCards />
            </Suspense>

            {/* Grids */}
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <MainGrid />
            </Suspense>
        </div>
    )
}

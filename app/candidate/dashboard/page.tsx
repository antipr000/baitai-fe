import React, { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { serverFetch, getUserPreferences, type UserPreferences } from '@/lib/api/server'
import { Button } from '@/components/ui/button'
import {
    InterviewInvitesCard,
    CompanyPracticeCard,
    PracticeInterviewsCard,
    LatestResultsCard
} from './components/dashboard-sections'

interface InterviewStats {
    average_score: number
    completed: number
    pending: number
    completed_this_week: number
    pending_this_week: number
    avg_score_delta: number | null
    streak: number
}


async function DashboardHeader() {
    const response = await serverFetch<InterviewStats>('/api/v1/user/interview/stats/')
    const pending = response?.pending ?? 0

    return (
        <div className="">
            <h1 className="text-3xl font-semibold text-[rgba(17,24,39,1)] mb-2 tracking-tight">Dashboard</h1>
            <p className="text-[rgba(17,24,39,0.6)] text-base">
                You have <span className={pending > 0 ? "text-[rgba(107,114,128,1)]" : "text-[rgba(14,163,3,1)]"}>{pending} pending {pending <= 1 ? 'interview' : 'interviews'}</span>
            </p>
        </div>
    )
}

function WeeklyBadge({ value, suffix }: { value: number; suffix: string }) {
    if (value > 0) {
        return (
            <div className="text-[12px] text-[rgba(14,163,3,1)] flex items-center gap-1 mt-1">
                <Image src="/candidate/dashboard/up.svg" alt="Up" width={12} height={12} />
                +{value} {suffix}
            </div>
        )
    }
    if (value < 0) {
        return (
            <div className="text-[12px] text-[rgba(255,20,20,1)] flex items-center gap-1 mt-1">
                <Image src="/candidate/dashboard/down.svg" alt="Down" width={15} height={15} />
                -{value} {suffix}
            </div>
        )
    }
    return null
}

function ScoreDeltaBadge({ delta }: { delta: number | null }) {
    if (delta === null) {
        return null
    }
    if (delta > 0) {
        return (
            <div className="text-[12px] text-[rgba(14,163,3,1)] flex items-center gap-1 mt-1">
                <Image src="/candidate/dashboard/up.svg" alt="Up" width={12} height={12} />
                +{delta}% from last
            </div>
        )
    }
    if (delta < 0) {
        return (
            <div className="text-[12px] text-[rgba(255,20,20,1)] flex items-center gap-1 mt-1">
                <Image src="/candidate/dashboard/down.svg" alt="Down" width={15} height={15} />
                {delta}% from last
            </div>
        )
    }
    return null
}

async function StatsCards() {
    const response = await serverFetch<InterviewStats>('/api/v1/user/interview/stats/')
    const stats: InterviewStats = response ?? { average_score: 0, completed: 0, pending: 0, completed_this_week: 0, pending_this_week: 0, avg_score_delta: null, streak: 0 }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending */}
            <Card className="border-[rgba(107,124,255,1)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden py-2">
                <CardContent className="p-5 flex flex-col gap-3 justify-between">
                    <div className="flex items-start justify-between">
                        <div className="w-8 h-8 rounded-md bg-[rgba(240,243,255,1)] flex items-center justify-center">
                            <Image src="/candidate/dashboard/time.svg" alt="Pending" width={20} height={20} />
                        </div>
                        {stats.pending_this_week > 0 && (
                            <div className="text-[12px] text-[rgba(10,13,26,0.6)] flex items-center gap-1 mt-1">
                                +{stats.pending_this_week} this week
                            </div>
                        )}
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
                            <Image src="/candidate/dashboard/tick.svg" alt="Completed" width={20} height={20} />
                        </div>
                        <WeeklyBadge value={stats.completed_this_week} suffix="this week" />
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
                            <Image src="/candidate/dashboard/doc.svg" alt="Score" width={20} height={20} />
                        </div>
                        <ScoreDeltaBadge delta={stats.avg_score_delta} />
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
                            <Image src="/candidate/dashboard/fire.svg" alt="Streak" width={20} height={20} />
                        </div>
                        {stats.streak >= 2 && (
                            <div className="text-[12px] text-[rgba(14,163,3,1)] mt-1">
                                Keep it up!
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-tight mb-0.5">{stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}</h3>
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

function DashboardHeaderSkeleton() {
    return (
        <div className="mb-4 space-y-2">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-5 w-72" />
        </div>
    )
}

function StatsCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className=" shadow-sm py-2">
                    <CardContent className="p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function MainGridSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border shadow-sm">
                    <CardContent className="p-5 space-y-4">
                        <Skeleton className="h-6 w-40" />
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map((__, j) => (
                                <div key={j} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-20 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

async function MainGrid() {
    const [invitesResponse, companyPracticeResponse, generalPracticeResponse, resultsResponse, userPrefs] = await Promise.all([
        serverFetch<InvitesResponse>('/api/v1/user/interview/invites/', {
            method: 'POST',
            body: { page: 1, page_size: 2 }
        }),
        serverFetch<PracticeResponse>('/api/v1/user/interview/practice/filter/', {
            method: 'POST',
            body: { 
                page: 1, 
                page_size: 2, 
                role: '',
                has_any_company_tag: true
            }
        }),
        getUserPreferences().then((prefs: UserPreferences | null) => 
            serverFetch<PracticeResponse>('/api/v1/user/interview/practice/filter/', {
                method: 'POST',
                body: { 
                    page: 1, 
                    page_size: 2, 
                    role: prefs?.role || '',
                    level_tags: prefs?.experience ? [prefs.experience] : []
                }
            })
        ),
        serverFetch<ResultsResponse>('/api/v1/user/interview/results/filter/', {
            method: 'POST',
            body: { page: 1, page_size: 2, status: 'completed', is_scored: true }
        }),
        getUserPreferences()
    ]);

    const invites = invitesResponse?.items || [];
    const companyPractice = companyPracticeResponse?.items || [];
    const generalPractice = generalPracticeResponse?.items || [];
    const results = resultsResponse?.items || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InterviewInvitesCard items={invites} />
            <CompanyPracticeCard items={companyPractice} />
            <PracticeInterviewsCard items={generalPractice} />
            <LatestResultsCard items={results} />
        </div>
    )
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen w-full p-8 lg:p-10 pb-20 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                    <Suspense fallback={<DashboardHeaderSkeleton />}>
                        <DashboardHeader />
                    </Suspense>
                </div>
            </div>

            {/* Stats Cards */}
            <Suspense fallback={<StatsCardsSkeleton />}>
                <StatsCards />
            </Suspense>

            {/* Grids */}
            <Suspense fallback={<MainGridSkeleton />}>
                <MainGrid />
            </Suspense>
        </div>
    )
}

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { RecentResultsSection, ApiResultItem } from '@/components/candidate/dashboard/recent-results-section'
import { InterviewInvitesSection, Interview } from '@/components/candidate/dashboard/interview-invites-section'
import { PracticeInterviewsSection, PracticeInterview } from '@/components/candidate/dashboard/practice-interviews-section'
import { serverFetch } from '@/lib/api/server'

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

// --- Helper Functions for Data Fetching ---

function formatDueDate(dueDate: string): string {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
}

function capitalize(str: string): string {
    if (!str) return 'Easy'
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() as string
}

interface InvitesResponse {
    items: {
        id: string
        status: string
        end_date: string
        created_at: string
        title: string
        company_name: string
        message: string
        template_id: string
    }[]
}

async function getInterviewInvites(): Promise<Interview[]> {
    const response = await serverFetch<InvitesResponse>('/api/v1/user/interview/invites/', {
        method: 'POST',
        body: { page: 1, page_size: 2 }
    })

    if (!response) {
        console.warn('Failed to fetch interview invites')
        return []
    }

    return response.items.map((item) => ({
        id: item.id,
        company: item.company_name,
        position: item.title,
        dueIn: formatDueDate(item.end_date),
        status: item.status,
        template_id: item.template_id
    }))
}

interface PracticeResponse {
    items: {
        id: string
        title: string
        role: string
        duration: number
        difficulty_level: string
    }[]
}

async function getPracticeInterviews(): Promise<PracticeInterview[]> {
    const response = await serverFetch<PracticeResponse>('/api/v1/user/interview/practice/filter/', {
        method: 'POST',
        body: {
            page: 1,
            page_size: 2,
            role: ''
        }
    })

    if (!response || !response.items) {
        console.warn('Failed to fetch practice interviews')
        return []
    }

    return response.items.slice(0, 2).map((item) => ({
        id: item.id,
        title: item.title,
        difficulty: capitalize(item.difficulty_level) as 'Easy' | 'Medium' | 'Difficult',
        duration: `${item.duration} min`,
    }))
}

interface ResultsResponse {
    items: ApiResultItem[]
}

async function getRecentResults(): Promise<ApiResultItem[]> {
    const response = await serverFetch<ResultsResponse>('/api/v1/user/interview/results/filter/', {
        method: 'POST',
        body: { page: 1, page_size: 5, status: "completed", is_scored: true }
    })

    if (!response || !response.items) {
        return []
    }
    return response.items
}

async function getStats(): Promise<InterviewStats> {
    const response = await serverFetch<InterviewStats>('/api/v1/user/interview/stats/')
    if (!response) {
        console.warn('Failed to fetch interview stats')
        return { average_score: 0, total_time: 0, completed: 0, pending: 0 }
    }
    return response
}

export default async function DashboardPage() {

    // Parallel Data Fetching
    console.time('Dashboard Data Fetch')
    const [stats, invites, practice, results] = await Promise.all([
        getStats(),
        getInterviewInvites(),
        getPracticeInterviews(),
        getRecentResults()
    ])
    console.timeEnd('Dashboard Data Fetch')

    return (
        <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
            <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto  ">
                <div className="max-w-7xl mx-auto p-6 space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-center ">
                        <div className='flex items-center justify-center gap-4'>
                            <Link href="/">
                                <div className='bg-[rgba(98,117,252,0.82)]  p-2 px-1 rounded-md'>
                                    <Image src="/candidate/dashboard/left-arrow.svg" alt="Back" width={20} height={20} />
                                </div>
                            </Link>
                            <h1 className="text-2xl tracking-wide font-bold bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)] bg-clip-text text-transparent">My Dashboard</h1>
                        </div>
                        <Link href="/results" className="flex items-center gap-2 px-4 py-2 rounded-md text-white bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)] hover:opacity-90 transition-opacity">
                            <Image src="/candidate/dashboard/note.svg" alt="Results" width={20} height={20} /> <span className='font-semibold'>View all Results</span>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Completed */}
                        <Card className="bg-[rgba(0,186,0,0.1)] border border-[rgba(0,186,0,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/candidate/dashboard/complete.svg" alt="Completed" width={50} height={50} />
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Completed</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">{stats.completed}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending */}
                        <Card className="bg-[rgba(254,118,168,0.1)] border border-[rgba(252,183,50,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/candidate/dashboard/pending.svg" className='group-hover:-rotate-10 transition-all duration-400' alt="Pending" width={50} height={50} />
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Pending</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">{stats.pending}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Average Score */}
                        <Card className="bg-[rgba(252,183,50,0.1)] border border-[rgba(252,183,50,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/candidate/dashboard/score.svg" className='group-hover:-rotate-10 transition-all duration-400' alt="score" width={50} height={50} />
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Average Score</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">{stats.average_score.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Time */}
                        <Card className="bg-[rgba(224,83,83,0.1)] border border-[rgba(224,83,83,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/candidate/dashboard/time.svg" className='group-hover:-rotate-10 transition-all duration-400' alt="time" width={50} height={50} />
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Total Time</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">{formatTime(stats.total_time)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content - Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-15">
                        <InterviewInvitesSection
                            interviews={invites}
                            viewMoreHref="/candidate/company-interviews"
                        />
                        <PracticeInterviewsSection
                            interviews={practice}
                            viewMoreHref="/candidate/practice-interviews"
                        />
                    </div>

                    {/* Recent Results Section */}
                    <RecentResultsSection
                        results={results}
                        viewMoreHref="/results"
                    />
                </div>
            </div>
        </div>
    )
}

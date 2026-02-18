import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { RecentResultsSection } from '@/components/candidate/dashboard/recent-results-section'
import { InterviewInvitesSection } from '@/components/candidate/dashboard/interview-invites-section'
import { PracticeInterviewsSection } from '@/components/candidate/dashboard/practice-interviews-section'
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

export default async function DashboardPage() {
    // const response = await serverFetch<InterviewStats>('/api/v1/user/interview/stats/')

    // if (!response) {
    //     console.warn('Failed to fetch interview stats')
    // }

    // const stats = response ?? { average_score: 0, total_time: 0, completed: 0, pending: 0 }
    const stats ={ average_score: 0, total_time: 0, completed: 0, pending: 0 }

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
                        <InterviewInvitesSection viewMoreHref="/candidate/company-interviews" />
                        <PracticeInterviewsSection viewMoreHref="/candidate/practice-interviews" />
                    </div>

                    {/* Recent Results Section */}
                    <RecentResultsSection viewMoreHref="/results" />
                </div>
            </div>
        </div>
    )
}

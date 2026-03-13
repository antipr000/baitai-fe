import { serverFetch } from '@/lib/api/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton2 } from '@/components/ui/back-button2'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, PlusCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { LogoutButton } from '@/components/company/logout-button'
import { CompanyHeader } from './components/company-header'

interface CompanyStats {
    total_interviews: number
    candidates: number
    average_duration: number
    active: number
}

interface InterviewItem {
    id: string
    template_id: string
    title: string
    status: "active" | "archived" | "draft"
    sections: number
    candidates: number
    avg_time: number
    date: string
}

interface InterviewListResponse {
    items: InterviewItem[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

function formatDuration(minutes: number): string {
    const totalMinutes = Math.round(minutes)
    if (totalMinutes < 60) return `${totalMinutes}m`
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function getStatusColor(status: string): string {
    const s = status.toLowerCase()
    if (s === 'active') {
        return "bg-[rgba(50,255,36,0.1)] text-[rgba(55,212,44,0.7)] border border-[rgba(50,255,36,0.5)]"
    } else if (s === 'draft') {
        return "bg-[rgba(252,183,50,0.1)] text-[rgba(252,183,50,1)] border border-[rgba(252,183,50,0.5)]"
    } else {
        return "bg-[rgba(104,100,247,0.1)] text-[rgba(104,100,247,1)] border border-[rgba(104,100,247,0.5)]"
    }
}

export default async function CompanyDashboard() {
    const statsResponsePromise = serverFetch<CompanyStats>('/api/v1/company/stats/')
    const interviewsResponsePromise = serverFetch<InterviewListResponse>('/api/v1/company/interviews/list/', {
        method: 'POST',
        body: { page: 1, page_size: 5 }
    })
    const creditsResponsePromise = serverFetch<{ credits: number }>('/api/v1/company/credits/')

    const [statsResponse, interviewsResponse, creditsResponse] = await Promise.all([statsResponsePromise, interviewsResponsePromise, creditsResponsePromise])

    const credits = creditsResponse?.credits ?? 0

    const stats = statsResponse || {
        total_interviews: 0,
        candidates: 0,
        average_duration: 0,
        active: 0
    }

    const recentInterviews = interviewsResponse?.items || []

    return (
        <div className='w-full min-h-screen bg-[rgba(248,250,255,1)] flex flex-col'>
            <CompanyHeader credits={credits} />
            <div className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-10">
                <div className="space-y-10">
                    <div className="flex justify-between items-end">
                        <div className='space-y-1'>
                            <h1 className="text-3xl font-semibold text-[rgba(17,24,39,1)]">Dashboard</h1>
                        </div>
                        <Link href="/company/create">
                            <Button variant="outline" className="border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:text-[rgba(58,63,187,1)] flex items-center gap-2 rounded-lg px-4 h-10">
                                <Image src="/company/dashboard/plus.svg" alt="Plus" width={16} height={16} />
                                <span className="text-sm font-medium">New Interview</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {/* Total Interviews */}
                        <Card className="rounded-xl border-[rgba(107,124,255,1)] shadow-none h-full py-2.5 bg-white">
                            <CardContent className="p-6 space-y-4 py-2">
                                <div className="bg-[rgba(240,243,255,1)] w-8 h-8 rounded-sm flex items-center justify-center">
                                    <Image src="/company/dashboard/note.svg" alt="note" width={20} height={20} className="text-[#6A7DFC]" />
                                </div>
                                <div className='space-y-1'>
                                    <p className="text-3xl font-semibold text-[rgba(10,13,26,1)]">{stats.total_interviews}</p>
                                    <p className="text-sm font-medium text-[rgba(10,13,26,0.9)] whitespace-nowrap">Total Interviews Created</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Candidates  */}
                        <Card className="rounded-xl border-[rgba(107,124,255,1)] shadow-none h-full py-2.5 bg-white">
                            <CardContent className="p-6 space-y-4 py-2">
                                <div className="bg-[rgba(240,243,255,1)] w-8 h-8 rounded-sm flex items-center justify-center">
                                    <Image src="/company/dashboard/people2.svg" alt="people" width={20} height={20} className="text-[#6A7DFC]" />
                                </div>
                                <div className='space-y-1'>
                                    <p className="text-3xl font-semibold text-[rgba(10,13,26,1)]">{stats.candidates}</p>
                                    <p className="text-sm font-medium text-[rgba(10,13,26,0.9)]">Candidates</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Avg Duration */}
                        <Card className="rounded-xl border-[rgba(107,124,255,1)] shadow-none h-full py-2.5 bg-white">
                            <CardContent className="p-6 space-y-4 py-2">
                                <div className="bg-[rgba(240,243,255,1)] w-8 h-8 rounded-sm flex items-center justify-center">
                                    <Image src="/company/dashboard/time2.svg" alt="time" width={20} height={20} className="text-[#6A7DFC]" />
                                </div>
                                <div className='space-y-1'>
                                    <p className="text-3xl font-semibold text-[rgba(10,13,26,1)]">{formatDuration(stats.average_duration)}</p>
                                    <p className="text-sm font-medium text-[rgba(10,13,26,0.9)]">Avg Duration</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active  */}
                        <Card className="rounded-xl border-[rgba(107,124,255,1)] shadow-none h-full py-2.5 bg-white">
                            <CardContent className="p-6 space-y-4 py-2">
                                <div className="bg-[rgba(240,243,255,1)] w-8 h-8 rounded-sm flex items-center justify-center">
                                    <Image src="/company/dashboard/setting.svg" alt="settings" width={20} height={20} className="text-[#6A7DFC]" />
                                </div>
                                <div className='space-y-1'>
                                    <p className="text-3xl font-semibold text-[rgba(10,13,26,1)]">{stats.active}</p>
                                    <p className="text-sm font-medium text-[rgba(10,13,26,0.9)]">Active</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Your Interviews Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <div className='font-medium text-2xl text-[rgba(10,13,26,1)]'>
                                Your Interviews
                            </div>

                            <Link
                                href="/company/interviews"
                                className="text-[rgba(58,63,187,1)] font-semibold hover:underline flex items-center gap-1 text-sm"
                            >
                                <span>View more</span> <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentInterviews.length > 0 ? (
                                <>
                                    {recentInterviews.map((interview) => (
                                        <Card key={interview.id} className="relative rounded-xl border-[rgba(107,124,255,0.5)] shadow-none hover:border-2 hover:border-[rgba(107,124,255,1)] transition-colors duration-200 px-4 py-2.5">
                                            <Link href={`/company/sessions/${interview.template_id}`} className="absolute inset-0" />
                                            <CardContent className="p-4  flex items-center justify-between relative z-10 pointer-events-none">
                                                <div className="space-y-2">
                                                    <h3 className="text-base font-medium text-[rgba(10,13,26,1)]">{interview.title}</h3>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs text-[rgba(10,13,26,0.7)]">
                                                            <Image src="/company/dashboard/note2.svg" alt='note' width={12} height={12} />
                                                            <span>{interview.sections} Sections</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-[rgba(10,13,26,0.7)]">
                                                            <div className="flex items-center gap-2">
                                                                <Image src="/company/dashboard/people2.svg" alt='people' width={12} height={12} className="text-[#6A7DFC]" />
                                                                <span>{interview.candidates} candidates</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Image src="/company/dashboard/time2.svg" alt='time' width={12} height={12} className="text-[#6A7DFC]" />
                                                                <span >{formatDuration(interview.avg_time)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link href={`/company/edit/${interview.template_id}`} className="pointer-events-auto">
                                                    <Button className="bg-[rgba(58,63,187,1)] hover:bg-transparent hover:border hover:border-[rgba(58,63,187,1)] hover:text-[rgba(58,63,187,1)] text-white rounded-md px-6 py-2.5 h-auto flex items-center gap-2 min-w-[160px] justify-center transition-all duration-200">
                                                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-200">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M13.0298 1.17417C12.2976 0.441943 11.1104 0.44194 10.3781 1.17417L1.52965 10.0227C1.2679 10.2844 1.08948 10.6178 1.01689 10.9808L0.649969 12.8154C0.475039 13.69 1.24619 14.4612 2.12084 14.2863L3.95543 13.9193C4.31841 13.8468 4.65178 13.6683 4.91353 13.4066L13.762 4.55806C14.4942 3.82582 14.4942 2.63864 13.762 1.90641L13.0298 1.17417ZM11.262 2.05806C11.5061 1.81398 11.9018 1.81398 12.1459 2.05806L12.8781 2.79029C13.1222 3.03437 13.1222 3.43009 12.8781 3.67418L11.2084 5.34392L9.59231 3.7278L11.262 2.05806ZM8.70838 4.61169L2.41353 10.9066C2.32628 10.9938 2.26681 11.1049 2.24261 11.2259L1.87569 13.0605L3.71028 12.6936C3.83128 12.6694 3.9424 12.6099 4.02965 12.5227L10.3245 6.2278L8.70838 4.61169Z" fill="currentColor"/>
                                                        </svg>
                                                        <span className=" font-normal text-sm">Edit Interview</span>
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <div className="flex justify-end pt-2 px-2">
                                        <Link
                                            href="/company/interviews"
                                            className="text-[rgba(58,63,187,1)] font-semibold hover:underline flex items-center gap-1 text-sm"
                                        >
                                            <span>View more</span> <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <Card className="border-[rgba(106,125,252,0.3)] border-dashed rounded-xl">
                                    <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                                            <Image src="/company/dashboard/note2.svg" alt="No interviews" width={40} height={40} className="h-10 w-10 " />
                                        <div>
                                            <h3 className="text-lg font-semibold text-[rgba(10,13,26,1)]">No interviews found</h3>
                                            <p className="text-[rgba(10,13,26,0.7)] text-sm">Create your first interview to get started</p>
                                        </div>
                                        <Link href="/company/create">
                                            <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white rounded-sm p-5">
                                                Create Interview
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

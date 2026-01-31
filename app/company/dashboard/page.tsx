import { serverFetch } from '@/lib/api/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton2 } from '@/components/ui/back-button2'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, PlusCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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

    const [statsResponse, interviewsResponse] = await Promise.all([statsResponsePromise, interviewsResponsePromise])

    const stats = statsResponse || {
        total_interviews: 0,
        candidates: 0,
        average_duration: 0,
        active: 0
    }

    const recentInterviews = interviewsResponse?.items || []

    return (
        <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
            <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto">
                <div className="max-w-7xl mx-auto p-6 space-y-10">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className='flex items-center gap-4'>
                            <BackButton2 />
                            <h1 className="text-3xl tracking-tight font-semibold text-transparent bg-clip-text bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)]">Creator Dashboard</h1>
                        </div>
                        <Link href="/company/create">
                            <Button size={"lg"} className="bg-[linear-gradient(93.21deg,rgba(62,84,251,0.9)_-31.21%,rgba(195,206,255,0.9)_174.4%)] hover:opacity-80  text-white flex items-center gap-2 rounded-lg px-6">
                                <PlusCircle className="h-14 w-14 translate-y-px" />
                                <span className="text-xl font-medium">New Interview</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                        {/* Total Interviews */}
                        <Card className="bg-[rgba(104,100,247,0.1)] border border-[rgba(104,100,247,0.5)]">
                            <CardContent className="pt-6 ">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/company/dashboard/note.svg" alt="note" width={48} height={48} className="h-12 w-12 group-hover:-rotate-10 transition-all duration-400" />
                                    <div>
                                        <p className="font-medium text-[rgba(10,13,26,0.46)] mb-2 transition-all duration-400 group-hover:-translate-y-1.5 whitespace-nowrap">Total Interviews</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">{stats.total_interviews}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Candidates  */}
                        <Card className="bg-[rgba(253,96,80,0.1)] border border-[rgba(253,96,80,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/company/dashboard/people.svg" alt="people" width={48} height={48} className="h-12 w-12 group-hover:-rotate-10 transition-all duration-400" />

                                    <div>
                                        <p className="font-medium text-[rgba(10,13,26,0.46)] mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Candidates</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">{stats.candidates}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Avg Duration */}
                        <Card className="bg-[rgba(51,204,204,0.1)] border border-[rgba(51,204,204,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/company/dashboard/time.svg" alt="time" width={48} height={48} className="h-12 w-12 group-hover:-rotate-10 transition-all duration-400" />

                                    <div>
                                        <p className="font-medium text-[rgba(10,13,26,0.46)] mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Avg Duration</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">{formatDuration(stats.average_duration)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active  */}
                        <Card className="bg-[rgba(113,184,108,0.1)] border border-[rgba(113,184,108,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/company/dashboard/wheel.svg" alt="settings" width={48} height={48} className="h-12 w-12 group-hover:-rotate-10 transition-all duration-400" />

                                    <div>
                                        <p className="font-medium text-[rgba(10,13,26,0.46)] mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Active</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">{stats.active}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Your Interviews Section */}
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <Link
                                href="/company/interviews"
                                className="text-[rgba(255,100,27,0.9)] font-semibold hover:underline flex items-center gap-2"
                            >
                                <span>View more</span> <span className='translate-y-0.5'><ArrowRight className="w-5 h-5" /></span>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentInterviews.length > 0 ? (
                                recentInterviews.map((interview) => (
                                    <Card key={interview.id} className="relative hover:border-[rgba(106,125,252,1)] transition-hover duration-200 ease-in-out border-[rgba(106,125,252,0.3)]">
                                        <Link href={`/company/sessions/${interview.template_id}`} className="absolute inset-0" />
                                        <CardContent className="p-6 flex items-center justify-between relative z-10 pointer-events-none">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-800">{interview.title}</h3>
                                                    <Badge className={`${getStatusColor(interview.status)} border-0 px-3 py-1 font-medium capitalize`}>
                                                        {interview.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <Image src="/company/dashboard/note2.svg" alt='note' width={16} height={16} className="h-4 w-4" />
                                                        <span>{interview.sections} Section{interview.sections > 1 ? 's' : ''}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Image src="/company/dashboard/people2.svg" alt='people' width={16} height={16} className="h-4 w-4" />
                                                        <span>{interview.candidates} Candidate{interview.candidates > 1 ? 's' : ''}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Image src="/company/dashboard/time2.svg" alt='time' width={16} height={16} className="h-4 w-4" />
                                                        <span>{formatDuration(interview.avg_time)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link href={`/company/edit/${interview.template_id}`} className="pointer-events-auto">
                                                <Button variant="outline" className="bg-[rgba(255,144,85,0.2)] hover:bg-[rgba(255,144,85,0.7)]  rounded-full border border-[rgba(255,241,234,0.1)]  text-[rgba(10,13,26,0.7)] gap-2">
                                                    <Image src="/company/dashboard/pencil.svg" alt='pencil' width={16} height={16} className="h-4 w-4" />
                                                    <span className="text-[rgba(10,13,26,0.7)] font-bold text-sm">Edit</span>
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="border-[rgba(106,125,252,0.3)] border-dashed">
                                    <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="bg-[rgba(104,100,247,0.1)] p-4 rounded-full">
                                            <Image src="/company/dashboard/note.svg" alt="No interviews" width={48} height={48} className="h-12 w-12 opacity-50" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">No interviews found</h3>
                                            <p className="text-muted-foreground mt-1">Create your first interview to get started</p>
                                        </div>
                                        <Link href="/company/create">
                                            <Button className="bg-[linear-gradient(93.21deg,rgba(62,84,251,0.9)_-31.21%,rgba(195,206,255,0.9)_174.4%)] text-white hover:opacity-90">
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

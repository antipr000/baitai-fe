import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BackButton2 } from '@/components/ui/back-button2'
import Image from 'next/image'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { DataTable } from './data-table'
import { columns, Interview } from './columns'
import { BackButton } from '@/components/ui/back-button'
import { serverFetch } from '@/lib/api/server'

interface InterviewListResponse {
    items: Interview[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

interface InterviewStats {
    total_interviews: number
    active: number
    candidates: number
}

async function getInterviews(): Promise<Interview[]> {
    const response = await serverFetch<InterviewListResponse>('/api/v1/company/interviews/list/', {
        method: 'POST',
        body: { page: 1, page_size: 100 }
    })
    return response?.items || []
}

async function getStats(): Promise<InterviewStats> {
    const response = await serverFetch<InterviewStats>('/api/v1/company/stats/')
    return response || { total_interviews: 0, active: 0, candidates: 0 }
}

export default async function InterviewsPage() {
    const [interviews, stats] = await Promise.all([getInterviews(), getStats()])

    return (
        <div className='w-full min-h-screen bg-white flex flex-col'>
            <div className="bg-white  w-full">
                <div className="max-w-7xl mx-auto px-6 py-10 pb-5 flex justify-between items-center">
                    <div className='flex items-start gap-4'>
                        <BackButton />
                        <div>
                            <h1 className="text-2xl font-semibold text-[rgba(10,13,26,1)]">All Interviews</h1>
                            <p className="text-[rgba(107,114,128,0.7)] ">Manage all your created interviews</p>
                        </div>
                    </div>
                    <Link href="/company/create">
                        <Button variant="outline" className="border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:text-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.05)] flex items-center gap-2 rounded-sm px-6 h-11">
                            <Image src="/company/dashboard/plus.svg" alt="Plus" width={18} height={18} />
                            <span className="font-medium">New Interview</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto p-6 space-y-10">
                <div className="space-y-10">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-23">
                        {/* Total Interviews */}
                        <Card className="rounded-xl border-[rgba(58,63,187,1)] shadow-none h-full bg-white">
                            <CardContent className="p-6 flex flex-row items-center gap-4 py-3">
                                <div className="bg-[rgba(240,243,255,1)] w-7 h-7 rounded-sm shrink-0 flex items-center justify-center">
                                    <Image src="/company/interviews/doc.svg" alt="doc" width={20} height={20} className="text-[#6A7DFC]" />
                                </div>
                                <div className='space-y-0.5'>
                                    <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.total_interviews}</p>
                                    <p className="text-lg font-medium text-[rgba(10,13,26,1)] whitespace-nowrap">Total Interviews</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Interviews */}
                        <Card className="rounded-xl border-[rgba(58,63,187,1)] shadow-none h-full bg-white">
                            <CardContent className="p-6 flex flex-row items-center gap-4 py-3">
                                <div className="bg-[rgba(240,243,255,1)] w-7 h-7 rounded-sm shrink-0 flex items-center justify-center">
                                    <Image src="/company/dashboard/time2.svg" alt="time" width={20} height={20} className="text-[#6A7DFC]" />
                                </div>
                                <div className='space-y-0.5'>
                                    <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.active}</p>
                                    <p className="text-lg font-medium text-[rgba(10,13,26,1)] whitespace-nowrap">Active Interviews</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Candidates */}
                        <Card className="rounded-xl border-[rgba(58,63,187,1)] shadow-none h-full bg-white">
                            <CardContent className="p-6 flex flex-row items-center gap-4 py-3">
                                <div className="bg-[rgba(240,243,255,1)] w-7 h-7 rounded-sm shrink-0 flex items-center justify-center">
                                    <Image src="/company/dashboard/people2.svg" alt="people" width={20} height={20} className="text-[#6A7DFC]" />
                                </div>
                                <div className='space-y-0.5'>
                                    <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{stats.candidates}</p>
                                    <p className="text-lg font-medium text-[rgba(10,13,26,1)] whitespace-nowrap">Total Candidates</p>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Table Section */}
                    <div>
                        <DataTable columns={columns} data={interviews} />
                    </div>

                </div>
            </div>
        </div>
    )
}

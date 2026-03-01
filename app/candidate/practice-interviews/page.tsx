import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import Image from 'next/image'
import React, { Suspense } from 'react'
import { DataTable } from './data-table'
import { columns, PracticeInterview } from './columns'
import { serverFetch } from '@/lib/api/server'
import {
    PracticeStatsSkeleton,
    PracticeTableSkeleton,
} from '@/components/candidate/practice-interviews/practice-skeletons'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ApiPracticeInterview {
    id: string
    title: string
    role: string
    difficulty_level: string
    duration: number
}

interface ApiResponse {
    items: ApiPracticeInterview[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

interface MetadataResponse {
    total: number
    easy: number
    medium: number
    difficult: number
}

function capitalize(str: string): string {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// ─── Async server sub-components ──────────────────────────────────────────────

async function PracticeStats() {
    const response = await serverFetch<MetadataResponse>('/api/v1/user/interview/practice/metadata/')
    const metadata: MetadataResponse = response ?? { total: 0, easy: 0, medium: 0, difficult: 0 }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Total */}
            <Card className="bg-[linear-gradient(104.37deg,rgba(246,251,255,0.1)_-20.97%,rgba(75,179,255,0.1)_129.56%)] border border-[rgba(75,179,255,0.5)]">
                <CardContent className="">
                    <div className=" flex items-center gap-3">
                        <Image src="/candidate/practice-interviews/up.svg" className='translate-y-1' alt="Company" width={30} height={30} />
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Total Practice</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)] ">{metadata.total}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/*Easy */}
            <Card className="bg-[linear-gradient(109.41deg,rgba(244,255,240,0.1)_-15.66%,rgba(106,175,80,0.15)_34.39%)] border border-[rgba(106,175,80,0.5)]">
                <CardContent className="">
                    <div className=" flex items-center gap-3">
                        <Image src="/candidate/practice-interviews/target-green.svg" className="translate-y-1" alt="positions" width={30} height={30} />
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Easy</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">{metadata.easy}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/*Medium*/}
            <Card className="bg-[linear-gradient(109.41deg,rgba(255, 250, 242, 0.3)_-15.66%,rgba(252,183,50,0.1)_119.55%)] border border-[rgba(252,183,50,0.5)]">
                <CardContent className="">
                    <div className=" flex items-center gap-3">
                        <Image src="/candidate/practice-interviews/target-yellow.svg" className="translate-y-1" alt="positions" width={30} height={30} />
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Medium</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">{metadata.medium}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/*Hard */}

            <Card className="bg-[linear-gradient(109.41deg,rgba(242,255,255,0.15)_-15.66%,rgba(255,51,0,0.15)_119.55%)] border border-[rgba(255,51,0,0.5)]">
                <CardContent className="">
                    <div className=" flex items-center gap-3">
                        <Image src="/candidate/practice-interviews/target-red.svg" className="translate-y-1" alt="positions" width={30} height={30} />
                        <div className=''>
                            <p className="text-xl font-medium text-muted-foreground/70 ">Difficult</p>
                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">{metadata.difficult}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

async function PracticeTable() {
    const response = await serverFetch<ApiResponse>('/api/v1/user/interview/practice/filter/', {
        method: 'POST',
        body: {
            page: 1,
            page_size: 20,
            role: '',
            difficulty_level: null
        }
    })

    const data: PracticeInterview[] = response?.items
        ? response.items.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.role || 'General',
            difficulty: capitalize(item.difficulty_level) as PracticeInterview['difficulty'],
            duration: `${item.duration} min`,
        }))
        : []

    return <DataTable columns={columns} data={data} />
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PracticeInterviews() {
    return (
        <div>
            <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
                <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto">
                    <div className="max-w-7xl mx-auto p-6 space-y-8 mb-5">

                        {/* Header */}
                        <div className="flex justify-between items-center ">
                            <div className='flex items-center justify-center gap-4'>
                                <BackButton />
                                <h1 className="text-2xl tracking-wide font-semibold bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)] bg-clip-text text-transparent">Practice Interviews</h1>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <Suspense fallback={<PracticeStatsSkeleton />}>
                            <PracticeStats />
                        </Suspense>

                        {/* Data table */}
                        <Suspense fallback={<PracticeTableSkeleton />}>
                            <PracticeTable />
                        </Suspense>

                    </div>
                </div>
            </div>
        </div>
    )
}

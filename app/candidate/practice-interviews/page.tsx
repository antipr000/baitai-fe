import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import React, { Suspense } from 'react'
import { DataTable } from './components/data-table'
import { columns, PracticeInterview } from './components/columns'
import { serverFetch, getPreferencesMetadata } from '@/lib/api/server'
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
    tags?: { tag_type: string; value: string }[]
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
    hard: number
}



// ─── Async server sub-components ──────────────────────────────────────────────

async function PracticeStats() {
    const response = await serverFetch<MetadataResponse>('/api/v1/user/interview/practice/metadata/')
    const metadata: MetadataResponse = response ?? { total: 0, easy: 0, medium: 0, hard: 0 }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Total */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/practice-inteviews/all.svg" alt="All" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{metadata.total}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Total Practice Interviews</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Easy */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/practice-inteviews/easy.svg" alt="Easy" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{metadata.easy}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Easy</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Medium */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/practice-inteviews/medium.svg" alt="Medium" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{metadata.medium}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Medium</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Hard */}
            <Card className="border border-[rgba(58,63,187,1)] shadow-sm bg-white rounded-[12px]">
                <CardContent className="">
                    <div className="flex items-center gap-4">
                        <Image src="/candidate/practice-inteviews/hard.svg" alt="Hard" width={24} height={24} />
                        <div>
                            <p className="text-2xl font-semibold text-[rgba(10,13,26,1)] leading-none">{metadata.hard}</p>
                            <p className="text-sm font-medium text-[rgba(10,13,26,0.7)] mt-1">Hard</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

async function PracticeTable() {
    const [response, metadata] = await Promise.all([
        serverFetch<ApiResponse>('/api/v1/user/interview/practice/filter/', {
            method: 'POST',
            body: {
                page: 1,
                page_size: 100,
                role: '',
                difficulty_level: null
            }
        }),
        getPreferencesMetadata()
    ])

    const data: PracticeInterview[] = response?.items
        ? response.items.map((item: ApiPracticeInterview) => {
            const levelTags = (item.tags || [])
                .filter(t => t.tag_type === 'level')
                .map(t => t.value)

            return {
                id: item.id,
                title: item.title,
                role: item.role || 'General',
                difficulty: item.difficulty_level.toLowerCase() as PracticeInterview['difficulty'],
                duration: `${item.duration} min`,
                experience: levelTags,
            }
        })
        : []

    return <DataTable columns={columns} data={data} roles={metadata?.roles || []} experienceLevels={metadata?.experience_levels || []} />
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PracticeInterviewsV2() {
    return (
        <div className="max-w-7xl mx-auto px-5 pt-10 w-full space-y-7 pb-10">
            <div className="flex flex-col gap-1.5 pt-2">
                <h1 className="text-3xl font-semibold text-[rgba(17,24,39,1)] tracking-tight">Practice Interviews</h1>
                <p className="text-[rgba(17,24,39,0.6)] text-base">Sharpen your skills with AI-powered mock interviews</p>
            </div>

            <Suspense fallback={<PracticeStatsSkeleton />}>
                <PracticeStats />
            </Suspense>

            <Suspense fallback={<PracticeTableSkeleton />}>
                <PracticeTable />
            </Suspense>
        </div>
    )
}

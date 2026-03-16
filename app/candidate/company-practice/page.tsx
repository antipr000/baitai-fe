import React, { Suspense } from 'react'
import { serverFetch, getPreferencesMetadata } from '@/lib/api/server'
import { CompanyPracticeClient } from './components/company-practice-client'
import { PracticeInterview } from './components/columns'
import {
    CompanyPracticeTableSkeleton,
} from '@/components/candidate/company-practice/company-practice-skeletons'

// ─── Constants ───────────────────────────────────────────────────────────────

const COMPANIES = [
    { name: 'Google', logo: '/candidate/company-practice/google.svg' },
    { name: 'Meta', logo: '/candidate/company-practice/meta.svg' },
    { name: 'Amazon', logo: '/candidate/company-practice/amazon.svg' },
    { name: 'Microsoft', logo: '/candidate/company-practice/microsoft.svg' },
    { name: 'Apple', logo: '/candidate/company-practice/apple.svg' },
]

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ApiPracticeInterview {
    id: string
    title: string
    role: string
    difficulty_level: string
    duration: number
    tags: { tag_type: string, value: string }[]
}

interface ApiResponse {
    items: ApiPracticeInterview[]
    total: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// No helpers needed, using CSS for capitalization

// ─── Async server sub-component ───────────────────────────────────────────────

async function CompanyPracticeContent() {
    const [interviewsRes, metadata] = await Promise.all([
        serverFetch<ApiResponse>('/api/v1/user/interview/practice/filter/', {
            method: 'POST',
            body: {
                page: 1,
                page_size: 100,
                has_any_company_tag: true,
                company_tags: []
            }
        }),
        getPreferencesMetadata()
    ])

    const items = interviewsRes?.items || []
    const activeRoles = metadata?.roles || []
    const experienceLevels = metadata?.experience_levels || []

    // Derive available companies from the interview tags
    const companyTags = items
        .flatMap((item: ApiPracticeInterview) => item.tags || [])
        .filter((tag) => tag.tag_type === 'company')
        .map((tag) => tag.value.toLowerCase())

    const companyTagSet = new Set(companyTags)
    const availableCompanies = COMPANIES.filter(c => companyTagSet.has(c.name.toLowerCase()))

    const interviews: PracticeInterview[] = items.map((item: ApiPracticeInterview) => {
        const companyTag = (item.tags || []).find((t) => t.tag_type === 'company')?.value
        const levelTags = (item.tags || [])
            .filter((t) => t.tag_type === 'level')
            .map((t) => t.value)
        const logo = COMPANIES.find(c => c.name.toLowerCase() === companyTag?.toLowerCase())?.logo

        return {
            id: item.id,
            title: item.title,
            role: item.role,
            experienceLevels: levelTags,
            difficulty: item.difficulty_level.toLowerCase() as PracticeInterview['difficulty'],
            duration: `${item.duration} min`,
            companyLogo: logo,
            companyName: companyTag || '',
        }
    })

    return (
        <CompanyPracticeClient
            companies={availableCompanies}
            interviews={interviews}
            roles={activeRoles}
            experienceLevelsMetadata={experienceLevels}
        />
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CompanyPracticePage() {
    return (
        <div className="max-w-7xl mx-auto px-5 pt-10 w-full space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-1.5 pt-2">
                <h1 className="text-3xl font-semibold text-[rgba(17,24,39,1)] tracking-tight">Company-specific Practice Interviews</h1>
                <p className="text-[rgba(17,24,39,0.6)] text-base">Practice AI company interviews</p>
            </div>

            <Suspense fallback={<CompanyPracticeTableSkeleton />}>
                <CompanyPracticeContent />
            </Suspense>
        </div>
    )
}

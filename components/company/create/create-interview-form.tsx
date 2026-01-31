"use client"

import React, { useEffect } from 'react'
import { Header } from './header'
import { InterviewDetails } from './interview-details'
import { IntroductionSection } from './introduction-section'
import { SectionList } from './section-list'
import { ConclusionSection } from './conclusion-section'
import { useInterviewStore } from '@/stores/interview-store'

interface CreateInterviewFormProps {
    companyId?: string
    authToken?: string
}

export function CreateInterviewForm({ companyId, authToken }: CreateInterviewFormProps) {
    const { setCompanyId } = useInterviewStore()

    useEffect(() => {
        if (companyId) {
            setCompanyId(companyId)
        }
    }, [companyId, setCompanyId])

    return (
        <div className="container mx-auto max-w-6xl py-8 space-y-8 pb-20">
            <Header authToken={authToken} />

            <div className='max-w-5xl mx-auto'>
                <InterviewDetails />
            </div>

            {/* Interview Sections */}
            <div className="space-y-4 max-w-5xl mx-auto">
                <h2 className="text-xl font-semibold text-[rgba(84,104,252,0.9)]">Interview Sections</h2>

                <IntroductionSection />

                <SectionList />

                <ConclusionSection />
            </div>
        </div>
    )
}

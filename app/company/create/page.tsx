"use client"

import React from 'react'
import { Header } from '../../../components/company/create/header'
import { InterviewDetails } from '../../../components/company/create/interview-details'
import { IntroductionSection } from '../../../components/company/create/introduction-section'
import { SectionList } from '../../../components/company/create/section-list'
import { ConclusionSection } from '../../../components/company/create/conclusion-section'

export default function CreateInterview() {
    return (
        <div className="container mx-auto max-w-6xl py-8 space-y-8 pb-20">
            <Header />

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

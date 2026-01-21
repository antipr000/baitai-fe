"use client"

import React from 'react'
import { Header } from './_components/header'
import { InterviewDetails } from './_components/interview-details'
import { IntroductionSection } from './_components/introduction-section'
import { SectionList } from './_components/section-list'
import { ConclusionSection } from './_components/conclusion-section'

export default function CreateInterview() {
    return (
        <div className="container mx-auto max-w-5xl py-8 space-y-8 pb-20">
            <Header />

            <InterviewDetails />

            {/* Interview Sections */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary/80">Interview Sections</h2>

                <IntroductionSection />

                <SectionList />

                <ConclusionSection />
            </div>
        </div>
    )
}

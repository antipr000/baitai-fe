"use client"

import React, { useState } from 'react'
import { Header } from './header'
import { InterviewDetails } from './interview-details'
import { IntroductionSection } from './introduction-section'
import { SectionList } from './section-list'
import { ConclusionSection } from './conclusion-section'
import { CreateInterviewDialog } from './create-interview-dialog'


interface CreateInterviewFormProps {
    companyId?: string
    authToken?: string
}

export function CreateInterviewForm({ companyId, authToken }: CreateInterviewFormProps) {
    const [dialogOpen, setDialogOpen] = useState(true)

    return (
        <div className="container mx-auto max-w-6xl py-8 space-y-8 pb-20">
            <CreateInterviewDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                authToken={authToken}
            />
            <Header authToken={authToken} companyId={companyId} />

            <div className='max-w-5xl mx-auto'>
                <InterviewDetails />
            </div>

            {/* Interview Sections */}
            <div className="space-y-4 max-w-5xl mx-auto">
                <h2 className="text-xl font-semibold text-[rgba(58,63,187,1)]">Interview Sections</h2>

                <IntroductionSection />

                <SectionList />

                <ConclusionSection />
            </div>
        </div>
    )
}

"use client"

import React, { useState } from 'react'
import { Header } from './header'
import { InterviewDetails } from './interview-details'
import { IntroductionSection } from './introduction-section'
import { SectionList } from './section-list'
import { ConclusionSection } from './conclusion-section'
import { CreateInterviewDialog } from './create-interview-dialog'
import api from '@/lib/api/client'


interface CreateInterviewFormProps {
    companyId?: string
    authToken?: string
    roles: string[]
}

export function CreateInterviewForm({ companyId, authToken, roles }: CreateInterviewFormProps) {
    const [dialogOpen, setDialogOpen] = useState(true)

    return (
        <div className="container mx-auto max-w-6xl py-8 space-y-8 pb-20">
            <CreateInterviewDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                authToken={authToken}
                roles={roles}
            />
            <Header authToken={authToken} companyId={companyId} />

            <div className='max-w-5xl mx-auto'>
                <InterviewDetails companyId={companyId} authToken={authToken} roles={roles} />
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

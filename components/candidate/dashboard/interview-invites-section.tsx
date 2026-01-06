'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { InterviewInviteCard } from './interview-invite-card'
import { ArrowRight } from 'lucide-react'

interface Interview {
    id: string
    company: string
    position: string
    dueIn: string
}

interface InterviewInvitesSectionProps {
    interviews?: Interview[]
    viewMoreHref?: string
}

const defaultInterviews = [
    {
        id: 'it_cjcbzuapqb767ojt',
        company: 'Mindtrix',
        position: 'Senior Software Engineer',
        dueIn: 'Due in 2 days'
    },
    {
        id: '2',
        company: 'Become',
        position: 'UI/UX Designer',
        dueIn: 'Due in 5 days'
    }
]

export function InterviewInvitesSection({
    interviews = defaultInterviews,
    viewMoreHref = '/candidate/company-interviews'
}: InterviewInvitesSectionProps) {
    const router = useRouter()

    const handleStartInterview = (interviewId: string) => {
        router.push(`/interview/${interviewId}`)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-[rgba(117,134,253,1)]">Interview Invites</h2>
                <button
                    className="text-[rgba(255,100,27,0.9)]  font-semibold hover:underline flex items-center gap-2"
                    onClick={() => router.push(viewMoreHref)}
                >
                    <span>View more</span> <span className='translate-y-0.5'><ArrowRight className="w-5 h-5" /></span>
                </button>
            </div>

            <div className="space-y-4">
                {interviews.map((interview) => (
                    <InterviewInviteCard
                        key={interview.id}
                        company={interview.company}
                        position={interview.position}
                        dueIn={interview.dueIn}
                        onStartClick={() => handleStartInterview(interview.id)}
                    />
                ))}
            </div>
        </div>
    )
}

import React from 'react'
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
    onViewMore?: () => void
    onStartInterview?: (interviewId: string) => void
}

const defaultInterviews = [
    {
        id: '1',
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
    onViewMore,
    onStartInterview
}: InterviewInvitesSectionProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[rgba(117,134,253,1)]">Interview Invites</h2>
                <button
                    className="text-[rgba(255,100,27,0.9)]  font-semibold hover:underline flex items-center gap-2"
                    onClick={onViewMore}
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
                        onStartClick={() => onStartInterview?.(interview.id)}
                    />
                ))}
            </div>
        </div>
    )
}

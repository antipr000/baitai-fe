
import React from 'react'
import Link from 'next/link'
import { InterviewInviteCard } from './interview-invite-card'
import { ArrowRight, Inbox } from 'lucide-react'




export interface Interview {
    id: string
    company: string
    position: string
    dueIn: string
    status: string
    template_id: string
}

interface InterviewInvitesSectionProps {
    interviews: Interview[]
    viewMoreHref?: string
}

export function InterviewInvitesSection({
    interviews,
    viewMoreHref = '/candidate/company-interviews'
}: InterviewInvitesSectionProps) {

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-[rgba(117,134,253,1)]">Interview Invites</h2>
                {interviews.length > 0 && (
                    <Link
                        href={viewMoreHref}
                        className="text-[rgba(255,100,27,0.9)] font-semibold hover:underline flex items-center gap-2"
                    >
                        <span>View more</span> <span className='translate-y-0.5'><ArrowRight className="w-5 h-5" /></span>
                    </Link>
                )}
            </div>

            {interviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[320px] p-6 border border-[rgba(117,134,253,0.2)] rounded-xl bg-white">
                    <div className="w-12 h-12 rounded-full bg-[rgba(117,134,253,0.1)] flex items-center justify-center mb-3">
                        <Inbox className="w-6 h-6 text-[rgba(117,134,253,0.6)]" />
                    </div>
                    <h3 className="text-base font-medium text-slate-700">No Interview Invites</h3>
                    <p className="text-sm text-muted-foreground mb-4">No pending invites yet</p>
                    <Link
                        href="/candidate/practice-interviews"
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[linear-gradient(92.34deg,rgba(117,134,253,1)_17.04%,rgba(150,164,255,1)_122.22%)] hover:opacity-90 transition-opacity"
                    >
                        Try Practice Interviews
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {interviews.map((interview) => (
                        <InterviewInviteCard
                            key={interview.id}
                            company={interview.company}
                            position={interview.position}
                            dueIn={interview.dueIn}
                            interviewId={interview.template_id}
                            status={interview.status}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

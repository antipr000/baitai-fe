import React from 'react'
import Link from 'next/link'
import { PracticeInterviewCard } from './practice-interview-card'
import { ArrowRight, BookOpen } from 'lucide-react'


export interface PracticeInterview {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Difficult'
  duration: string
}

interface PracticeInterviewsSectionProps {
  interviews: PracticeInterview[]
  viewMoreHref?: string
}

export function PracticeInterviewsSection({
  interviews,
  viewMoreHref = '/candidate/practice-interviews'
}: PracticeInterviewsSectionProps) {

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[rgba(117,134,253,1)]">Practice Interviews</h2>
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
        <div className="flex flex-col items-center justify-center min-h-80 p-6 border border-[rgba(117,134,253,0.2)] rounded-xl bg-white">
          <div className="w-12 h-12 rounded-full bg-[rgba(117,134,253,0.1)] flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-[rgba(117,134,253,0.6)]" />
          </div>
          <h3 className="text-base font-medium text-slate-700">No Practice Interviews</h3>
          <p className="text-sm text-muted-foreground mb-4">Check back later</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <PracticeInterviewCard
              key={interview.id}
              title={interview.title}
              difficulty={interview.difficulty}
              duration={interview.duration}
              interviewId={interview.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

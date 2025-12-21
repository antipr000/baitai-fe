import React from 'react'
import { PracticeInterviewCard } from './practice-interview-card'
import { ArrowRight } from 'lucide-react'

interface PracticeInterview {
  id: string
  company: string
  difficulty: 'Easy' | 'Medium' | 'Difficult'
  duration: string
}

interface PracticeInterviewsSectionProps {
  interviews?: PracticeInterview[]
  onViewMore?: () => void
  onStartInterview?: (interviewId: string) => void
}

const defaultInterviews = [
  {
    id: 'it_cjcbzuapqb767ojt',
    company: 'Mindtrix',
    difficulty: 'Easy' as const,
    duration: '45 min'
  },
  {
    id: '2',
    company: 'Mindtrix',
    difficulty: 'Medium' as const,
    duration: '45 min'
  },
  {
    id: '3',
    company: 'Mindtrix',
    difficulty: 'Difficult' as const,
    duration: '45 min'
  }
]

export function PracticeInterviewsSection({
  interviews = defaultInterviews,
  onViewMore,
  onStartInterview
}: PracticeInterviewsSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[rgba(117,134,253,1)]">Practice Interviews</h2>
        <button
          className="text-[rgba(255,100,27,0.9)]  font-semibold hover:underline flex items-center gap-2"
          onClick={onViewMore}
        >
          <span>View more</span> <span className='translate-y-0.5'><ArrowRight className="w- h-5" /></span>
        </button>
      </div>

      <div className="space-y-4">
        {interviews.map((interview) => (
          <PracticeInterviewCard
            key={interview.id}
            company={interview.company}
            difficulty={interview.difficulty}
            duration={interview.duration}
            onStartClick={() => onStartInterview?.(interview.id)}
          />
        ))}
      </div>
    </div>
  )
}

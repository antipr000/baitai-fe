import React from 'react'
import { ResultItem } from './result-item'
import { Button } from '@/components/ui/button'

interface Result {
  id: string
  title: string
  timeAgo: string
  score: number
}

interface RecentResultsSectionProps {
  results?: Result[]
  onViewMore?: () => void
  onViewDetails?: (resultId: string) => void
}

const defaultResults = [
  {
    id: '1',
    title: 'Software Engineer Practice',
    timeAgo: '2 days ago',
    score: 90
  },
  {
    id: '2',
    title: 'Backend Developer Test',
    timeAgo: '5 days ago',
    score: 78
  },
  {
    id: '3',
    title: 'System Design Practice',
    timeAgo: '1 week ago',
    score: 95
  },
  {
    id: '4',
    title: 'UX Research Practice',
    timeAgo: '3 weeks ago',
    score: 96
  }
]

export function RecentResultsSection({
  results = defaultResults,
  onViewMore,
  onViewDetails
}: RecentResultsSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Recent Results</h2>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          {results.map((result) => (
            <ResultItem
              key={result.id}
              title={result.title}
              timeAgo={result.timeAgo}
              score={result.score}
              onViewDetails={() => onViewDetails?.(result.id)}
            />
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            className="border-[rgba(104,100,247,0.5)] font-bold text-[rgba(104,100,247,1)] hover:bg-[rgba(104, 100, 247,0.1)]"
            onClick={onViewMore}
          >
            View more
          </Button>
        </div>
      </div>
    </div>
  )
}

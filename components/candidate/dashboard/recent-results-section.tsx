import React from 'react'
import { ResultItem } from './result-item'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { serverFetch } from '@/lib/api/server'

interface ApiResultItem {
  session_id: string
  template_id: string
  template_title: string
  role: string
  interview_type: string
  company_name: string
  date: string
  score: number
  status: string
  started_at: string
  ended_at: string
}

interface Result {
  id: string
  title: string
  timeAgo: string
  score: number
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return '1 month ago'
  return `${Math.floor(diffDays / 30)} months ago`
}

async function getRecentResults(): Promise<Result[]> {
  const response = await serverFetch<ApiResultItem[]>('/api/v1/user/interview/results/recent/')

  if (!response || !Array.isArray(response)) {
    console.warn('Failed to fetch recent results')
    return []
  }

  return response.map((item) => ({
    id: item.session_id,
    title: item.template_title || item.role,
    timeAgo: formatTimeAgo(item.date),
    score: item.score,
  }))
}

interface RecentResultsSectionProps {
  viewMoreHref?: string
}

export async function RecentResultsSection({
  viewMoreHref = '/candidate/results'
}: RecentResultsSectionProps) {
  const results = await getRecentResults()

  return (
    <div>
      <div className="flex justify-between items-center mb-6 ">
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
              href={`/candidate/results/${result.id}`}
            />
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            className="border-[rgba(104,100,247,0.5)] font-bold hover:text-[rgba(104,100,247,1)] hover:border-2 text-[rgba(104,100,247,1)] hover:bg-[rgba(104, 100, 247,0.1)]"
            asChild
          >
            <Link href={viewMoreHref}>View more</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


import { serverFetch } from '@/lib/api/server'
import { ResultItem } from './result-item'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ScorePoller } from './score-poller'

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
  is_scored: boolean
  started_at: string
  ended_at: string
}

interface ApiResultResponse {
  items: ApiResultItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
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

interface RecentResultsSectionProps {
  viewMoreHref?: string
}

export async function RecentResultsSection({
  viewMoreHref = '/results'
}: RecentResultsSectionProps) {
  const response = await serverFetch<ApiResultResponse>('/api/v1/user/interview/results/filter/', {
    method: 'POST',
    body: { page: 1, page_size: 5 }
  })

  if (!response || !response.items) {
    return null
  }

  const results = response.items


  const hasPending = results.some(r => !r.is_scored)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Recent Results</h2>
      </div>

      {/* Poll for updates if any results are pending */}
      {hasPending && <ScorePoller />}

      {results.length === 0 ? (
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(104,100,247,0.1)] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(104,100,247,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-slate-700">No Results Yet</h3>
              <p className="text-sm text-muted-foreground">Complete an interview to see your results</p>
            </div>
          </div>
          <Link
            href="/candidate/practice-interviews"
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[linear-gradient(92.34deg,rgba(104,100,247,1)_17.04%,rgba(140,137,255,1)_122.22%)] hover:opacity-90 transition-opacity"
          >
            Start Practice
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            {results.map((item) => (
              <ResultItem
                key={item.session_id}
                title={item.template_title || item.role}
                timeAgo={formatTimeAgo(item.date)}
                score={item.score}
                href={`/results/${item.session_id}`}
                isScored={item.is_scored}
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
      )}
    </div>
  )
}

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface ResultItemProps {
  title: string
  timeAgo: string
  score: number
  onViewDetails?: () => void
}

export function ResultItem({ title, timeAgo, score, onViewDetails }: ResultItemProps) {
  return (
    <Card className="bg-[rgba(245,247,255,1)] border-none hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-slate-700 mb-2">{title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-3xl font-bold text-[rgba(113,131,252,1)]">{score}%</p>
              <p className="text-xs text-muted-foreground mt-1">Score</p>
            </div>
            <Button
              variant="ghost"
              className='font-semibold text-[rgba(10,13,26,0.9)]'
              onClick={onViewDetails}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

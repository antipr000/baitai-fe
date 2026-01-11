import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ResultItemProps {
  title: string
  timeAgo: string
  score: number
  href: string
  isScored?: boolean
}

export function ResultItem({ title, timeAgo, score, href, isScored = true }: ResultItemProps) {
  return (
    <Card className="bg-[rgba(0,215,255,0.03)] border border-[rgba(108,110,118,0.05)] hover:shadow-md transition-shadow ">
      <CardContent className="pt-6 ">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-slate-700 mb-2">{title}</h3>
            <div className="flex items-center gap-2 font-medium text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span >{timeAgo}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="">
              {isScored ? (
                <>
                  <p className="text-3xl font-bold text-[rgba(113,131,252,1)]">{score}%</p>
                  <p className="text-center text-muted-foreground mt-1">Score</p>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[rgba(113,131,252,1)]" />
                    <p className="text-base font-semibold text-[rgba(113,131,252,1)]">Pending</p>
                  </div>
                </div>
              )}
            </div>
            {isScored ? (
              <Button
                variant="ghost"
                className='font-semibold text-[rgba(10,13,26,0.9)] hover:bg-[rgba(113,131,252,1)] hover:text-white'
                asChild
              >
                <Link href={href}>View Details</Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className='font-semibold text-muted-foreground/50 cursor-not-allowed'
                disabled
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

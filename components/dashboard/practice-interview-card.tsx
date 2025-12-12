import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface PracticeInterviewCardProps {
  company: string
  difficulty: 'Easy' | 'Medium' | 'Difficult'
  duration: string
  onStartClick?: () => void
}

const difficultyStyles = {
  Easy: {
    bg: 'bg-[rgba(50,255,36,0.05)]',
    text: 'text-[rgba(55,212,44,0.7)]',
    border: 'border-[rgba(50,255,36,0.5)]'
  },
  Medium: {
    bg: 'bg-[rgba(249,237,236,1)]',
    text: 'text-[rgba(234,137,0,0.9)]',
    border: 'border-[rgba(212,142,44,0.5)]'
  },
  Difficult: {
    bg: 'bg-[rgba(255,51,0,0.05)]',
    text: 'text-[rgba(255,51,0,0.9)]',
    border: 'border-[rgba(255,51,0,0.5)]'
  }
}

export function PracticeInterviewCard({
  company,
  difficulty,
  duration,
  onStartClick
}: PracticeInterviewCardProps) {
  const style = difficultyStyles[difficulty]

  return (
    <Card className="bg-white hover:border-2 hover:border-[rgba(82,86,184,1)] transition-border">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">{company}</h3>
            <div className="flex items-center gap-4 mt-1">
              <Badge className={cn(style.bg, style.text, style.border, "p-1 px-7 border")}>
                {difficulty}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center justify-center">
                <Image src="/candidate/timer.svg" alt="clock" width={18} height={18} className="inline-block mr-1" />
                <span>{duration}</span>
              </span>
            </div>
          </div>
          <Button
            className="w-full border-2 border-[rgba(82,86,184,1)] font-sebold hover:bg-[rgba(82,86,184,1)] text-[rgba(83,87,184,1)] hover:text-white bg-white"
            onClick={onStartClick}
          >
            Start Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

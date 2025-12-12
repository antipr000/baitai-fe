import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface InterviewInviteCardProps {
    company: string
    position: string
    dueIn: string
    onStartClick?: () => void
}

export function InterviewInviteCard({
    company,
    position,
    dueIn,
    onStartClick
}: InterviewInviteCardProps) {
    return (
        <Card className="bg-white">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center gap-4">
                        <div>
                            <h3 className="font-medium text-lg text-slate-900">{company}</h3>
                            <p className="text-sm text-muted-foreground">{position}</p>
                        </div>
                        <Badge
                            className={cn(
                                "rounded-full px-5 py-1 text-sm font-medium ",
                                "bg-[rgba(255,121,60,0.1)] text-[rgba(255,103,32,0.9)]",
                                "border border-[rgba(255,121,60,0.5)]"
                            )}
                        >
                            {dueIn}
                        </Badge>
                    </div>

                    <Button
                        className="w-full bg-linear-to-r text-[rgba(248, 250, 255, 1)] font-semibold  from-[rgba(255,103,32,1)] to-[rgba(255,140,86,1)] hover:bg-orange-600 border border-[rgba(255,147,96,0.1)] text-[rgba(248,250,255,1)]"
                        onClick={onStartClick}
                    >
                        Start Interview
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

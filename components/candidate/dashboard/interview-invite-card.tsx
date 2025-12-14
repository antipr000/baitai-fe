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
        <Card className="bg-white border-2 border-[rgba(255,147,96,0.1)] hover:border-[rgba(255,147,96,1)] transition-border">
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
                        className="w-full hover:opacity-70 transition-opacity duration-100 text-[rgba(248, 250, 255, 1)] font-semibold bg-[linear-gradient(92.34deg,rgba(255,103,32,1)_17.04%,rgba(255,140,86,1)_122.22%)] hover: border border-[rgba(255,147,96,0.1)] text-[rgba(248,250,255,1)]"
                        onClick={onStartClick}
                    >
                        Start Interview
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

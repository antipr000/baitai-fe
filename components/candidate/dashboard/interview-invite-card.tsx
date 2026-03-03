import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface InterviewInviteCardProps {
    company: string
    position: string
    dueIn: string
    interviewId: string
    status: string
}

export function InterviewInviteCard({
    company,
    position,
    dueIn,
    interviewId,
    status
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
                        {status === 'completed' ? (
                            <Badge
                                className={cn(
                                    "rounded-full px-5 py-1 text-sm font-medium ",
                                    "bg-emerald-50 text-emerald-700",
                                    "border border-emerald-200"
                                )}
                            >
                                Completed
                            </Badge>
                        ) : status === 'cancelled' ? (
                            <Badge
                                className={cn(
                                    "rounded-full px-5 py-1 text-sm font-medium ",
                                    "bg-slate-50 text-slate-700",
                                    "border border-slate-200"
                                )}
                            >
                                Cancelled
                            </Badge>
                        ) : (
                            <Badge
                                className={cn(
                                    "rounded-full px-5 py-1 text-sm font-medium ",
                                    "bg-[rgba(255,121,60,0.1)] text-[rgba(255,103,32,0.9)]",
                                    "border border-[rgba(255,121,60,0.5)]"
                                )}
                            >
                                {dueIn}
                            </Badge>
                        )}
                    </div>
                    {status === 'invited' ? (
                        <Link
                            href={`/interview/${interviewId}`}
                            className="block w-full text-center py-2 rounded-md hover:opacity-70 transition-opacity duration-100 text-[rgba(248,250,255,1)] font-semibold bg-[linear-gradient(92.34deg,rgba(255,103,32,1)_17.04%,rgba(255,140,86,1)_122.22%)] border border-[rgba(255,147,96,0.1)]"
                        >
                            Start Interview
                        </Link>
                    ) : (
                        <div className="block w-full text-center py-2 rounded-md text-slate-400 font-semibold bg-slate-50 border border-slate-200 cursor-not-allowed">
                            Invite {status}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}


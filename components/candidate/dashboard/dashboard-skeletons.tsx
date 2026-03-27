import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// ─── Stats Cards Skeleton ─────────────────────────────────────────────────────
// Mirrors: page.tsx StatsCards — 4 stat cards in a grid

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center gap-5">
                            <Skeleton className="h-[50px] w-[50px] rounded-md" />
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-7 w-12 mx-auto" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// ─── Interview Invite Card Skeleton ───────────────────────────────────────────
// Mirrors: InterviewInviteCard — Card > CardContent > space-y-4 > [header row + button]

export function InvitesSkeleton() {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-44" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="bg-white border-2 border-[rgba(255,147,96,0.1)]">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* Header row: company/position + badge */}
                                <div className="flex justify-between items-center gap-4">
                                    <div>
                                        <Skeleton className="h-5 w-36 mb-1" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                    <Skeleton className="h-7 w-24 rounded-full" />
                                </div>
                                {/* Start Interview button */}
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// ─── Practice Interview Card Skeleton ─────────────────────────────────────────
// Mirrors: PracticeInterviewCard — Card > CardContent > space-y-4 > [title + badges + button]

export function PracticeSkeleton() {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="bg-white">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <Skeleton className="h-5 w-48 mb-2" />
                                    {/* Difficulty badge + duration */}
                                    <div className="flex items-center gap-4 mt-1">
                                        <Skeleton className="h-7 w-20 rounded-full" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                                {/* Start Interview button */}
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// ─── Result Item Skeleton ─────────────────────────────────────────────────────
// Mirrors: ResultItem — Card > CardContent > flex row [title+timeAgo | score + button]

export function ResultsSkeleton() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-40" />
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="bg-[rgba(0,215,255,0.03)] border border-[rgba(108,110,118,0.05)]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                {/* Left: title + time */}
                                <div className="flex-1">
                                    <Skeleton className="h-5 w-48 mb-2" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                                {/* Right: score + button */}
                                <div className="flex items-center gap-6">
                                    <div>
                                        <Skeleton className="h-8 w-14 mb-1" />
                                        <Skeleton className="h-4 w-10 mx-auto" />
                                    </div>
                                    <Skeleton className="h-9 w-24 rounded-md" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

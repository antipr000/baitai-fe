import { Skeleton } from '@/components/ui/skeleton'

// ─── Company Practice Table Skeleton ──────────────────────────────────────────
// Mirrors: Search bar + Company toggle + Table

export function CompanyPracticeTableSkeleton() {
    return (
        <div className="space-y-6">
            {/* Search + Filter Bar */}
            <div className="flex gap-4 items-center">
                <div className="h-[46px] w-full rounded-sm border border-[rgba(58,63,187,0.3)] bg-white flex items-center px-4 gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-[46px] w-44 rounded-sm" />
            </div>

            {/* Company Toggle */}
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-30 rounded-full shrink-0" />
                ))}
            </div>

            {/* Interview List Rows */}
            <div className="rounded-lg overflow-hidden bg-[rgba(245,247,255,1)]">
                <div className="divide-y divide-[rgba(245,247,255,1)]">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-white">
                            <div className="flex items-center gap-3 min-w-0">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-1.5 min-w-0">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-24" />
                                    <div className="flex items-center gap-3 pt-0.5">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-3 w-14" />
                                    </div>
                                </div>
                            </div>
                            <Skeleton className="h-9 w-32 rounded-sm" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

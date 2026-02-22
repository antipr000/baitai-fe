import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// ─── Practice Stats Skeleton ──────────────────────────────────────────────────
// Mirrors: PracticeStats — 4 cards matching the design in page.tsx

export function PracticeStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border bg-muted/50">
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-[30px] w-[30px] rounded translate-y-1" />
                            <div>
                                <Skeleton className="h-6 w-32 mb-1" />
                                <Skeleton className="h-7 w-12" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// ─── Practice Table Skeleton ──────────────────────────────────────────────────
// Mirrors: PracticeTable — Search bar + Filter + Table

export function PracticeTableSkeleton() {
    return (
        <div className="space-y-4">
            {/* Search + Filter Bar */}
            <div className="py-4">
                <div className="w-full md:w-[85%] flex gap-4 items-center">
                    <Skeleton className="h-10 w-full md:w-full rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </div>

            {/* Table Header */}
            <div className="rounded-md border overflow-hidden">
                <div className="bg-[rgba(125,141,253,0.05)] border-b border-[rgba(125,141,253,0.3)] grid grid-cols-5 p-4 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-24" />
                    ))}
                </div>
                {/* Table Rows */}
                <div className="divide-y">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-5 p-5 gap-4 items-center bg-white">
                            {Array.from({ length: 5 }).map((_, j) => (
                                <Skeleton key={j} className="h-4 w-full" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

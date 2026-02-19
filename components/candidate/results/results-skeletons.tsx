import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// ═══════════════════════════════════════════════════════════════════════════════
// /results  (list page)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Results Stats Skeleton ───────────────────────────────────────────────────
// Mirrors: 4 stat cards (Total, Practice, Invites, Avg Score)
// Layout: Icon wrapper (w-12 h-12) + Text Column

export function ResultsStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border bg-muted/50">
                    <CardContent className="">
                        <div className="flex items-center gap-3">
                            <Skeleton className="shrink-0 w-12 h-12 rounded" />
                            <div>
                                <Skeleton className="h-5 w-32 mb-1" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// ─── Results Table Skeleton ───────────────────────────────────────────────────
// Mirrors: DataTable — Search bar + Filter dropdown + 6-column table

export function ResultsTableSkeleton() {
    return (
        <div>
            {/* Search + Filter Bar */}
            <div className="py-4">
                <div className="w-[85%] flex gap-4 items-center">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <TableHead key={i} className="p-4 px-3">
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="p-5 px-4">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// /results/[id]  (detail page — charts, skills, strengths)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Result Detail Skeleton ──────────────────────────────────────────────────
// Entire page skeleton for the detail view (single API call, single Suspense)

export function ResultDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[rgba(245,247,255,1)]">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Skeleton className="h-10 w-40 rounded-md" />
                </div>

                {/* Main Score Card */}
                <Card className="bg-muted/30">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-around">
                            {/* Left — Score Info */}
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-40 rounded-full" />
                                <div className="flex items-baseline gap-1">
                                    <Skeleton className="h-12 w-20" />
                                    <Skeleton className="h-7 w-10" />
                                </div>
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-5 w-56" />
                            </div>
                            {/* Right — Radial Chart placeholder */}
                            <Skeleton className="h-[180px] w-[180px] rounded-full" />
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards Row */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-25 mx-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border bg-muted/50">
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded" />
                                    <div>
                                        <Skeleton className="h-4 w-24 mb-1" />
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mt-12">
                    {/* Performance Trend */}
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[200px] w-full rounded" />
                        </CardContent>
                    </Card>

                    {/* Skill Metrics */}
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[180px] w-full rounded" />
                        </CardContent>
                    </Card>
                </div>

                {/* Skill Cards Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 p-8 px-10 rounded-3xl bg-muted/30">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="bg-white border border-muted">
                            <CardContent className="p-6 px-12">
                                <div className="flex justify-between items-center mb-3">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                                <Skeleton className="h-[6px] w-full rounded-full" />
                                <Skeleton className="h-4 w-full mt-4" />
                                <Skeleton className="h-4 w-3/4 mt-1" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Key Strengths & Scope of Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-18 mx-10 mt-12">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="bg-muted/30">
                            <CardContent className="p-8 px-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-5 w-36" />
                                </div>
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <div key={j} className="flex items-start gap-2">
                                            <Skeleton className="mt-2 h-1 w-1 rounded-full shrink-0" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center my-12 gap-16 pb-8 mx-18">
                    <Skeleton className="flex-1 h-14 rounded-xl" />
                    <Skeleton className="flex-1 h-14 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

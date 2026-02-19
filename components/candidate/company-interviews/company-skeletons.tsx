import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// ─── Company Stats Skeleton ───────────────────────────────────────────────────
// Mirrors: CompanyStats — 3 cards (Pending, Companies, Positions)
// Layout: Icon (60x60) + Text Column (h-xl, h-2xl)

export function CompanyStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border bg-muted/50">
                    <CardContent className="">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-[60px] w-[60px] rounded" />
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

// ─── Company Table Skeleton ───────────────────────────────────────────────────
// Mirrors: CompanyTable — Search bar (no filter) + Table

export function CompanyTableSkeleton() {
    return (
        <div>
            {/* Search Bar */}
            <div className="flex items-center py-4 w-[85%] mx-7">
                <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableHead key={i} className="p-4 px-3">
                                    <Skeleton className="h-4 w-24" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="p-5 px-4">
                                {Array.from({ length: 5 }).map((_, j) => (
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

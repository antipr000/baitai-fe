"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Loader2 } from "lucide-react"
import Link from "next/link"

export type Result = {
    id: string
    jobRole: string
    interviewType: "Practice" | "Interview"
    company: string
    date: string
    score: string
    isScored: boolean
}

export const columns: ColumnDef<Result>[] = [
    {
        accessorKey: "jobRole",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm pl-2">Job Role</div>,
        cell: ({ row }) => {
            const jobRole = row.getValue("jobRole") as string
            return (
                <div className="text-[rgba(58,63,187,1)] text-sm pl-2">
                    {jobRole}
                </div>
            )
        },
    },
    {
        accessorKey: "interviewType",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Interview Type</div>,
        cell: ({ row }) => {
            const interviewType = row.getValue("interviewType") as string
            const getTypeStyles = (type: string) => {
                switch (type) {
                    case "Practice":
                        return "border-[rgba(3,231,41,1)] text-[rgba(3,231,41,1)]"
                    case "Interview":
                        return "border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)]"
                    default:
                        return "border-gray-300 text-muted-foreground"
                }
            }
            return (
                <div className="flex items-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-semibold border ${getTypeStyles(interviewType)}`}>
                        {interviewType}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "company",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Company</div>,
        cell: ({ row }) => {
            const company = row.getValue("company") as string
            return (
                <div className="text-[rgba(10,13,26,0.6)] text-sm">
                    {company}
                </div>
            )
        },
    },
    {
        accessorKey: "date",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm cursor-pointer flex items-center gap-1">Date <span className="text-[rgba(10,13,26,0.3)]">↓↑</span></div>,
        cell: ({ row }) => {
            const date = row.getValue("date") as string
            return (
                <div className="text-[rgba(10,13,26,0.6)] text-sm">
                    {date}
                </div>
            )
        },
    },
    {
        accessorKey: "score",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm cursor-pointer flex items-center gap-1">Score <span className="text-[rgba(10,13,26,0.3)]">↓↑</span></div>,
        cell: ({ row }) => {
            const score = row.getValue("score") as string
            const isScored = row.original.isScored

            if (!isScored) {
                return (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[rgba(255,107,107,1)]" />
                        <span className="font-semibold text-[rgba(255,107,107,1)] text-sm">Pending</span>
                    </div>
                )
            }

            // Check if score is poor (e.g. less than 50% maybe?) The mockup shows 27% in red.
            const scoreNum = parseInt(score.replace('%', ''))
            const scoreColor = isNaN(scoreNum) || scoreNum >= 50 ? "text-[rgba(10,13,26,0.6)]" : "text-[rgba(255,107,107,1)]"

            return (
                <div className={`${scoreColor} text-sm font-medium`}>
                    {score}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Action</div>,
        cell: ({ row }) => {
            const result = row.original

            if (!result.isScored) {
                return (
                    <Button variant="outline" className="border-[rgba(58,63,187,0.3)] text-[rgba(58,63,187,0.5)] px-6 py-2 rounded-sm text-xs font-semibold cursor-not-allowed hover:bg-transparent" disabled>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                    </Button>
                )
            }

            return (
                <Link href={`/results/${result.id}`}>
                    <Button variant="outline" className="border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.05)] hover:text-[rgba(58,63,187,1)] px-6 py-2 rounded-sm text-xs font-semibold" >
                        <Eye className="w-4 h-4 mr-2" /> View Details
                    </Button>
                </Link>
            )
        },
    }
]

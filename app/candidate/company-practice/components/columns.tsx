"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import Link from "next/link"
import { Clock } from "lucide-react"

export type PracticeInterview = {
    id: string
    title: string
    role: string
    difficulty: "Easy" | "Medium" | "Hard"
    duration: string
    companyLogo?: string
    companyName?: string
}

export const columns: ColumnDef<PracticeInterview>[] = [
    {
        id: "company",
        accessorKey: "title",
        header: () => null,
        cell: ({ row }) => {
            const logo = row.original.companyLogo
            const name = row.original.title
            const role = row.original.role
            const difficulty = row.original.difficulty
            const duration = row.original.duration
            const getDifficultyStyles = (diff: string) => {
                switch (diff) {
                    case "Easy":
                        return "border-[rgba(3,231,41,1)] text-[rgba(3,231,41,1)]"
                    case "Medium":
                        return "border-[rgba(231,90,3,1)] text-[rgba(231,90,3,1)]"
                    case "Hard":
                        return "border-[rgba(255,35,35,1)] text-[rgba(255,35,35,1)]"
                    default:
                        return "border-gray-300 text-muted-foreground"
                }
            }
            return (
                <div className="flex items-center gap-3 pl-2">
                    {logo && (
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[rgba(58,63,187,0.1)] p-1.5 shrink-0">
                            <Image src={logo} alt="Company" width={20} height={20} className="object-contain" />
                        </div>
                    )}
                    <div className="space-y-1">
                        <div className="font-medium text-sm text-[rgba(10,13,26,1)]">{name}</div>
                        <div className="flex items-center gap-3 pt-0.5">
                            <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyStyles(difficulty)}`}>
                                {difficulty}
                            </span>
                            <span className="flex items-center gap-1 text-[rgba(10,13,26,0.7)] text-xs">
                                <Clock className="w-3.5 h-3.5" />
                                {duration}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "difficulty",
        filterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true
            return row.original.difficulty?.toLowerCase() === (filterValue as string).toLowerCase()
        },
    },
    {
        accessorKey: "role",
        filterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true
            return row.original.role?.toLowerCase() === (filterValue as string).toLowerCase()
        },
    },
    {
        accessorKey: "duration",
    },
    {
        accessorKey: "companyName",
        filterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true
            return row.original.companyName?.toLowerCase() === (filterValue as string).toLowerCase()
        },
    },
    {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
            const interview = row.original
            return (
                <div className="flex justify-end">
                    <Link href={`/interview/${interview.id}`}>
                        <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white px-6 py-2 rounded-sm text-xs font-semibold">
                            <Image src="/main/play.svg" alt="Start" width={8} height={10} className="mr-2" style={{ filter: 'brightness(0) invert(1)' }} />
                            Take Interview
                        </Button>
                    </Link>
                </div>
            )
        },
    }
]

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
    difficulty: "easy" | "medium" | "hard"
    experienceLevels?: string[]
    duration: string
    companyLogo?: string
    companyName?: string
}

const getDifficultyStyles = (diff: string | undefined) => {
    const d = diff?.toLowerCase()
    switch (d) {
        case "easy":
            return "border-[rgba(3,231,41,1)] text-[rgba(3,231,41,1)]"
        case "medium":
            return "border-[rgba(231,90,3,1)] text-[rgba(231,90,3,1)]"
        case "hard":
            return "border-[rgba(255,35,35,1)] text-[rgba(255,35,35,1)]"
        default:
            return "border-gray-300 text-muted-foreground"
    }
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
            const experienceLevels = row.original.experienceLevels || []
            const duration = row.original.duration
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
                            <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border capitalize ${getDifficultyStyles(difficulty)}`}>
                                {difficulty}
                            </span>
                            {/* {experienceLevels.map(level => (
                                <span key={level} className="px-3 py-0.5 rounded-full text-xs font-semibold border border-[rgba(58,63,187,0.3)] text-[rgba(58,63,187,1)] capitalize">
                                    {level.replace(/_/g, " ")}
                                </span>
                            ))} */}
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
        accessorKey: "experienceLevel",
        filterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true
            const searchLevel = (filterValue as string).toLowerCase()
            return row.original.experienceLevels?.some(level => level.toLowerCase() === searchLevel) ?? false
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

"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import Link from "next/link"

export type PracticeInterview = {
    id: string
    title: string
    role: string
    difficulty: "easy" | "medium" | "hard"
    experience?: string[]
    duration: string
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
        accessorKey: "title",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm pl-2">Title</div>,
        cell: ({ row }) => {
            const title = row.getValue("title") as string
            return (
                <div className=" text-[rgba(58,63,187,1)] text-sm pl-2">
                    {title}
                </div>
            )
        },
    },
    {
        accessorKey: "role",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Role</div>,
        cell: ({ row }) => {
            const role = row.getValue("role") as string
            return (
                <div className="text-[rgba(10,13,26,0.6)] text-sm">
                    {role}
                </div>
            )
        },
        filterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true
            return row.original.role?.toLowerCase().includes((filterValue as string).toLowerCase())
        },
    },
    {
        accessorKey: "difficulty",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Difficulty</div>,
        cell: ({ row }) => {
            const difficulty = row.getValue("difficulty") as string
            return (
                <div className="flex items-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-semibold border capitalize ${getDifficultyStyles(difficulty)}`}>
                        {difficulty}
                    </span>
                </div>
            )
        },
        filterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true
            return row.original.difficulty?.toLowerCase() === (filterValue as string).toLowerCase()
        },
    },
    {
        accessorKey: "experience",
        filterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true
            const searchLevel = (filterValue as string).toLowerCase()
            return row.original.experience?.some(level => level.toLowerCase() === searchLevel) ?? false
        },
    },
    {
        accessorKey: "duration",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Duration</div>,
        cell: ({ row }) => {
            const duration = row.getValue("duration") as string
            return (
                <div className="text-[rgba(10,13,26,0.6)] text-sm">
                    {duration}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Action</div>,
        cell: ({ row }) => {
            const interview = row.original
            return (
                <Link href={`/interview/${interview.id}`}>
                    <Button className="bg-[rgba(58,63,187,1)] hover:bg-white border border-[rgba(58,63,187,1)] hover:text-[rgba(58,63,187,1)] text-white px-6 py-2 rounded-sm text-xs font-medium" >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                            <g clipPath="url(#clip0_3251_438)">
                                <path fillRule="evenodd" clipRule="evenodd" d="M10.463 5.38068L2.32144 0.133663C1.83844 -0.12648 1.28516 -0.099476 1.28516 0.834381V11.1664C1.28516 12.0201 1.87873 12.1547 2.32144 11.8671L10.463 6.62009C10.7982 6.27767 10.7982 5.72311 10.463 5.38068Z" fill="currentColor"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_3251_438">
                                    <rect width="12" height="12" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                        Take Interview
                    </Button>
                </Link>
            )
        },
    }
]

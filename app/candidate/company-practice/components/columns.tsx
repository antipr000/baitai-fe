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
    experience?: string[]
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
            const experience = row.original.experience || []
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
        accessorKey: "experience",
        filterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true
            const searchLevel = (filterValue as string).toLowerCase()
            return row.original.experience?.some(level => level.toLowerCase() === searchLevel) ?? false
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
                        <Button className="bg-[rgba(58,63,187,1)] hover:bg-white border border-[rgba(58,63,187,1)] hover:text-[rgba(58,63,187,1)] text-white px-6 py-3 rounded-sm text-xs font-medium">
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
                </div>
            )
        },
    }
]

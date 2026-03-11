"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import Link from "next/link"

export type PracticeInterview = {
    id: string
    title: string
    category: string
    difficulty: "Easy" | "Medium" | "Hard"
    duration: string
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
        accessorKey: "category",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Category</div>,
        cell: ({ row }) => {
            const category = row.getValue("category") as string
            return (
                <div className="text-[rgba(10,13,26,0.6)] text-sm">
                    {category}
                </div>
            )
        },
    },
    {
        accessorKey: "difficulty",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Difficulty</div>,
        cell: ({ row }) => {
            const difficulty = row.getValue("difficulty") as string
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
                <div className="flex items-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-semibold border ${getDifficultyStyles(difficulty)}`}>
                        {difficulty}
                    </span>
                </div>
            )
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
                    <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white px-6 py-2 rounded-sm text-xs font-semibold" >
                        <Image src="/main/play.svg" alt="Start" width={8} height={10} className="mr-2" style={{ filter: 'brightness(0) invert(1)' }} />
                        Take Interview
                    </Button>
                </Link>
            )
        },
    }
]

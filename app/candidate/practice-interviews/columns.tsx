"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu,DropdownMenuItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import Image from "next/image"

    

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type PracticeInterview = {
    id: string
    title: string
    category: string
    difficulty: "Easy" | "Medium" | "Difficult"
    duration: string
}

export const columns: ColumnDef<PracticeInterview>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            const title = row.getValue("title") as string
            return (
                <div className="font-semibold"> 
                    {title}
                </div>
            )
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const category = row.getValue("category") as string
            return (
                <div className="font-semibold text-muted-foreground"> 
                    {category}
                </div>
            )
        },
    },
    {
        accessorKey: "difficulty",
        header: "Difficulty",
        cell: ({ row }) => {
            const difficulty = row.getValue("difficulty") as string
            const getDifficultyStyles = (diff: string) => {
                switch (diff) {
                    case "Easy":
                        return "bg-[rgba(50,255,36,0.05)] border-[rgba(50,255,36,0.5)] text-[rgba(55,212,44,0.7)]"
                    case "Medium":
                        return "bg-[rgba(249,237,236,1)] border-[rgba(212,142,44,0.5)] text-[rgba(234,137,0,0.9)]"
                    case "Difficult":
                        return "bg-[rgba(255,51,0,0.05)] border-[rgba(255,51,0,0.5)] text-[rgba(255,51,0,0.9)]"
                    default:
                        return "bg-gray-100 border-gray-300 text-muted-foreground"
                }
            }
            return (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyStyles(difficulty)}`}>
                    {difficulty}
                </span>
            )
        },
    },
    {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => {
            const duration = row.getValue("duration") as string
            return (
                <div className="font-semibold text-muted-foreground"> 
                    {duration}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
            const interview = row.original
            return (
                <Button className="bg-[rgba(184,255,179,0.7)] hover:bg-white border-2 border-[rgba(19,232,4,0.1)]  hover:border-[rgba(8,102,2,0.8)] text-[rgba(8,102,2,0.9)] px-4 py-2 rounded-md" >
                    <Image src="/candidate/company-interviews/play.svg" alt="Start" width={14} height={14} /> <span className="font-medium">Start</span>
                </Button>
            )
        },
    }
]
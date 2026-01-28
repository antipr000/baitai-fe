"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export type Interview = {
    id: string
    title: string
    sections: number
    candidates: number
    avgTime: string
    status: "Active" | "Archived" | "Draft"
    date: string
}

export const columns: ColumnDef<Interview>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <div className="font-semibold text-xs uppercase tracking-wider text-[rgba(10,13,26,0.8)] px-4">
                    Interview Title
                </div>
            )
        },
        cell: ({ row }) => {
            const title = row.getValue("title") as string
            return (
                <div className="font-semibold text-[rgba(10,13,26,0.9)] px-4">
                    {title}
                </div>
            )
        },
    },
    {
        accessorKey: "sections",
        header: ({ column }) => {
            return (
                <div className="font-semibold text-xs uppercase tracking-wider text-[rgba(10,13,26,0.8)]">
                    Sections
                </div>
            )
        },
        cell: ({ row }) => {
            const sections = row.getValue("sections") as number
            return (
                <div className="font-medium text-[rgba(10,13,26,0.9)] pl-4">
                    {sections}
                </div>
            )
        },
    },
    {
        accessorKey: "candidates",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent p-0 text-[rgba(10,13,26,0.8)] font-semibold text-xs uppercase tracking-wider"
                >
                    Candidates
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(125,141,253,1)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const candidates = row.getValue("candidates") as number
            return (
                <div className="font-bold text-[rgba(10,13,26,0.9)] pl-6">
                    {candidates}
                </div>
            )
        },
    },
    {
        accessorKey: "avgTime",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent p-0 text-[rgba(10,13,26,0.8)] font-semibold text-xs uppercase tracking-wider"
                >
                    Avg Time
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(125,141,253,1)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const avgTime = row.getValue("avgTime") as string
            return (
                <div className="font-bold text-[rgba(10,13,26,0.9)]">
                    {avgTime}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent p-0 text-[rgba(10,13,26,0.8)] font-semibold text-xs uppercase tracking-wider"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(125,141,253,1)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const getStatusStyles = (status: string) => {
                switch (status) {
                    case "Active":
                        return "bg-[rgba(50,255,36,0.1)] border border-[rgba(50,255,36,0.5)] text-[rgba(40,199,29,1)]"
                    case "Archived":
                        return "bg-[rgba(242,129,68,0.1)] border border-[rgba(242,129,68,0.5)] text-[rgba(242,129,68,0.7)]"
                    case "Draft":
                        return "bg-[rgba(105,108,118,0.05)] border border-[rgba(105,108,118,0.5)] text-[rgba(105,108,118,0.7)]"
                    default:
                        return "bg-gray-100 border border-gray-300 text-muted-foreground"
                }
            }
            return (
                <div className="flex justify-start">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyles(status)} min-w-[80px] text-center`}>
                        {status}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent p-0 text-[rgba(10,13,26,0.8)] font-semibold text-xs uppercase tracking-wider"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(125,141,253,1)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("date") as string
            return (
                <div className="font-bold text-[rgba(10,13,26,0.9)]">
                    {date}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: ({ column }) => {
            return (
                <div className="font-semibold text-xs uppercase tracking-wider text-[rgba(10,13,26,0.8)] text-center w-full">
                    Action
                </div>
            )
        },
        cell: ({ row }) => {
            const interview = row.original
            return (
                <div className="flex justify-center">
                    <Link href={`/company/interviews/${interview.id}`}>
                        <Button variant="ghost" className="bg-[rgba(255,241,234,1)] hover:bg-[rgba(255,144,85,0.2)] border border-[rgba(255,144,85,0.1)] rounded-full px-4 text-[rgba(10,13,26,0.7)] h-8" >
                            {/* Using pencil icon similar to mockup */}
                            <Image src="/company/interviews/pencil.svg" alt='pencil' width={14} height={14} className="h-3.5 w-3.5 mr-2 opacity-60" />
                            <span className="font-bold text-xs">Edit</span>
                        </Button>
                    </Link>
                </div>
            )
        },
    }
]

"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDuration } from "@/lib/utils"

export type Interview = {
    id: string
    title: string
    sections: number
    candidates: number
    template_id: string
    avg_time: number
    status: "active" | "archived" | "draft"
    date: string
}

export const columns: ColumnDef<Interview>[] = [
    {
        accessorKey: "title",
        header: () => (
            <div className="font-semibold text-sm text-[rgba(10,13,26,0.8)] px-4">
                Interview Title
            </div>
        ),
        cell: ({ row }) => {
            const title = row.getValue("title") as string
            return (
                <div className="font-medium text-sm text-[rgba(10,13,26,0.9)] px-4 max-w-[300px] whitespace-normal leading-relaxed" title={title}>
                    {title}
                </div>
            )
        },
    },
    {
        accessorKey: "sections",
        header: () => (
            <div className="font-semibold text-sm text-[rgba(10,13,26,0.8)] px-4">
                Sections
            </div>
        ),
        cell: ({ row }) => {
            const sections = row.getValue("sections") as number
            return (
                <div className=" text-sm text-[rgba(10,13,26,0.9)] pl-4">
                    {sections}
                </div>
            )
        },
    },
    {
        accessorKey: "candidates",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className=" p-0 text-[rgba(10,13,26,0.8)] font-semibold text-sm"
            >
                Candidates
                <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(58,63,187,1)]" />
            </Button>
        ),
        cell: ({ row }) => {
            const candidates = row.getValue("candidates") as number
            return (
                <div className=" text-[rgba(10,13,26,0.9)] pl-6">
                    {candidates}
                </div>
            )
        },
    },
    {
        accessorKey: "avg_time",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className=" p-0 text-[rgba(10,13,26,0.8)] font-semibold text-sm"
            >
                Avg Time
                <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(58,63,187,1)]" />
            </Button>
        ),
        cell: ({ row }) => {
            const avg_time = row.getValue("avg_time") as number
            return (
                <div className=" text-sm text-[rgba(10,13,26,0.9)]">
                    {formatDuration(avg_time)}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className=" p-0 text-[rgba(10,13,26,0.8)] font-semibold text-sm"
            >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(58,63,187,1)]" />
            </Button>
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const getStatusStyles = (status: string) => {
                const s = status?.toLowerCase()
                switch (s) {
                    case "active":
                        return " border text-sm border-[rgba(50,255,36,1)] text-[rgba(40,199,29,1)]"
                    case "archived":
                        return " border text-sm border-[rgba(242,129,68,1)] text-[rgba(242,129,68,0.7)]"
                    case "draft":
                        return " border text-sm border-[rgba(105,108,118,1)] text-[rgba(105,108,118,0.7)]"
                    default:
                        return " border border-gray-300 text-sm text-muted-foreground"
                } 
            }
            return (
                <div className="flex justify-start">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyles(status)} min-w-20 text-center capitalize`}>
                        {status}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "date",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className=" p-0 text-[rgba(10,13,26,0.8)] font-medium text-sm"
            >
                Date
                <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(58,63,187,1)]" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = row.getValue("date") as string
            const formattedDate = new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            })
            return (
                <div className=" text-sm text-[rgba(10,13,26,0.9)]">
                    {formattedDate}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: () => (
            <div className="font-semibold text-sm text-[rgba(10,13,26,0.8)] px-4">
                Action
            </div>
        ),
        cell: ({ row }) => {
            const interview = row.original
            return (
                <div
                    className="flex justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Link href={`/company/edit/${interview.template_id}`}>
                        <Button
                            variant="outline"
                            className="border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,1)] hover:text-white rounded-md px-4 h-8 transition-all duration-200 flex items-center gap-2"
                        >
                            <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors duration-200">
                                <path fillRule="evenodd" clipRule="evenodd" d="M13.0298 1.17417C12.2976 0.441943 11.1104 0.44194 10.3781 1.17417L1.52965 10.0227C1.2679 10.2844 1.08948 10.6178 1.01689 10.9808L0.649969 12.8154C0.475039 13.69 1.24619 14.4612 2.12084 14.2863L3.95543 13.9193C4.31841 13.8468 4.65178 13.6683 4.91353 13.4066L13.762 4.55806C14.4942 3.82582 14.4942 2.63864 13.762 1.90641L13.0298 1.17417ZM11.262 2.05806C11.5061 1.81398 11.9018 1.81398 12.1459 2.05806L12.8781 2.79029C13.1222 3.03437 13.1222 3.43009 12.8781 3.67418L11.2084 5.34392L9.59231 3.7278L11.262 2.05806ZM8.70838 4.61169L2.41353 10.9066C2.32628 10.9938 2.26681 11.1049 2.24261 11.2259L1.87569 13.0605L3.71028 12.6936C3.83128 12.6694 3.9424 12.6099 4.02965 12.5227L10.3245 6.2278L8.70838 4.61169Z" fill="currentColor" />
                            </svg>
                            <span className=" text-xs">Edit</span>
                        </Button>
                    </Link>
                </div>
            )
        },
    }
]

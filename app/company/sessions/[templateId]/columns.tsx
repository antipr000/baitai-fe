"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"

export type Candidate = {
    id: string
    name: string
    email: string
    status: "Completed" | "In Progress" | "Pending"
    score: number
    appliedDate: string
    sessionId: string
}

export const columns: ColumnDef<Candidate>[] = [
    {
        accessorKey: "name",
        header: () => (
            <div className="font-semibold text-sm text-[rgba(10,13,26,0.8)] px-4">
                Candidate
            </div>
        ),
        cell: ({ row }) => {
            const name = row.getValue("name") as string
            return (
                <div className="font-medium text-sm text-[rgba(58,63,187,1)] px-4">
                    {name}
                </div>
            )
        },
    },
    {
        accessorKey: "email",
        header: () => (
            <div className="font-semibold text-sm text-[rgba(10,13,26,0.8)] px-4">
                Email
            </div>
        ),
        cell: ({ row }) => {
            const email = row.getValue("email") as string
            return (
                <div className="text-[rgba(10,13,26,1)]  text-sm px-4">
                    {email}
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
                    className="p-0 text-[rgba(10,13,26,0.8)] font-semibold text-sm"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(58,63,187,1)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const getStatusStyles = (status: string) => {
                switch (status) {
                    case "Completed":
                        return "text-sm border-[rgba(50,255,36,1)] font-normal text-[rgba(40,199,29,1)]"
                    case "In Progress":
                        return "text-sm border-[rgba(242,129,68,1)] font-normal text-[rgba(242,129,68,1)]"
                    case "Pending":
                        // Assuming Pending is gray relative to others, or match design if it is different
                        return "text-sm border-[rgba(105,108,118,1)] font-normal text-[rgba(105,108,118,1)]"
                    default:
                        return "bg-gray-100 border-gray-300 text-sm font-normal text-muted-foreground"
                }
            }
            return (
                <div className="flex justify-start">
                    <span className={`min-w-24 text-center px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusStyles(status)}`}>
                        {status}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "score",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 text-[rgba(10,13,26,1)]  text-sm"
                >
                    Score
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(58,63,187,1)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const score = row.getValue("score") as number
            const status = row.original.status

            if (status !== 'Completed') {
                return (
                    <div className=" text-[rgba(10,13,26,1)] pl-2 text-sm">
                        N/A
                    </div>
                )
            }

            return (
                <div className=" text-[rgba(10,13,26,1)] pl-2 text-sm">
                    {score}%
                </div>
            )
        },
    },
    {
        accessorKey: "appliedDate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 text-[rgba(10,13,26,1)] font-semibold text-sm"
                >
                    Applied Date
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(58,63,187,1)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("appliedDate") as string
            return (
                <div className="text-[rgba(10,13,26,1)]  pl-4 text-sm">
                    {date}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="hover:bg-transparent p-0 cursor-default text-[rgba(10,13,26,1)] font-semibold text-sm"
                >
                    Action
                    <ArrowUpDown className="ml-2 h-4 w-4 text-transparent opacity-0" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const candidate = row.original

            if (candidate.status !== 'Completed') {
                return (
                    <Button variant="ghost" disabled className="text-[rgba(148,163,184,1)] px-0 bg-transparent opacity-50 cursor-not-allowed" >
                        <Eye className="h-4 w-4 mr-2" /> <span className="text-sm font-medium">View</span>
                    </Button>
                )
            }

            return (
                <Link href={`/company/results/${candidate.sessionId}`}>
                    <Button variant="ghost" className="text-[rgba(10,13,26,1)]  px-0 hover:bg-transparent" >
                        <Eye className="h-4 w-4 mr-2" /> <span className="text-sm font-medium">View</span>
                    </Button>
                </Link>
            )
        },
    }
]

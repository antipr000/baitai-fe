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
}

export const columns: ColumnDef<Candidate>[] = [
    {
        accessorKey: "name",
        header: "Candidate",
        cell: ({ row }) => {
            const name = row.getValue("name") as string
            return (
                <div className="font-medium text-[rgba(10,13,26,0.8)]">
                    {name}
                </div>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            const email = row.getValue("email") as string
            return (
                <div className="text-[rgba(10,13,26,0.6)] font-medium">
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
                    className="hover:bg-transparent p-0 text-[rgba(10,13,26,0.8)] font-semibold"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(62,84,251,0.7)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const getStatusStyles = (status: string) => {
                switch (status) {
                    case "Completed":
                        return "bg-[rgba(50,255,36,0.1)] border-[rgba(50,255,36,0.5)] text-[rgba(40,199,29,1)]"
                    case "In Progress":
                        return "bg-[rgba(242,129,68,0.05)] border-[rgba(242,129,68,0.5)] text-[rgba(242,129,68,0.7)]"
                    case "Pending":
                        // Assuming Pending is gray relative to others, or match design if it is different
                        return "px-6 bg-[rgba(105,108,118,0.05)] border-[rgba(105,108,118,0.5)] text-[rgba(105,108,118,0.7)]"
                    default:
                        return "bg-gray-100 border-gray-300 text-muted-foreground"
                }
            }
            return (
                <div className="flex justify-start">
                    <span className={`px-4 py-2 rounded-full text-xs font-semibold border ${getStatusStyles(status)}`}>
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
                    className="hover:bg-transparent p-0 text-[rgba(10,13,26,0.8)] font-semibold"
                >
                    Score
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(62,84,251,0.6)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const score = row.getValue("score") as number
            return (
                <div className="font-medium text-[rgba(10,13,26,0.6)] pl-2">
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
                    className="hover:bg-transparent p-0 text-[rgba(10,13,26,0.8)] font-semibold"
                >
                    Applied Date
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(62,84,251,0.6)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("appliedDate") as string
            return (
                <div className="text-[rgba(10,13,26,0.6)] font-medium pl-4">
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
                    className="hover:bg-transparent p-0 cursor-default text-[rgba(10,13,26,0.8)] font-semibold"
                >
                    Action
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(62,84,251,0.7)] opacity-0" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const candidate = row.original
            return (
                <Link href={`/company/candidates/${candidate.id}`}>
                    <Button variant="ghost" className="text-[rgba(148,163,184,1)] hover:text-[rgba(62,84,251,1)] px-0 hover:bg-transparent" >
                        <Eye className="h-4 w-4 mr-2" /> <span className="font-semibold">View</span>
                    </Button>
                </Link>
            )
        },
    }
]

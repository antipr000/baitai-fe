"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye } from "lucide-react"
import Image from "next/image"

// This type is used to define the shape of our data.
export type Result = {
    id: string
    jobRole: string
    interviewType: "Practice" | "Interview"
    company: string
    date: string
    score: string
}

export const columns: ColumnDef<Result>[] = [
    {
        accessorKey: "jobRole",
        header: "Job Role",
        cell: ({ row }) => {
            const jobRole = row.getValue("jobRole") as string
            return (
                <div className="">
                    {jobRole}
                </div>
            )
        },
    },
    {
        accessorKey: "interviewType",
        header: "Interview Type",
        cell: ({ row }) => {
            const interviewType = row.getValue("interviewType") as string
            const getTypeStyles = (type: string) => {
                switch (type) {
                    case "Practice":
                        return "bg-[rgba(50,255,36,0.05)] border-[rgba(50,255,36,0.5)] text-[rgba(55,212,44,0.7)]"
                    case "Interview":
                        return "bg-[rgba(62,84,251,0.05)] border-[rgba(62,84,251,0.5)] text-[rgba(62,84,251,0.9)]"
                    default:
                        return "bg-gray-100 border-gray-300 text-muted-foreground"
                }
            }
            return (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTypeStyles(interviewType)}`}>
                    {interviewType}
                </span>
            )
        },
    },
    {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => {
            const company = row.getValue("company") as string
            return (
                <div className="font-semibold text-muted-foreground">
                    {company}
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
                    className="hover:bg-transparent p-0"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(62,84,251,0.7)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("date") as string
            return (
                <div className="font-semibold text-muted-foreground">
                    {date}
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
                    className="hover:bg-transparent p-0"
                >
                    Score
                    <ArrowUpDown className="ml-2 h-4 w-4 text-[rgba(62,84,251,0.7)]" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const score = row.getValue("score") as string
            return (
                <div className="font-semibold text-muted-foreground">
                    {score}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
            const result = row.original
            return (
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-md" >
                    <Eye className="h-4 w-4 mr-2" /> <span className="font-medium">View</span>
                </Button>
            )
        },
    }
]

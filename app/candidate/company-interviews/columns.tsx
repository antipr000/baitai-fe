"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import Image from "next/image"



// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type CompanyInterview = {
    id: string
    company: string
    position: string
    sentDate: string
    deadline: string
    status: "pending" | "processing" | "success" | "rejected" | "completed" | "cancelled"
    templateId: string
}

export const columns: ColumnDef<CompanyInterview>[] = [
    {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => {
            const company = row.getValue("company") as string
            return (
                <div className="font-medium">
                    {company}
                </div>
            )
        },
    },
    {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => {
            const position = row.getValue("position") as string
            return (
                <div className="font-medium text-muted-foreground">
                    {position}
                </div>
            )
        },
    },
    {
        accessorKey: "sentDate",
        header: "Sent Date",

        cell: ({ row }) => {
            const sentDate = row.getValue("sentDate") as string
            return (
                <div className="font-medium text-muted-foreground">
                    {sentDate}
                </div>
            )
        },
    },
    {
        accessorKey: "deadline",
        header: "Deadline",

        cell: ({ row }) => {
            const deadline = row.getValue("deadline") as string
            return (
                <div className="font-medium text-muted-foreground">
                    {deadline}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string

            let badgeStyles = "bg-[rgba(212,149,12,0.05)] border-[rgba(212,149,12,0.5)] text-[rgba(212,149,12,0.82)]" // Default/Pending (Yellowish)

            if (status === 'completed' || status === 'success') {
                badgeStyles = "bg-[rgba(0,186,0,0.1)] border-[rgba(0,186,0,0.5)] text-[rgba(0,128,0,0.9)]" // Green
            } else if (status === 'cancelled' || status === 'rejected') {
                badgeStyles = "bg-[rgba(224,83,83,0.1)] border-[rgba(224,83,83,0.5)] text-[rgba(200,50,50,0.9)]" // Red
            }

            return (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${badgeStyles} capitalize`}>
                    {status}
                </span>
            )
        },
    },

    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
            const interview = row.original
            if (interview.status === 'completed' || interview.status === 'cancelled') {
                return null
            }
            // TODO: Add verification in backend too for template
            return (
                <Link href={`/interview/${interview.templateId}`}>
                    <Button className="bg-[rgba(184,255,179,0.7)] hover:bg-white border-2 border-[rgba(19,232,4,0.1)]  hover:border-[rgba(8,102,2,0.8)] text-[rgba(8,102,2,0.9)] px-4 py-2 rounded-md" >
                        <Image src="/candidate/company-interviews/play.svg" alt="Start" width={14} height={14} /> <span className="font-medium">Start</span>
                    </Button>
                </Link>
            )
        },
    }
]
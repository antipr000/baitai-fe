"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import Link from "next/link"

export type CompanyInterview = {
    id: string
    company: string
    position: string
    sentDate: string
    deadline: string
    status: "pending" | "completed" | "expired"
    templateId: string
}

export const columns: ColumnDef<CompanyInterview>[] = [
    {
        accessorKey: "company",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm pl-2">Company</div>,
        cell: ({ row }) => {
            const company = row.getValue("company") as string
            return (
                <div className="text-[rgba(58,63,187,1)] text-sm pl-2 font-medium cursor-pointer hover:underline">
                    {company}
                </div>
            )
        },
    },
    {
        accessorKey: "position",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Position</div>,
        cell: ({ row }) => {
            const position = row.getValue("position") as string
            return (
                <div className="text-[rgba(10,13,26,1)] text-sm">
                    {position}
                </div>
            )
        },
    },
    {
        accessorKey: "sentDate",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Sent Date</div>,
        cell: ({ row }) => {
            const sentDate = row.getValue("sentDate") as string
            return (
                <div className="text-[rgba(10,13,26,0.6)] text-sm">
                    {sentDate}
                </div>
            )
        },
    },
    {
        accessorKey: "deadline",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Deadline</div>,
        cell: ({ row }) => {
            const deadline = row.getValue("deadline") as string
            return (
                <div className="text-[rgba(10,13,26,0.6)] text-sm">
                    {deadline}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: () => <div className="text-[rgba(10,13,26,1)] font-semibold text-sm">Status</div>,
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const getStatusStyles = (s: string) => {
                switch (s.toLowerCase()) {
                    case "pending":
                        return "border-[rgba(255,107,107,1)] text-[rgba(255,107,107,1)] bg-[rgba(255,107,107,0.02)]"
                    case "completed":
                        return "border-[rgba(3,231,41,1)] text-[rgba(3,231,41,1)] bg-[rgba(3,231,41,0.02)]"
                    case "expired":
                        return "border-gray-300 text-gray-400 bg-gray-50"
                    default:
                        return "border-gray-200 text-gray-500"
                }
            }
            return (
                <div className="flex items-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
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
                        <Image src="/candidate/company-interviews/play.svg" alt="Start" width={8} height={10} className="mr-2" style={{ filter: 'brightness(0) invert(1)' }} />
                        Take Interview
                    </Button>
                </Link>
            )
        },
    }
]

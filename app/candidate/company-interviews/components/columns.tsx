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
            )
        },
    }
]

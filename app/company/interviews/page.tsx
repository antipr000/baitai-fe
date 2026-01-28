"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackButton2 } from '@/components/ui/back-button2'
import Image from 'next/image'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { DataTable } from './data-table'
import { columns, Interview } from './columns'
import { BackButton } from '@/components/ui/back-button'

// Mock Data
const interviews: Interview[] = [
    {
        id: "1",
        title: "Software Engineer Interview",
        sections: 5,
        candidates: 25,
        avgTime: "45 min",
        status: "Active",
        date: "01-03-25"
    },
    {
        id: "2",
        title: "Product Manager Assessment",
        sections: 3,
        candidates: 30,
        avgTime: "35 min",
        status: "Archived",
        date: "05-02-25"
    },
    {
        id: "3",
        title: "Data Analyst Screening",
        sections: 4,
        candidates: 64,
        avgTime: "40 min",
        status: "Draft",
        date: "19-01-25"
    },
    {
        id: "4",
        title: "UI Designer Interview",
        sections: 3,
        candidates: 30,
        avgTime: "40 min",
        status: "Draft",
        date: "12-01-25"
    },
    {
        id: "5",
        title: "Backend Developer Assessment",
        sections: 4,
        candidates: 10,
        avgTime: "45 min",
        status: "Active",
        date: "11-01-25"
    },
    {
        id: "6",
        title: "Fullstack Developer Interview",
        sections: 4,
        candidates: 10,
        avgTime: "45 min",
        status: "Active",
        date: "11-01-25"
    }
]

export default function InterviewsPage() {
    return (
        <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
            <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto">
                <div className="max-w-7xl mx-auto p-6 space-y-10">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className='flex items-start gap-4'>
                            <BackButton />
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-[rgba(125,141,253,1)]">All Interviews</h1>
                                <p className="text-[rgba(84,86,95,0.5)] font-medium text-sm">Manage all your created interviews</p>
                            </div>
                        </div>
                        <Link href="/company/create">
                            <Button size={"lg"} className="bg-[linear-gradient(93.21deg,rgba(125,141,253,1)_-31.21%,rgba(148,162,255,1)_174.4%)] hover:opacity-90 text-white flex items-center gap-2 rounded-lg px-6 shadow-md shadow-[rgba(125,141,253,0.3)]">
                                <PlusCircle className="h-5 w-5" />
                                <span className="font-semibold">New Interview</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                        {/* Total Interviews */}
                        <Card className="bg-[rgba(104,100,247,0.05)] border border-[rgba(104,100,247,0.2)] shadow-none">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-5">
                                    <div className="bg-[rgba(104,100,247,0.15)] w-14 h-14 rounded-xl flex items-center justify-center">
                                        <Image src="/company/interviews/doc.svg" alt="doc" width={28} height={28} className="text-[rgba(104,100,247,1)]" />
                                    </div>
                                    <div>
                                        <p className="text-base font-medium text-[rgba(10,13,26,0.46)] ">Total Interviews</p>
                                        <p className="text-3xl font-semibold text-[rgba(10,13,26,0.7)]">10</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Interviews */}
                        <Card className="bg-[rgba(51,204,204,0.05)] border border-[rgba(51,204,204,0.2)] shadow-none">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-5">
                                    <div className="bg-[rgba(51,204,204,0.15)] w-14 h-14 rounded-full flex items-center justify-center">
                                        <Image src="/company/interviews/clock.svg" alt="clock" width={28} height={28} />
                                    </div>
                                    <div>
                                        <p className="text-base font-medium text-[rgba(10,13,26,0.46)] ">Active Interviews</p>
                                        <p className="text-3xl font-semibold text-[rgba(10,13,26,0.7)]">6</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Candidates */}
                        <Card className="bg-[rgba(253,96,80,0.05)] border border-[rgba(253,96,80,0.2)] shadow-none">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-5">
                                    <div className="bg-[rgba(253,96,80,0.15)] w-14 h-14 rounded-lg flex items-center justify-center">
                                        <Image src="/company/interviews/people.svg" alt="people" width={28} height={28} />
                                    </div>
                                    <div>
                                        <p className="text-base font-medium text-[rgba(10,13,26,0.46)] ">Total Candidates</p>
                                        <p className="text-3xl font-semibold text-[rgba(10,13,26,0.7)]">95</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Table Section */}
                    <div>
                        <DataTable columns={columns} data={interviews} />
                    </div>

                </div>
            </div>
        </div>
    )
}

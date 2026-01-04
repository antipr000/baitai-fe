import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import Image from 'next/image'
import React from 'react'
import { DataTable } from './data-table'
import { columns, Result } from './columns'


async function getData(): Promise<Result[]> {
    return [
        {
            id: "1",
            jobRole: "Software Engineer",
            interviewType: "Practice",
            company: "------",
            date: "2025-11-14",
            score: "85%",
        },
        {
            id: "2",
            jobRole: "Backend Developer",
            interviewType: "Interview",
            company: "Mindtrix",
            date: "2025-11-12",
            score: "82%",
        },
        {
            id: "3",
            jobRole: "UI/UX Designer",
            interviewType: "Practice",
            company: "------",
            date: "2025-11-10",
            score: "80%",
        },
        {
            id: "4",
            jobRole: "Database Fundamentals",
            interviewType: "Practice",
            company: "------",
            date: "2025-11-05",
            score: "79%",
        },
        {
            id: "5",
            jobRole: "Software Engineer",
            interviewType: "Interview",
            company: "Mindtrix",
            date: "2025-11-04",
            score: "75%",
        },
        {
            id: "6",
            jobRole: "Software Engineer",
            interviewType: "Interview",
            company: "Mindtrix",
            date: "2025-11-02",
            score: "65%",
        },
        {
            id: "7",
            jobRole: "UI/UX Designer",
            interviewType: "Interview",
            company: "Mindtrix",
            date: "2025-11-01",
            score: "60%",
        },
    ]
}




export default async function Results() {
    const data = await getData()
    return (
        <div>
            <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
                <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto  ">
                    <div className="max-w-7xl mx-auto p-6 space-y-8 mb-5">

                        {/* Header */}
                        <div className="flex justify-between items-center ">
                            <div className='flex items-center justify-center gap-4'>
                                <BackButton />
                                <h1 className="text-2xl tracking-wide font-semibold bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)] bg-clip-text text-transparent">All Results</h1>
                            </div>

                        </div>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* Total Interviews */}
                            <Card className="bg-[rgba(104,100,247,0.05)] border border-[rgba(104,100,247,0.3)]">
                                <CardContent className="">
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                                            <Image src="/candidate/results/people.svg" alt="Total Interviews" width={48} height={48} />
                                        </div>
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Total Interviews</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)] ">19</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Practice Interviews */}
                            <Card className="bg-[rgba(74,222,11,0.05)] border border-[rgba(74,222,11,0.3)]">
                                <CardContent className="">
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                                            <Image src="/candidate/results/target.svg" alt="Practice Interviews" width={48} height={48} />
                                        </div>
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Practice Interviews</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">10</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Interview Invites */}
                            <Card className="bg-[rgba(242,129,68,0.05)] border border-[rgba(242,129,68,0.3)]">
                                <CardContent className="">
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                                            <Image src="/candidate/results/note.svg" alt="Interview Invites" width={48} height={48} />
                                        </div>
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Interview Invites</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">9</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Average Score */}
                            <Card className="bg-[rgba(58,170,255,0.05)] border border-[rgba(58,170,255,0.3)]">
                                <CardContent className="">
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                                            <Image src="/candidate/results/people2.svg" alt="Average Score" width={48} height={48} />
                                        </div>
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Avg Score</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">82%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/*Data table  */}
                        <DataTable columns={columns} data={data} />
                    </div>
                </div>
            </div>
        </div>
    )
}

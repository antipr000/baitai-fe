import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import Image from 'next/image'
import React from 'react'
import { DataTable } from './data-table'
import { columns, PracticeInterview } from './columns'


async function getData(): Promise<PracticeInterview[]> {
    return [
        {
            id: "1",
            title: "Software Engineer Practice",
            category: "General",
            difficulty: "Easy",
            duration: "45 min",
        },
        {
            id: "2",
            title: "Frontend Developer Assessment",
            category: "Frontend",
            difficulty: "Medium",
            duration: "30 min",
        },
        {
            id: "3",
            title: "Full Stack Challenge",
            category: "Full Stack",
            difficulty: "Difficult",
            duration: "30 min",
        },
        {
            id: "4",
            title: "Software Engineer Practice",
            category: "General",
            difficulty: "Easy",
            duration: "45 min",
        },
        {
            id: "5",
            title: "Software Engineer Practice",
            category: "General",
            difficulty: "Easy",
            duration: "45 min",
        },
        {
            id: "6",
            title: "Frontend Developer Assessment",
            category: "Frontend",
            difficulty: "Medium",
            duration: "30 min",
        },
        {
            id: "7",
            title: "Frontend Developer Assessment",
            category: "Frontend",
            difficulty: "Medium",
            duration: "30 min",
        },
        {
            id: "8",
            title: "Frontend Developer Assessment",
            category: "Frontend",
            difficulty: "Medium",
            duration: "30 min",
        },
        {
            id: "9",
            title: "Frontend Developer Assessment",
            category: "Frontend",
            difficulty: "Medium",
            duration: "30 min",
        },
        {
            id: "10",
            title: "Full Stack Challenge",
            category: "Full Stack",
            difficulty: "Difficult",
            duration: "30 min",
        },
    ]
}




export default async function PracticeInterviews() {
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
                                <h1 className="text-2xl tracking-wide font-semibold bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)] bg-clip-text text-transparent">Interview Invites</h1>
                            </div>

                        </div>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* Total */}
                            <Card className="bg-[linear-gradient(104.37deg,rgba(246,251,255,0.1)_-20.97%,rgba(75,179,255,0.1)_129.56%)] border border-[rgba(75,179,255,0.5)]">
                                <CardContent className="">
                                    <div className=" flex items-center gap-3">
                                        <Image src="/candidate/practice-interviews/up.svg" className='translate-y-1' alt="Company" width={30} height={30} />
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Total Practice</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)] ">10</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/*Easy */}
                            <Card className="bg-[linear-gradient(109.41deg,rgba(244,255,240,0.1)_-15.66%,rgba(106,175,80,0.15)_34.39%)] border border-[rgba(106,175,80,0.5)]">
                                <CardContent className="">
                                    <div className=" flex items-center gap-3">
                                        <Image src="/candidate/practice-interviews/target-green.svg" className="translate-y-1" alt="positions" width={30} height={30} />
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Easy</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">3</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/*Medium*/}
                            <Card className="bg-[linear-gradient(109.41deg,rgba(255, 250, 242, 0.3)_-15.66%,rgba(252,183,50,0.1)_119.55%)] border border-[rgba(252,183,50,0.5)]">
                                <CardContent className="">
                                    <div className=" flex items-center gap-3">
                                        <Image src="/candidate/practice-interviews/target-yellow.svg" className="translate-y-1" alt="positions" width={30} height={30} />
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Medium</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">5</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/*Hard */}

                            <Card className="bg-[linear-gradient(109.41deg,rgba(242,255,255,0.15)_-15.66%,rgba(255,51,0,0.15)_119.55%)] border border-[rgba(255,51,0,0.5)]">
                                <CardContent className="">
                                    <div className=" flex items-center gap-3">
                                        <Image src="/candidate/practice-interviews/target-red.svg" className="translate-y-1" alt="positions" width={30} height={30} />
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Difficult</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">2</p>
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

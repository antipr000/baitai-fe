import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'
import Image from 'next/image'
import React from 'react'
import { DataTable } from './data-table'
import { columns, CompanyInterview } from './columns'


async function getData(): Promise<CompanyInterview[]> {
  return [
    {
      id: "1",
      company: "TechCorp",
      position: "Senior Developer",
      sentDate: "2025-12-06",
      deadline: "Due in 2 days",
      status: "pending",
    },
    {
      id: "2",
      company: "StartupX",
      position: "Product Engineer",
      sentDate: "2025-12-05",
      deadline: "Due in 3 days",
      status: "pending",
    },
    {
      id: "3",
      company: "Mindtrix",
      position: "Product Engineer",
      sentDate: "2025-12-04",
      deadline: "Due in 4 days",
      status: "pending",
    },
    {
      id: "4",
      company: "AIclub",
      position: "Product Engineer",
      sentDate: "2025-12-03",
      deadline: "Due in 5 days",
      status: "pending",
    },
    {
      id: "5",
      company: "Cloudsystem",
      position: "Product Engineer",
      sentDate: "2025-12-02",
      deadline: "Due in 10 days",
      status: "pending",
    },
    {
      id: "6",
      company: "Syncdata",
      position: "Product Engineer",
      sentDate: "2025-12-02",
      deadline: "Due in 3 weeks",
      status: "pending",
    },
  ]
}




export default async function CompanyInterviews() {
    const data = await getData()
    
    return (
        <div>
            <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
                <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto  ">
                    <div className="max-w-7xl mx-auto p-6 space-y-8">

                        {/* Header */}
                        <div className="flex justify-between items-center ">
                            <div className='flex items-center justify-center gap-4'>
                                <BackButton />
                                <h1 className="text-2xl tracking-wide font-semibold bg-linear-to-r from-[rgba(62,84,251,1)] to-[rgba(195,206,255,1)] bg-clip-text text-transparent">Interview Invites</h1>
                            </div>

                        </div>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Pending Interviews */}
                            <Card className="bg-[rgba(104,100,247,0.05)] border border-[rgba(104,100,247,0.3)]">
                                <CardContent className="">
                                    <div className=" flex items-center gap-3">
                                        <Image src="/candidate/company-interviews/interview.svg" className='translate-y-1' alt="Pending Interviews" width={60} height={60} />
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70  ">Pending Interviews</p>
                                            <p className=" text-2xl font-bold text-[rgba(104,100,247,1)]">6</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Companies */}

                            <Card className="bg-[rgba(51,204,204,0.05)] border border-[rgba(51,204,204,0.3)]">
                                <CardContent className="">
                                    <div className=" flex items-center gap-3">
                                        <Image  src="/candidate/company-interviews/building.png" className='translate-y-1' alt="Company" width={60} height={60} />
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Companies</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)] ">6</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/*positions */}
                            <Card className="bg-[rgba(242,129,68,0.05)] border border-[rgba(252,183,50,0.3)]">
                                <CardContent className="">
                                    <div className=" flex items-center gap-3">
                                        <Image src="/candidate/company-interviews/bag.svg" className="translate-y-1" alt="positions" width={60} height={60} />
                                        <div className=''>
                                            <p className="text-xl font-medium text-muted-foreground/70 ">Positions</p>
                                            <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">6</p>
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

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import React from 'react'

export default function CompanyInterviews() {
    return (
        <div>
            <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
                <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto  ">
                    <div className="max-w-7xl mx-auto p-6 space-y-8">

                        {/* Header */}
                        <div className="flex justify-between items-center ">
                            <div className='flex items-center justify-center gap-4'>
                                <div className='bg-[rgba(98,117,252,0.82)] p-2 px-1 rounded-md'>
                                    <Image src="/candidate/company-interviews/left-arrow.svg" alt="Back" width={20} height={20} />
                                </div>
                                <h1 className="text-2xl tracking-wide font-bold bg-linear-to-r from-[rgba(62,84,251,1)] to-[rgba(195,206,255,1)] bg-clip-text text-transparent">Interview Invites</h1>
                            </div>

                        </div>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Pending Interviews */}
                            <Card className="bg-[rgba(104,100,247,0.05)] border border-[rgba(104,100,247,0.3)]">
                                <CardContent className="pt-6">
                                    <div className="group flex items-center justify-between">
                                        <Image src="/candidate/company-interviews/interview.svg" alt="Pending Interviews" width={40} height={40} />
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Pending Interviews</p>
                                            <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">6</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Companies */}

                            <Card className="bg-[rgba(51,204,204,0.05)] border border-[rgba(51,204,204,0.3)]">
                                <CardContent className="pt-6">
                                    <div className="group flex items-center justify-between">
                                        <Image src="/candidate/company-interviews/building.svg" className='group-hover:-rotate-10 transition-all duration-400' alt="Company" width={40} height={40} />
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Companies</p>
                                            <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">6</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/*positions */}
                            <Card className="bg-[rgba(242,129,68,0.05)] border border-[rgba(252,183,50,0.3)]">
                                <CardContent className="pt-6">
                                    <div className="group flex items-center justify-between">
                                        <Image src="/candidate/company-interviews/bag.svg" className='group-hover:-rotate-10 transition-all duration-400' alt="positions" width={40} height={40} />
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Positions</p>
                                            <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">6</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

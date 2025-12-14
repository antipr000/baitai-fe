'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { RecentResultsSection } from '@/components/candidate/dashboard/recent-results-section'
import { InterviewInvitesSection } from '@/components/candidate/dashboard/interview-invites-section'
import { PracticeInterviewsSection } from '@/components/candidate/dashboard/practice-interviews-section'

export default function DashboardPage() {
    const router = useRouter()

    const handleInterviewStart = (interviewId: string) => {
        router.push('/interview')
    }

    const handlePracticeStart = (interviewId: string) => {
        router.push('/interview')
    }


    return (
        <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
            <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto  ">
                <div className="max-w-7xl mx-auto p-6 space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-center ">
                        <div className='flex items-center justify-center gap-4'>
                            <div className='bg-[rgba(98,117,252,0.82)]  p-2 px-1 rounded-md'>
                                <Image src="/candidate/dashboard/left-arrow.svg" alt="Back" width={20} height={20} />
                            </div>
                            <h1 className="text-2xl tracking-wide font-bold bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)] bg-clip-text text-transparent">My Dashboard</h1>
                        </div>
                        <Button variant="default" className="gap-2  bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)]">
                            <Image src="/candidate/dashboard/note.svg" alt="Results" width={20} height={20} /> <span className='font-semibold'>View all Results</span>
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Completed */}
                        <Card className="bg-[rgba(0,186,0,0.1)] border border-[rgba(0,186,0,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-between">
                                    <Image src="/candidate/dashboard/complete.svg" alt="Completed" width={32} height={32} />
                                    <div>
                                        <p className="  font-medium text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Completed</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">6</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending */}

                        <Card className="bg-[rgba(254,118,168,0.1)] border border-[rgba(252,183,50,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-between">
                                    <Image src="/candidate/dashboard/pending.svg" className='group-hover:-rotate-10 transition-all duration-400' alt="Pending" width={32} height={32} />
                                    <div>
                                        <p className="font-medium  text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Pending</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">2</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Average Score */}

                        <Card className="bg-[rgba(252,183,50,0.1)] border border-[rgba(252,183,50,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-between">
                                    <Image src="/candidate/dashboard/score.svg" className='group-hover:-rotate-10 transition-all duration-400' alt="score" width={32} height={32} />
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Average Score</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">82%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>



                        {/* Total Time */}

                        <Card className="bg-[rgba(224,83,83,0.1)] border border-[rgba(224,83,83,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-between">
                                    <Image src="/candidate/dashboard/time.svg" className='group-hover:-rotate-10 transition-all duration-400' alt="time" width={32} height={32} />
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Total Time</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">7h</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content - Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-15">
                        <InterviewInvitesSection onStartInterview={handleInterviewStart} onViewMore={()=>router.push("/candidate/company-interviews")} />
                        <PracticeInterviewsSection onStartInterview={handlePracticeStart} onViewMore={()=>router.push("/candidate/practice-interviews")}/>
                    </div>

                    {/* Recent Results Section */}
                    <RecentResultsSection />
                </div>
            </div>
        </div>
    )
}

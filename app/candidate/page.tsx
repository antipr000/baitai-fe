'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Zap, Target, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[rgba(248,250,255,1)]">
            <div className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold bg-linear-to-r from-[rgba(62,84,251,1)] to-[rgba(195,206,255,1)] bg-clip-text text-transparent">My Dashboard</h1>
                    <Button variant="default" className="gap-2 bg-linear-to-r from-[rgba(62,84,251,1)] to-[rgba(195,206,255,1)]">
                        <Image src="/candidate/note.svg" alt="Results" width={20} height={20} /> <span>View all Results </span>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Completed */}
                    <Card className="bg-[rgba(0,186,0,0.1)] border border-[rgba(0,186,0,0.5)]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <Image src="/candidate/complete.svg" alt="Completed" width={32} height={32} />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Completed</p>
                                    <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">6</p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending */}

                    <Card className="bg-[rgba(254,118,168,0.1)] border border-[rgba(252,183,50,0.5)]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <Image src="/candidate/pending.svg" alt="Pending" width={32} height={32} />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Pending</p>
                                    <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">2</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                    {/* Average Score */}

                    <Card className="bg-[rgba(252,183,50,0.1)] border border-[rgba(252,183,50,0.5)]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <Image src="/candidate/score.svg" alt="score" width={32} height={32} />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Average Score</p>
                                    <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">82%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>



                    {/* Total Time */}
                   
                    <Card className="bg-[rgba(224,83,83,0.1)] border border-[rgba(224,83,83,0.5)]">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <Image src="/candidate/time.svg" alt="time" width={32} height={32} />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Total Time</p>
                                    <p className="text-2xl font-bold text-[rgba(104,100,247,1)]">7h</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Interview Invites */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[rgba(117,134,253,1)]">Interview Invites</h2>
                            <button className="text-[rgba(255,100,27,0.9)] text-sm font-medium hover:underline flex items-center gap-1">
                                View more <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Interview Card 1 */}


                             <Card className="bg-white">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">Mindtrix</h3>
                                            <p className="text-sm text-muted-foreground">Senior Software Engineer</p>
                                        </div>
                                        <Badge className="bg-orange-100 text-orange-700 border-0">
                                            Due in 2 days
                                        </Badge>
                                        <Button className="w-full bg-linear-to-r from-[rgba(255,103,32,1)] to-[rgba(255,140,86,1)] hover:bg-orange-600 border border-[rgba(255,147,96,0.1)] text-[rgba(248,250,255,1)]">
                                            Start Interview
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>


                            {/* Interview Card 2 */}
                            <Card className="bg-white">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">Become</h3>
                                            <p className="text-sm text-slate-500">UI/UX Designer</p>
                                        </div>
                                        <Badge className="bg-orange-100 text-orange-700 border-0">
                                            Due in 5 days
                                        </Badge>
                                        <Button className="w-full bg-linear-to-r from-[rgba(255,103,32,1)] to-[rgba(255,140,86,1)] hover:bg-orange-600 border border-[rgba(255,147,96,0.1)] text-[rgba(248,250,255,1)]">
                                            Start Interview
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Practice Interviews */}
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[rgba(117,134,253,1)]">Practice Interviews</h2>
                            <button className="text-[rgba(255,100,27,0.9)] text-sm font-medium hover:underline flex items-center gap-1">
                                View more <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Practice Card 1 */}
                            <Card className="bg-white">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">Mindtrix</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className="bg-green-100 text-green-700 border-0">
                                                    Easy
                                                </Badge>
                                                <span className="text-sm text-slate-500">45 min</span>
                                            </div>
                                        </div>
                                        <Button className="w-full border border-[rgba(82,86,184,1)] text-[rgba(83,87,184,1)] hover:bg-blue-50 bg-white">
                                            Start Interview
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Practice Card 2 */}
                            <Card className="bg-white">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">Mindtrix</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className="bg-yellow-100 text-yellow-700 border-0">
                                                    Medium
                                                </Badge>
                                                <span className="text-sm text-slate-500">45 min</span>
                                            </div>
                                        </div>
                                        <Button className="w-full border border-[rgba(82,86,184,1)] text-[rgba(83,87,184,1)] hover:bg-blue-50 bg-white">
                                            Start Interview
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Practice Card 3 */}
                            <Card className="bg-white">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">Mindtrix</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className="bg-red-100 text-red-700 border-0">
                                                    Difficult
                                                </Badge>
                                                <span className="text-sm text-slate-500">45 min</span>
                                            </div>
                                        </div>
                                        <Button className="w-full border border-[rgba(82,86,184,1)] text-[rgba(83,87,184,1)] hover:bg-blue-50 bg-white">
                                            Start Interview
                                        </Button>
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

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, FileText, Users, Hourglass, Settings, PenLine, Clock, List, PlusCircle } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'
import { BackButton2 } from '@/components/ui/back-button2'
import Image from 'next/image'

// Placeholder data for the interview list
const interviews = [
    {
        id: 1,
        title: "Software Engineer",
        status: "Active",
        sections: 4,
        candidates: 12,
        duration: "45 min",
        statusColor: "bg-[rgba(50,255,36,0.1)] text-[rgba(55,212,44,0.7)] border border-[rgba(50,255,36,0.5)]"
    },
    {
        id: 2,
        title: "Product Manager",
        status: "Active",
        sections: 3,
        candidates: 20,
        duration: "35 min",
        statusColor: "bg-[rgba(50,255,36,0.1)] text-[rgba(55,212,44,0.7)] border border-[rgba(50,255,36,0.5)]"
    },
    {
        id: 3,
        title: "UI/UX Designer",
        status: "Draft",
        sections: 5,
        candidates: 7,
        duration: "50 min",
        statusColor: "bg-[rgba(50,255,36,0.1)] text-[rgba(55,212,44,0.7)] border border-[rgba(50,255,36,0.5)]"
    }
]

export default function CreatorDashboard() {
    return (
        <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
            <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto">
                <div className="max-w-7xl mx-auto p-6 space-y-10">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className='flex items-center gap-4'>
                            <BackButton2 />
                            <h1 className="text-3xl tracking-tight font-semibold text-transparent bg-clip-text bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)]">Creator Dashboard</h1>
                        </div>
                        <Link href="/company/create">
                            <Button size={"lg"} className="bg-[linear-gradient(93.21deg,rgba(62,84,251,0.9)_-31.21%,rgba(195,206,255,0.9)_174.4%)] hover:opacity-80  text-white flex items-center gap-2 rounded-lg px-6">
                                <PlusCircle className="h-14 w-14 translate-y-px" /> 
                                <span className="text-xl font-medium">New Interview</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                        {/* Total Interviews */}
                        <Card className="bg-[rgba(104,100,247,0.1)] border border-[rgba(104,100,247,0.5)]">
                            <CardContent className="pt-6 ">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/company/dashboard/note.svg" alt="note" width={48} height={48} className="h-12 w-12 group-hover:-rotate-10 transition-all duration-400" />
                                    <div>
                                        <p className="font-medium text-[rgba(10,13,26,0.46)] mb-2 transition-all duration-400 group-hover:-translate-y-1.5 whitespace-nowrap">Total Interviews</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">12</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Candidates  */}
                        <Card className="bg-[rgba(253,96,80,0.1)] border border-[rgba(253,96,80,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/company/dashboard/people.svg" alt="people" width={48} height={48} className="h-12 w-12 group-hover:-rotate-10 transition-all duration-400" />

                                    <div>
                                        <p className="font-medium text-[rgba(10,13,26,0.46)] mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Candidates</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">46</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Avg Duration */}
                        <Card className="bg-[rgba(51,204,204,0.1)] border border-[rgba(51,204,204,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/company/dashboard/time.svg" alt="time" width={48} height={48} className="h-12 w-12 group-hover:-rotate-10 transition-all duration-400" />

                                    <div>
                                        <p className="font-medium text-[rgba(10,13,26,0.46)] mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Avg Duration</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">40m</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active  */}
                        <Card className="bg-[rgba(113,184,108,0.1)] border border-[rgba(113,184,108,0.5)]">
                            <CardContent className="pt-6">
                                <div className="group flex items-center justify-center gap-5">
                                    <Image src="/company/dashboard/wheel.svg" alt="settings" width={48} height={48} className="h-12 w-12 group-hover:-rotate-10 transition-all duration-400" />

                                    <div>
                                        <p className="font-medium text-[rgba(10,13,26,0.46)] mb-2 transition-all duration-400 group-hover:-translate-y-1.5">Active</p>
                                        <p className="text-center text-2xl font-bold text-[rgba(104,100,247,1)] transition-all duration-400 group-hover:scale-[1.3]">2</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Your Interviews Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-[rgba(10,13,26,0.7)]">Your Interviews</h2>

                        <div className="space-y-4">
                            {interviews.map((interview) => (
                                <Card key={interview.id} className="hover:border-[rgba(106,125,252,1)] transition-hover duration-200 ease-in-out border-[rgba(106,125,252,0.3)">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-gray-800">{interview.title}</h3>
                                                <Badge className={`${interview.statusColor} border-0 px-3 py-1 font-medium capitalize`}>
                                                    {interview.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Image src="/company/dashboard/note2.svg" alt='note' width={16} height={16} className="h-4 w-4" />
                                                    <span>{interview.sections} Sections</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Image src="/company/dashboard/people2.svg" alt='people' width={16} height={16} className="h-4 w-4" />
                                                    <span>{interview.candidates} Candidates</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Image src="/company/dashboard/time2.svg" alt='time' width={16} height={16} className="h-4 w-4" />
                                                    <span>{interview.duration}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button variant="outline" className="bg-[rgba(255,144,85,0.2)] hover:bg-[rgba(255,144,85,0.7)]  rounded-full border border-[rgba(255,241,234,0.1)]  text-[rgba(10,13,26,0.7)] gap-2">
                                            <Image src="/company/dashboard/pencil.svg" alt='pencil' width={16} height={16} className="h-4 w-4" /> 
                                            <span className="text-[rgba(10,13,26,0.7)] font-bold text-sm">Edit</span>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

import Image from 'next/image'
import React from 'react'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { ArrowLeft } from 'lucide-react'

interface LeftSectionProps {
    activeSection: 'upload' | 'interview'
    setActiveSection: (section: 'upload' | 'interview') => void
}

export default function LeftSection({ activeSection, setActiveSection }: LeftSectionProps) {
    return (
        <div className='bg-white flex-1 '>
            <div className="flex items-center justify-between px-6 py-4 ">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="lg" className="flex text-[rgba(104,100,247,1)] hover:text-[rgba(142, 158, 254, 0.6)] items-center gap-2">
                        <ArrowLeft className="w-4 h-4 " />
                        <span className="font-semibold">Back to Job Listing</span>
                    </Button>
                </div>
                
            </div>
            <div className="flex">
                <div className="w-full p-6 space-y-8">
                    <h1 className="text-lg font-semibold">Mindtrix Senior Software Engineer interview</h1>

                    {/* Progress Bar */}
                    <div className="w-full">
                        <Progress value={50} className="h-2 [&>div]:bg-[rgba(98,117,252,0.9)]" />
                    </div>

                    <div className="space-y-6">
                        {/* Upload Resume Step */}
                        <div 
                            className="flex items-center justify-between w-full p-4 rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-[rgba(98,117,252,0.6)]"
                            onClick={() => setActiveSection('upload')}>
                            <div className="flex items-center gap-3">
                                <Image src="/interview/file.svg" alt="Upload Icon" width={16} height={16} />
                                <div>
                                    <h3 className="font-medium text-muted-foreground">Upload Resume</h3>
                                </div>
                            </div>
                            {activeSection==='upload'?    <div className="bg-[rgba(98,117,252,0.9)] p-1 rounded-full">
                                <Image src="/interview/tick.svg" alt="check" width={16} height={16} />
                            </div>:<div className="border border-[rgba(98,117,252,0.9)] p-3 rounded-full"/>
                                }
                        </div>

                        {/* Domain Expert Interview Step */}
                        <div 
                            className="flex items-center justify-between w-full p-4 rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-[rgba(98,117,252,0.6)]"
                            onClick={() => setActiveSection('interview')}
                        >
                            <div className="flex items-center gap-3">
                                <Image src="/interview/monitor.svg" alt="monitor" width={16} height={16} />
                                <div>
                                    <h3 className="font-medium text-muted-foreground">Domain Expert Interview</h3>
                                </div>
                            </div>
                           {activeSection==='interview'?    <div className="bg-[rgba(98,117,252,0.9)] p-1 rounded-full">
                                <Image src="/interview/tick.svg" alt="check" width={16} height={16} />
                            </div>:<div className="border border-[rgba(98,117,252,0.9)] p-3 rounded-full"/>
                                }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

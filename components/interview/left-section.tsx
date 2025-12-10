import Image from 'next/image'
import React from 'react'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { ArrowLeft } from 'lucide-react'

export default function LeftSection() {
    return (
        <div className=''>
            <div className="flex items-center justify-between px-6 py-4 ">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="lg" className="flex text-[rgba(104,100,247,1)] border-[rgba(142, 158, 254, 0.6)] items-center gap-2">
                        <ArrowLeft className="w-4 h-4 " />
                        Back to Job Listing
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
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <Image src="/interview/file.svg" alt="Upload Icon" width={16} height={16} />
                                <div>
                                    <h3 className="font-medium">Upload Resume</h3>
                                </div>

                            </div>
                            <div className="bg-[rgba(98,117,252,0.9)] p-1 rounded-full">
                                <Image src="/interview/tick.svg" alt="check" width={16} height={16} />
                            </div>
                        </div>

                        {/* Domain Expert Interview Step */}
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <Image src="/interview/monitor.svg" alt="monitor" width={16} height={16} />
                                <div>
                                    <h3 className="font-medium">Domain Expert Interview</h3>
                                </div>

                            </div>
                            <div className="border border-[rgba(98,117,252,0.9)] p-3 rounded-full">
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main Content */}
            </div>
        </div>
    )
}

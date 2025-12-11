"use client"

import React, { useRef } from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { motion } from "motion/react"

const beforeYouBeginItems = [
    {
        iconPath: "/interview/timer.svg",
        text: "Expect to spend 30 minutes in this interview."
    },
    {
        iconPath: "/interview/loop.svg",
        text: "Hiring team-approved single retake per interview"
    },
    {
        iconPath: "/interview/lock.svg",
        text: "Your data is in your control"
    },
    {
        iconPath: "/interview/wave.svg",
        text: "Find a quiet place with good lighting"
    },
    {
        iconPath: "/interview/wifi.svg",
        text: "Ensure stable internet connection"
    },
    {
        iconPath: "/interview/record.svg",
        text: "The interview will be recorded for evaluation"
    }
]

export default function UploadSection() {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='flex-2 px-24 '
        >
            {/* <RightSection /> */}
            <div>
                <div className="flex items-center gap-3 md:justify-end justify-start px-6 py-4">
                    <Button variant="outline" size="lg" className="bg-transparent rounded-3xl text-[rgba(104,100,247,1)] font-semibold border-[rgba(142,158,254,0.6)] px-15" >FAQ</Button>
                    <Button variant="outline" size="lg" className="bg-transparent rounded-3xl text-[rgba(104,100,247,1)] font-semibold border-[rgba(142,158,254,0.6)] " >Contact Support</Button>
                </div>

                <div className="flex items-center px-6 py-4 justify-between mb-6">
                    <div>
                        <div className="relative">
                            <h2 className="text-3xl font-semibold bg-linear-to-r from-[rgba(0,13,144,0.9)] to-[rgba(93,107,238,1)] bg-clip-text text-transparent mb-1">Upload Resume</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">Please upload your resume to initiate your application and help us assess your fit.</p>
                    </div>
                </div>
                {/* Main Content Area */}
                <div className="w-full px-6">
                    <div className="w-full max-w-4xl mx-auto">

                        {/* Upload Area */}
                        <div className="w-full bg-white rounded-lg border p-8 flex flex-col items-center justify-center min-h-[400px]">
                            <Button 
                                onClick={handleButtonClick}
                                className="bg-[rgba(104,100,247,1)] hover:bg-[rgba(98,117,252,1)] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <Image src="/interview/fileplus.svg" alt="upload" width={20} height={20} />
                                Choose Files
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

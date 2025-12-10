import React from 'react'
import { Button } from '../ui/button'
import { ChevronDown, Mic, Video, Volume2 } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '../ui/badge'
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

export default function InterviewSection() {
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
                    <Button variant="outline" size="lg" className=" hover:bg-transparent rounded-3xl text-[rgba(104,100,247,1)] font-semibold border-[rgba(142,158,254,0.6)] px-15" >FAQ</Button>
                    <Button variant="outline" size="lg" className="hover:text-bg-transparent rounded-3xl text-[rgba(104,100,247,1)] font-semibold border-[rgba(142,158,254,0.6)] " >Contact Support</Button>
                </div>

                <div className="flex items-center px-6 py-4 justify-between mb-6">
                    <div>
                        <div className="relative">
                            <h2 className="text-2xl font-semibold bg-linear-to-r from-[rgba(0,13,144,0.9)] to-[rgba(93,107,238,1)] bg-clip-text text-transparent mb-1">Domain Expert Interview</h2>
                            <Badge className="absolute font-semibold text-muted-foreground -right-16 top-0 bg-[rgba(85,98,228,0.1)]" variant="secondary">30 min</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">AI-powered domain evaluation</p>
                    </div>
                </div>
                {/* Main Content Area */}
                <div className="w-full px-6">
                    <div className="w-full max-w-4xl mx-auto">


                        {/* Video Area */}
                        <div className=" w-full">
                            <Image
                                src="/interview/person.png"
                                alt="Interview Placeholder"
                                width={2000}
                                height={2000}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Controls */}
                        <div className="grid grid-cols-3  gap-4 mb-6 mt-5">
                            <div className="space-y-2">
                                <Button variant={"outline"}>
                                    <Mic className="w-4 h-4" />
                                    <span className="text-sm">Microphone</span>
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                                <p className="text-xs text-green-600">Test your mic</p>
                            </div>

                            <div className="space-y-2 ">
                                <Button variant={"outline"}>
                                    <Volume2 className="w-4 h-4" />
                                    <span className="text-sm">Speakers</span>
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                                <p className="text-xs text-green-600">Play test sound</p>
                            </div>

                            <div className="space-y-2">
                                <Button variant={"outline"}>
                                    <Video className="w-4 h-4" />
                                    <span className="text-sm">Camera</span>
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                                <p className="text-xs text-green-600">Restart camera</p>
                            </div>
                        </div>

                        {/* Keep Scrolling Button */}
                        <div className="mb-8">
                            <Button className="bg-[rgba(104,100,247,1)] hover:bg-[rgba(98,117,252,1)] text-white px-8 py-3 rounded-lg font-semibold">
                                Keep Scrolling
                            </Button>
                        </div>


                        {/* Before you begin section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-6">Before you begin</h3>
                            <div className="space-y-4">
                                {beforeYouBeginItems.map((item) => (
                                    <div key={item.text} className="flex items-center gap-3">
                                        <div className="w-7 h-7  flex items-center justify-center shrink-0">
                                            <Image
                                                src={item.iconPath}
                                                alt=""
                                                width={12}
                                                height={12}
                                                className="w-3 h-3"
                                            />
                                        </div>
                                        <p className="text-sm  font-medium ">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Start Now Button */}
                        <div className="text-center mb-4">
                            <Button className="w-full hover:bg-transparent border-2 border-[rgba(104,100,247,1)] hover:text-[rgba(104,100,247,1)] bg-[rgba(104,100,247,1)]  text-white py-3 rounded-lg font-semibold text-lg">
                                Start Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

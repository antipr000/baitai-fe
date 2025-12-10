import React from 'react'
import { Button } from '../ui/button'
import { ChevronDown, Mic, Video, Volume2 } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '../ui/badge'

export default function RightSection() {
    return (
        <div className=''>
            {/* <RightSection /> */}
            <div>

                <div className="flex items-center gap-3 justify-end px-6 py-4">
                    <Button variant="outline" size="lg" className="rounded-3xl text-[rgba(104,100,247,1)] hover:text-[rgba(104,100,247,1)]! border-[rgba(142,158,254,0.6)]" >FAQ</Button>
                    <Button variant="outline" size="lg" className="rounded-3xl text-[rgba(104,100,247,1)] hover:text-[rgba(104,100,247,1)]! border-[rgba(142,158,254,0.6)]" >Contact Support</Button>
                </div>

                <div className="flex items-center px-6 py-4 justify-between mb-6">
                    <div>
                        <div className="relative">
                            <h2 className="text-2xl font-semibold bg-linear-to-r from-[rgba(0,13,144,0.9)] to-[rgba(93,107,238,1)] bg-clip-text text-transparent mb-1">Domain Expert Interview</h2>
                            <Badge className="absolute -right-15 -top-4" variant="secondary">30 min</Badge>
                        </div>
                        <p className="text-gray-600">AI-powered domain evaluation</p>
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
                        <div className="grid grid-cols-3 gap-4 mb-6 mt-5">
                            <div className="space-y-2 text-center">
                                <Button variant={"outline"}>
                                    <Mic className="w-4 h-4" />
                                    <span className="text-sm">Microphone</span>
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                                <p className="text-xs text-green-600">Test your mic</p>
                            </div>

                            <div className="space-y-2 text-center">
                                <Button variant={"outline"}>
                                    <Volume2 className="w-4 h-4" />
                                    <span className="text-sm">Speakers</span>
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                                <p className="text-xs text-green-600">Play test sound</p>
                            </div>

                            <div className="space-y-2 text-center">
                                <Button variant={"outline"}>
                                    <Video className="w-4 h-4" />
                                    <span className="text-sm">Camera</span>
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                                <p className="text-xs text-green-600">Restart camera</p>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    )
}

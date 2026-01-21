"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Clock, GripVertical, Minus, Plus, LayoutGrid } from 'lucide-react'
import Image from 'next/image'

export const ConclusionSection = () => {
    return (
        <Card className="border border-[rgba(158,169,253,0.2)]">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/company/create/section.svg" alt="section" width={24} height={24} />
                        <span className="text-lg font-medium text-[rgba(84,104,252,0.7)]">Conclusion</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[rgba(10,13,26,0.82)]">No of Questions</span>
                            <div className="flex items-center gap-1 bg-white dark:bg-background rounded-md border border-gray-200 p-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm">
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-4 text-center text-sm font-medium">1</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm">
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[rgba(10,13,26,0.82)]">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">5 min</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Assessment Format */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                        Assessment Format
                    </label>
                    <Select >
                        <SelectTrigger className="bg-white border-[rgba(55,58,70,0.05)]">
                            <SelectValue placeholder="-Choose Format-" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Text only</SelectItem>
                            <SelectItem value="voice">Voice only</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* AI Guidelines */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                        AI Guidelines
                    </label>
                    <Textarea
                        placeholder="Provide guidelines to the AI Interviewer for this section"
                        className="min-h-[150px] bg-white border-gray-200 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Guide the AI on what questions to ask, topics to cover, and evaluation criteria.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Clock } from 'lucide-react'
import Image from 'next/image'
import { useInterviewStore, type Section, type ArtifactType } from '@/stores/interview-store'

export const IntroductionSection = () => {
    const { sections, updateSection } = useInterviewStore()
    const sectionIndex = sections.findIndex(s => s.sectionType === 'intro')
    const section = sections[sectionIndex]

    if (!section) return null

    return (
        <Card className=" border border-[rgba(100,119,252,0.2)]">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/company/create/section.svg" alt="section" width={20} height={20} className="h-5 w-5 text-muted-foreground/50" />
                        <span className="text-lg font-medium text-[rgba(100,119,252,0.7)]">Introduction</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[rgba(34,37,49,0.9)]">No of Questions</span>
                            <div className="flex items-center gap-1  rounded-md border border-[rgba(222,244,251,0.1)] bg-[rgba(150,162,253,0.2)]">
                                <span className="w-8 text-center text-sm font-medium">{section.maxQuestions}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ">
                            <Clock className="h-4 w-4 text-[rgba(84,104,252,0.6)]" />
                            <span className="text-sm font-medium text-[rgba(34,37,49,0.9)]">{section.duration} min</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Artifact Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                        Assessment Format
                    </label>
                    <Select
                        value={section.artifactType || 'none'}
                        onValueChange={(val: ArtifactType) => updateSection(sectionIndex, { artifactType: val })}
                    >
                        <SelectTrigger className="bg-white border-[rgba(55,58,70,0.05)]">
                            <SelectValue placeholder="-Choose Format-" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="diagram">Diagram</SelectItem>
                            <SelectItem value="code">Code</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* AI Guidelines */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                        AI Guidelines <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                        value={section.aiInstructions}
                        onChange={(e) => updateSection(sectionIndex, { aiInstructions: e.target.value })}
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

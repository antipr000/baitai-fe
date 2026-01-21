"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, GripVertical, Minus, Plus, FileText, PlusCircle } from 'lucide-react'
import Image from 'next/image'

export const SectionList = () => {
    return (
        <div className="space-y-4">
            {/* Section 1 */}
            <Card className="border border-[rgba(100,119,252,0.2)]">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image src="/company/create/section.svg" alt="section" width={20} height={20} />
                            <span className="text-lg font-medium text-[rgba(84,104,252,0.7)]">Section 1</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <span className="text-sm font-medium text-[rgba(10,13,26,0.82)]">No of Questions</span>
                            <div className="flex items-center gap-1 rounded-md border border-[rgba(222,244,251,0.1)] bg-[rgba(150,162,253,0.2)]">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm">
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-4 text-center text-sm font-medium">1</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm">
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4 text-[rgba(84,104,252,0.6)]" />
                                <span className="text-sm font-medium text-[rgba(34,37,49,0.9)]">30 min</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Section Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Section Title</label>
                        <Input placeholder="e.g., Technical Skills Assessment" className="bg-indigo-50/20 border-gray-200" />
                    </div>

                    {/* Assessment Format */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Assessment Format</label>
                        <Select>
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
                        <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">AI Guidelines</label>
                        <Textarea
                            placeholder="Provide guidelines to the AI Interviewer for this section"
                            className="min-h-[100px] bg-indigo-50/20 border-gray-200 resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Guide the AI on what questions to ask, topics to cover, and evaluation criteria.</p>
                    </div>

                    {/* Evaluation Criteria */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Evaluation Criteria</label>
                        <Input placeholder="Introduction" className="bg-indigo-50/20 border-gray-200" />
                    </div>

                    {/* Weight & Scoring Scale */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Weight</label>
                            <Input placeholder="Introduction" className="bg-indigo-50/20 border-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Scoring Scale</label>
                            <Input placeholder="Introduction" className="bg-indigo-50/20 border-gray-200" />
                        </div>
                    </div>

                    {/* Question 1 Block */}
                    <div className="pl-10   space-y-6 mt-8">
                        <div className="flex items-center gap-2">
                            <Image src="/company/create/page.svg" alt="page" width={20} height={20} className="h-5 w-5 " />
                            <span className="text-base font-semibold text-[rgba(34,37,49,1)]">Question 1</span>
                        </div>

                        {/* Difficulty Level */}
                        <div className="pl-4 space-y-4">
                                <Label>Difficulty Level</Label>
                                <RadioGroup defaultValue="easy" className="flex items-center gap-6">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="easy" id="easy" />
                                        <Label htmlFor="easy" className="font-normal cursor-pointer">Easy</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="medium" id="medium" />
                                        <Label htmlFor="medium" className="font-normal cursor-pointer">Medium</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="difficult" id="difficult" />
                                        <Label htmlFor="difficult" className="font-normal cursor-pointer">Difficult</Label>
                                    </div>
                                </RadioGroup>

                        {/* Nested AI Guidelines */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">AI Guidelines</label>
                            <Textarea
                                placeholder="Provide guidelines to the AI Interviewer for this section"
                                className="min-h-[100px] bg-indigo-50/20 border-gray-200 resize-none"
                            />
                        </div>

                        {/* Context Hints */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Context Hints</label>
                            <Input placeholder="Introduction" className="bg-indigo-50/20 border-gray-200" />
                        </div>
                        </div>

                        {/* Follow-up Questions */}
                        <div className=" p-4 ml-8 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-[rgba(150,162,253,0.9)]">Follow-up Questions</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[rgba(34,37,49,0.7)]">No of follow-up Questions</span>
                                    <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 p-0.5">
                                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm"><Minus className="h-3 w-3" /></Button>
                                        <span className="w-3 text-center text-xs font-medium">0</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm"><Plus className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <Input placeholder="Mention Questions to be asked" className="bg-indigo-50/20 border-gray-200" />

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-[rgba(10,13,26,0.82)] block">Trigger Condition</label>
                                    <Input placeholder="Introduction" className="bg-indigo-50/20 border-gray-200" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-[rgba(10,13,26,0.82)] block">AI Guidelines</label>
                                    <Textarea
                                        placeholder="Provide guidelines to the AI Interviewer for this section"
                                        className="min-h-[100px] bg-indigo-50/20 border-gray-200 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Section Button */}
            <div className="flex justify-end">
                <Button variant="outline" className="text-primary border-[rgba(84,104,252,0.5)] gap-2">
                    <PlusCircle className="h-4 w-4 text-[rgba(84,104,252,1)]" />
                    <span className="text-[rgba(84,104,252,0.7)]">Add Section</span>
                </Button>
            </div>
        </div>
    )
}

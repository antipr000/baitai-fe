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
import { Clock, GripVertical, Minus, Plus } from 'lucide-react'

export const IntroductionSection = () => {
    return (
        <Card className="border-0 shadow-sm bg-blue-50/30">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                        <span className="text-lg font-medium text-primary">Introduction</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">No of Questions</span>
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

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">5 min</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Assessment Format */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground block">
                        Assessment Format
                    </label>
                    <Select>
                        <SelectTrigger className="bg-white dark:bg-background/50 border-gray-200">
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
                    <label className="text-sm font-medium text-muted-foreground block">
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

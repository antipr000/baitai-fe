"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export const InterviewDetails = () => {
    return (
        <Card className=" bg-[rgba(0,215,255,0.02)] border border-[rgba(84,104,252,0.1)]">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-[rgba(84,104,252,0.73)]">Interview Details</CardTitle>

                    {/* Toggles */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[rgba(10,13,26,0.82)]">Visibility</span>
                            <Switch />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[rgba(10,13,26,0.82)]">Screenshare</span>
                            <Switch />
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Interview Title */}
                <div className="space-y-2 ">
                    <label htmlFor="title" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                        Interview Title
                    </label>
                    <Input
                        id="title"
                        placeholder="E.g., Senior Software Engineer Interview"
                        className="bg-white dark:bg-background/50 border-gray-200"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                        Description
                    </label>
                    <Textarea
                        id="description"
                        placeholder="Provide an overview of the interview"
                        className="min-h-[150px] bg-white dark:bg-background/50 border-gray-200 resize-none"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

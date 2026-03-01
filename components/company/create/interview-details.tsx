"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useInterviewStore } from '@/stores/interview-store'

export const InterviewDetails = () => {
    const {
        title, description, role, duration, isPublic, credits, screenShare,
        setTitle, setDescription, setRole, setDuration, setIsPublic, setCredits, setScreenShare
    } = useInterviewStore()

    return (
        <Card className=" bg-[rgba(0,215,255,0.02)] border border-[rgba(84,104,252,0.1)]">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-[rgba(84,104,252,0.73)]">Interview Details</CardTitle>

                    {/* Toggles */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[rgba(10,13,26,0.82)]">Public</span>
                            <Switch
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                                className="data-[state=checked]:bg-[rgba(84,104,252,1)]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[rgba(10,13,26,0.82)]">Screenshare</span>
                            <Switch
                                checked={screenShare}
                                onCheckedChange={setScreenShare}
                                className="data-[state=checked]:bg-[rgba(84,104,252,1)]"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Interview Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                            Interview Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="E.g., Senior Software Engineer Interview"
                            className="bg-white dark:bg-background/50 border-gray-200"
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                            Role / Job Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="E.g., Backend Developer"
                            className="bg-white dark:bg-background/50 border-gray-200"
                        />
                    </div>
                </div>

                {/* Duration & Credits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="duration" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                            Total Duration (minutes) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="bg-white dark:bg-background/50 border-gray-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="credits" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                            Credits Cost
                        </label>
                        <Input
                            id="credits"
                            type="number"
                            value={credits}
                            onChange={(e) => {
                                const val = Number(e.target.value)
                                if (val >= 0) setCredits(val)
                            }}
                            className="bg-white dark:bg-background/50 border-gray-200"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                        Description
                    </label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide an overview of the interview"
                        className="min-h-[150px] bg-white dark:bg-background/50 border-gray-200 resize-none"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

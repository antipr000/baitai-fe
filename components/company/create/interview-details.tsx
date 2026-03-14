"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useInterviewStore } from '@/stores/interview-store'
import api from '@/lib/api/client'

export const InterviewDetails = ({ companyId, authToken, roles, mode = 'create' }: { 
    companyId?: string; 
    authToken?: string; 
    roles: string[];
    mode?: 'create' | 'edit'
}) => {
    const {
        title, description, role, duration, difficultyLevel, isPublic, credits, screenShare,
        setTitle, setDescription, setRole, setDuration, setDifficultyLevel, setIsPublic, setCredits, setScreenShare
    } = useInterviewStore()

    const isAllowedCustomization = companyId === process.env.NEXT_PUBLIC_BAIT_COMPANY;
    const showCredits = isAllowedCustomization && mode === 'edit';

    return (
        <Card className=" bg-[rgba(0,215,255,0.02)] border border-[rgba(84,104,252,0.1)]">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-[rgba(58,63,187,1)]">Interview Details</CardTitle>

                    {/* Toggles */}
                    <div className="flex items-center gap-6">
                        {isAllowedCustomization && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[rgba(10,13,26,0.82)]">Public</span>
                                <div>
                                    <Switch
                                        checked={isPublic}
                                        onCheckedChange={setIsPublic}
                                        className="data-[state=checked]:bg-[rgba(58,63,187,1)]"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[rgba(10,13,26,0.82)]">Screenshare</span>
                            <Switch
                                checked={screenShare}
                                onCheckedChange={setScreenShare}
                                className="data-[state=checked]:bg-[rgba(58,63,187,1)]"
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
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="role" className="bg-white dark:bg-background/50 border-gray-200 w-full h-10">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.length > 0 && !roles.includes(role) && role && (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                )}
                                {roles.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Duration & Credits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="duration" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                            Total Duration (minutes) <span className="text-red-500">*</span>
                        </label>
                        <div className={!isAllowedCustomization && mode === 'edit' ? 'cursor-not-allowed' : ''}>
                        <Input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            readOnly={!isAllowedCustomization && mode === 'edit'}
                            disabled={!isAllowedCustomization && mode === 'edit'}
                            className="bg-white dark:bg-background/50 border-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="difficulty" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                            Overall Difficulty <span className="text-red-500">*</span>
                        </label>
                        <Select value={difficultyLevel} onValueChange={(v) => setDifficultyLevel(v as any)}>
                            <SelectTrigger id="difficulty" className="bg-white dark:bg-background/50 border-gray-200 w-full h-10">
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {showCredits && (
                        <div className="space-y-2">
                            <label htmlFor="credits" className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">
                                Credits Cost
                            </label>
                            <div>
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
                    )}
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

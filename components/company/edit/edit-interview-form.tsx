"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { toast } from 'sonner'
import api from '@/lib/api/client'

// Section types from API response
interface FollowupRule {
    id: string
    created_at: string
    updated_at: string
    trigger_condition: string
    ai_instructions: string
    order: number
    max_depth: number
}

interface Question {
    id: string
    created_at: string
    updated_at: string
    difficulty_level: string
    ai_instructions: string
    context_hints: string | null
    order: number
    followup_rules: FollowupRule[]
}

interface Section {
    id: string
    created_at: string
    updated_at: string
    name: string
    order: number
    duration: number
    section_type: string
    ai_instructions: string
    min_questions: number
    max_questions: number
    artifact_type: string
    questions: Question[]
}

// Full interview template data from API
export interface InterviewTemplateData {
    id: string
    created_at: string
    updated_at: string
    title: string
    company_id: string
    status: 'active' | 'archived' | 'draft'
    is_public: boolean
    duration: number
    role: string
    credits: number
    difficulty_level: string
    llm_config: Record<string, unknown>
    screen_share: boolean
    sections: Section[]
}

// Editable fields that can be sent via PATCH (matching InterviewTemplateUpdate)
interface InterviewTemplateUpdate {
    title?: string
    status?: 'active' | 'archived' | 'draft'
    is_public?: boolean
    duration?: number
    llm_config?: Record<string, unknown>
    role?: string
    screen_share?: boolean
    credits?: number
}

interface EditInterviewFormProps {
    templateId: string
    templateData: InterviewTemplateData
    authToken?: string
}

export function EditInterviewForm({ templateId, templateData, authToken }: EditInterviewFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Editable fields state - initialized from template data (matching create form fields)
    const [title, setTitle] = useState(templateData.title || '')
    const [role, setRole] = useState(templateData.role || '')
    const [duration, setDuration] = useState(templateData.duration || 30)
    const [isPublic, setIsPublic] = useState(templateData.is_public || false)
    const [screenShare, setScreenShare] = useState(templateData.screen_share || false)
    const [credits, setCredits] = useState(templateData.credits || 0)

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Please enter an interview title')
            return
        }
        if (!role.trim()) {
            toast.error('Please enter a role/job title')
            return
        }

        setIsSubmitting(true)

        try {
            // Only send editable fields that have changed
            const payload: InterviewTemplateUpdate = {}

            if (title !== templateData.title) payload.title = title
            if (role !== templateData.role) payload.role = role
            if (duration !== templateData.duration) payload.duration = duration
            if (isPublic !== templateData.is_public) payload.is_public = isPublic
            if (screenShare !== templateData.screen_share) payload.screen_share = screenShare
            if (credits !== templateData.credits) payload.credits = credits

            // Only make request if there are changes
            if (Object.keys(payload).length === 0) {
                toast.info('No changes to save')
                setIsSubmitting(false)
                return
            }

            console.log('Updating Interview Template:', JSON.stringify(payload, null, 2))

            const response = await api.patch(
                `/api/v1/company/interviews/${templateId}/`,
                payload,
                {
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
                }
            )

            if (response.data) {
                toast.success('Interview updated successfully!')
                router.push('/company/interviews')
            }
        } catch (error: any) {
            console.error('Error updating interview:', error)
            const message = error.response?.data?.detail || error.response?.data?.message || 'Failed to update interview'
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='w-full min-h-screen bg-[rgba(248,250,255,1)]'>
            <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto">
                <div className="container mx-auto max-w-6xl py-8 space-y-8 pb-20">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <BackButton />
                            <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(91.24deg,#3E54FB_35.23%,#C3CEFF_202.55%)]">
                                Edit Interview
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                size={"lg"}
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                                className="rounded-full px-6 bg-clip-text font-semibold text-transparent bg-[linear-gradient(91.24deg,#3E54FB_35.23%,#C3CEFF_202.55%)] hover:text-transparent hover:opacity-80 border border-[#7082FD]"
                            >
                                Cancel
                            </Button>
                            <Button
                                size={"lg"}
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="rounded-full px-6 bg-[rgba(84,104,252,1)] font-semibold hover:bg-[rgba(84,104,252,1)] opacity-80 text-white shadow-md"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    {/* Interview Details - Same as Create Form */}
                    <div className='max-w-5xl mx-auto'>
                        <Card className="bg-[rgba(0,215,255,0.02)] border border-[rgba(84,104,252,0.1)]">
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
                                            onChange={(e) => setCredits(Number(e.target.value))}
                                            className="bg-white dark:bg-background/50 border-gray-200"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                </div>
            </div>
        </div>
    )
}

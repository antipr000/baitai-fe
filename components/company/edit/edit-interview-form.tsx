"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { toast } from 'sonner'
import api from '@/lib/api/client'
import { useInterviewStore, buildEditPayload } from '@/stores/interview-store'
import { validateInterviewEditPayload, formatZodErrors } from '@/lib/validations/interview'
import { InterviewDetails } from '@/components/company/create/interview-details'
import { IntroductionSection } from '@/components/company/create/introduction-section'
import { SectionList } from '@/components/company/create/section-list'
import { ConclusionSection } from '@/components/company/create/conclusion-section'

// Full interview template data from API
export interface InterviewTemplateData {
    id: string
    created_at: string
    updated_at: string
    title: string
    company_id: string
    description?: string | null
    status: 'active' | 'archived' | 'draft'
    is_public: boolean
    duration: number
    role: string
    credits: number
    difficulty_level: string
    llm_config: Record<string, unknown>
    screen_share: boolean
    sections: any[]
}

interface EditInterviewFormProps {
    templateId: string
    templateData: InterviewTemplateData
    authToken?: string
}

export function EditInterviewForm({ templateId, templateData, authToken }: EditInterviewFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const store = useInterviewStore()

    // Initialize store from template data on mount
    useEffect(() => {
        store.initializeFromTemplate(templateData)
        return () => {
            store.resetStore()
        }
    }, []) 

    const handleSave = async () => {
        if (!store.title.trim()) {
            toast.error('Please enter an interview title')
            return
        }
        if (!store.role.trim()) {
            toast.error('Please enter a role/job title')
            return
        }

        setIsSubmitting(true)

        try {
            const payload = buildEditPayload(store)

            // Zod validation
            const validation = validateInterviewEditPayload(payload)
            if (!validation.success) {
                const errorMessages = formatZodErrors(validation.errors)
                errorMessages.slice(0, 5).forEach((msg, i) => {
                    setTimeout(() => toast.error(msg), i * 100)
                })
                if (errorMessages.length > 5) {
                    setTimeout(() => toast.error(`...and ${errorMessages.length - 5} more errors`), 500)
                }
                setIsSubmitting(false)
                return
            }

            console.log('Updating Interview Payload:', JSON.stringify(validation.data, null, 2))

            const response = await api.put(
                `/api/v1/company/interviews/${templateId}/`,
                validation.data,
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.back()}
                                className={`cursor-pointer`}
                            >
                                <Image src="/company/left-arrow.svg" alt="Back" width={26} height={26} />
                            </button>
                            <h1 className="text-2xl font-semibold text-[rgba(58,63,187,1)]">
                                Edit Interview
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                size={"lg"}
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                                className="rounded-full px-8 hover:text-[rgba(58,63,187,1)] hover:bg-white font-semibold text-[rgba(58,63,187,1)] hover:opacity-90 border border-[rgba(58,63,187,1)]"
                            >
                                Cancel
                            </Button>
                            <Button
                                size={"lg"}
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="rounded-full hover:bg-[rgba(58,63,187,1)] px-10 bg-[rgba(58,63,187,1)] font-semibold hover:opacity-90 text-white shadow-md"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    {/* Interview Details - Same components as Create */}
                    <div className='max-w-5xl mx-auto'>
                        <InterviewDetails />
                    </div>

                    {/* Interview Sections */}
                    <div className="space-y-4 max-w-5xl mx-auto">
                        <h2 className="text-xl font-semibold text-[rgba(58,63,187,1)]">Interview Sections</h2>

                        <IntroductionSection />

                        <SectionList />

                        <ConclusionSection />
                    </div>
                </div>
            </div>
        </div>
    )
}

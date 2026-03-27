"use client"

import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { useInterviewStore, buildInterviewPayload } from '@/stores/interview-store'
import { validateInterviewPayload, formatZodErrors } from '@/lib/validations/interview'
import api from '@/lib/api/client'
import { toast } from 'sonner'
import { useState } from 'react'
import Image from 'next/image'

interface HeaderProps {
    authToken?: string
    companyId?: string
}

export const Header = ({ authToken, companyId }: HeaderProps) => {
    const store = useInterviewStore()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSave = async (isDraft: boolean = false) => {
        // Basic validation first
        if (!store.title.trim()) {
            toast.error('Please enter an interview title')
            return
        }
        if (!store.role.trim()) {
            toast.error('Please enter a role/job title')
            return
        }
        if (!companyId) {
            toast.error('Company ID is missing')
            return
        }

        setIsSubmitting(true)

        try {
            // Build payload with company_id
            const stateWithCompany = { ...store, companyId }
            const payload = buildInterviewPayload(stateWithCompany as any)

            // Zod validation
            const validation = validateInterviewPayload(payload)

            if (!validation.success) {
                const errorMessages = formatZodErrors(validation.errors)
                // Show all errors as toasts
                errorMessages.slice(0, 5).forEach((msg, i) => {
                    setTimeout(() => toast.error(msg), i * 100)
                })
                if (errorMessages.length > 5) {
                    setTimeout(() => toast.error(`...and ${errorMessages.length - 5} more errors`), 500)
                }
                console.error('Validation errors:', errorMessages)
                setIsSubmitting(false)
                return
            }

            console.log('Submitting Interview Payload:', JSON.stringify(validation.data, null, 2))

            // Use server-passed auth token if available
            const response = await api.post('/api/v1/company/interviews/', validation.data, {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
            })

            if (response.data?.id) {
                toast.success(isDraft ? 'Draft saved successfully!' : 'Interview published successfully!')
                store.resetStore()
                router.push('/company/interviews')
            }
        } catch (error: any) {
            console.error('Error creating interview:', error)
            const message = error.response?.data?.detail || error.response?.data?.message || 'Failed to create interview'
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.back()}
                    className={`cursor-pointer`}
                >
                    <Image src="/company/left-arrow.svg" alt="Back" width={26} height={26} />
                </button>                
            <h1 className="text-2xl font-semibold text-[rgba(58,63,187,1)]">New Interview</h1>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    size={"lg"}
                    variant="outline"
                    onClick={() => handleSave(true)}
                    disabled={isSubmitting}
                    className="rounded-full px-8 hover:text-[rgba(58,63,187,1)] hover:bg-white font-semibold text-[rgba(58,63,187,1)]  hover:opacity-90 border border-[rgba(58,63,187,1)]"
                >
                    {isSubmitting ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                    size={"lg"}
                    onClick={() => handleSave(false)}
                    disabled={isSubmitting}
                    className="rounded-full hover:bg-[rgba(58,63,187,1)] px-10 bg-[rgba(58,63,187,1)] font-semibold hover:opacity-90 text-white shadow-md"
                >
                    {isSubmitting ? 'Publishing...' : 'Publish'}
                </Button>
            </div>
        </div>
    )
}

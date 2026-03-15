"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import api from '@/lib/api/client'
import { type PreferencesMetadata, type MetadataOption } from '@/lib/api/server'

type Step = 'choose' | 'generate'
type AssessmentFormat = 'none' | 'code' | ''

interface CreateInterviewDialogProps {
    open: boolean
    onClose: () => void
    authToken?: string
    roles: string[]
    experienceLevelsMetadata?: MetadataOption[]
}

export function CreateInterviewDialog({ open, onClose, authToken, roles, experienceLevelsMetadata }: CreateInterviewDialogProps) {
    const router = useRouter()
    const [step, setStep] = useState<Step>('choose')
    const [format, setFormat] = useState<AssessmentFormat>('')
    const [duration, setDuration] = useState(30)
    const [difficulty, setDifficulty] = useState<string>('medium')
    const [prompt, setPrompt] = useState('')
    const [role, setRole] = useState('')
    const [experienceLevels, setExperienceLevels] = useState<string[]>([])
    const [isGenerating, setIsGenerating] = useState(false)

    // Reset to first step whenever dialog reopens
    useEffect(() => {
        if (open) {
            setStep('choose')
            setFormat('')
            setDuration(30)
            setDifficulty('medium')
            setPrompt('')
            setRole('')
            setExperienceLevels([])
        }
    }, [open])

    const handleGenerate = async () => {
        if (!role) {
            toast.error('Please select a target role')
            return
        }
        if (!format) {
            toast.error('Please select an assessment format')
            return
        }
        if (!difficulty) {
            toast.error('Please select a difficulty level')
            return
        }
        if (!duration || duration < 5) {
            toast.error('Interview duration must be at least 5 minutes')
            return
        }
        if (!prompt.trim()) {
            toast.error('Please provide an AI prompt')
            return
        }
        setIsGenerating(true)
        try {
            const tags = experienceLevels.map(level => ({
                tag_type: 'level',
                value: level
            }))

            const response = await api.post(
                '/api/v1/company/interviews/generate/',
                { 
                    prompt, 
                    artifact_type: format, 
                    duration, 
                    role, 
                    difficulty_level: difficulty,
                    tags: tags
                },
                { headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined }
            )
            toast.success('Interview generated successfully!')
            onClose()
            router.push(`/company/edit/${response.data.id}`)
        } catch (error: any) {
            const message =
                error.response?.data?.error || 'Failed to generate interview. Please try again.'
            toast.error(message)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Dialog open={open}  onOpenChange={(o) => !o && onClose()}>
            <DialogContent
                showCloseButton
                className="sm:max-w-xl p-0 overflow-hidden"
            >
                {step === 'choose' ? (
                    /* ── Screen 1: Choose method ── */
                    <div className="px-10 pt-10 pb-10">
                        {/* Icon */}
                        <div className="flex justify-center mb-5">
                            <Image
                                src="/company/create/dialog/note2.svg"
                                alt="Note"
                                width={20}
                                height={20}
                            />
                        </div>

                        {/* Heading */}
                        <DialogTitle className="text-xl font-medium text-center text-[rgba(10,13,26,0.9)] mb-1">
                            Create Interview
                        </DialogTitle>
                        <p className="text- text-center text-[rgba(10,13,26,0.6)] mb-8">
                            Choose how you&apos;d like to set up your interview
                        </p>

                        {/* Create Manually card */}
                        <button
                            onClick={onClose}
                            className="w-full  border-[rgba(58,63,187,0.5)] hover:border-[rgba(58,63,187,1)] border-2 rounded-xl p-5 flex items-start gap-4 text-left mb-4 transition-colors "
                        >
                            <div className="w-11 h-11 bg-[rgba(234,237,255,1)] rounded-lg flex items-center justify-center shrink-0">
                                <Image
                                    src="/company/create/dialog/note.svg"
                                    alt=""
                                    width={16}
                                    height={16}
                                />
                            </div>
                            <div>
                                <p className="font-medium text-[rgba(10,13,26,1)] mb-1">
                                    Create Manually
                                </p>
                                <p className="text-sm text-[rgba(10,13,26,0.7)]">
                                    Build your interviews manually from scratch with custom questions
                                    and rubrics.
                                </p>
                            </div>
                        </button>

                        {/* Generate with AI card */}
                        <button
                            onClick={() => setStep('generate')}
                            className="w-full  border-[rgba(58,63,187,0.5)] hover:border-[rgba(58,63,187,1)] border-2 rounded-xl p-5 flex items-start gap-4 text-left mb-4 transition-colors "
                        >
                            <div className="w-11 h-11 bg-[rgba(234,237,255,1)] rounded-lg flex items-center justify-center shrink-0">
                                <Image
                                    src="/company/create/dialog/ai.svg"
                                    alt=""
                                    width={16}
                                    height={16}
                                />
                            </div>
                            <div>
                                <p className="font-medium text-[rgba(10,13,26,1)] mb-1">
                                    Generate with AI
                                </p>
                                <p className="text-sm text-[rgba(10,13,26,0.7)]">
                                    Let AI craft tailored questions based on the role and requirements
                                </p>
                            </div>
                        </button>
                    </div>
                ) : (
                    /* ── Screen 2: AI Generator ── */
                    <div className="px-10 pt-10 pb-10">
                        {/* Icon + heading */}
                        <div className="text-center mb-7">
                            <div className="flex justify-center mb-4">
                                <div className="w-10 h-10 bg-[rgba(234,237,255,1)] rounded-md flex items-center justify-center">
                                    <Image
                                        src="/company/create/dialog/ai.svg"
                                        alt="AI"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                            </div>
                            <DialogTitle className="text-xl font-medium text-[rgba(58,63,187,1)] mb-1">
                                AI Interview Generator
                            </DialogTitle>
                            <p className=" text-[rgba(10,13,26,0.6)]">
                                Provide these details to generate your interview
                            </p>
                        </div>

                        {/* Grid for settings */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-6">
                            {/* Role Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[rgba(10,13,26,0.82)] block">
                                    Target Role
                                </label>
                                <Select
                                    value={role}
                                    onValueChange={setRole}
                                >
                                    <SelectTrigger className="w-full border-[rgba(55,58,70,0.05)] bg-[rgba(248,248,255,1)]">
                                        <SelectValue placeholder="-Choose Role-" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Assessment Format */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[rgba(10,13,26,0.82)] block">
                                    Assessment Format
                                </label>
                                <Select
                                    value={format}
                                    onValueChange={(v) => setFormat(v as AssessmentFormat)}
                                >
                                    <SelectTrigger className="w-full border-[rgba(55,58,70,0.05)] bg-[rgba(248,248,255,1)]">
                                        <SelectValue placeholder="-Choose Format-" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="code">Code</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[rgba(10,13,26,0.82)] block">
                                    Duration
                                </label>
                                <div className="flex items-center gap-2 rounded-md px-3 h-10 border border-[rgba(55,58,70,0.05)] bg-[rgba(248,248,255,1)]">
                                    <Input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        min={5}
                                        className="flex-1 border-0 p-0 text-[rgba(10,13,26,0.82)] font-medium h-auto focus-visible:ring-0 shadow-none text-sm bg-transparent"
                                    />
                                    <span className="text-sm font-medium text-[rgba(10,13,26,0.4)]">min</span>
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[rgba(10,13,26,0.82)] block">
                                    Difficulty
                                </label>
                                <Select
                                    value={difficulty}
                                    onValueChange={setDifficulty}
                                >
                                    <SelectTrigger className="w-full border-[rgba(55,58,70,0.05)] bg-[rgba(248,248,255,1)]">
                                        <SelectValue placeholder="-Difficulty-" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Experience Level */}
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-semibold text-[rgba(10,13,26,0.82)] block">
                                    Experience Level
                                </label>
                                <MultiSelect
                                    options={(experienceLevelsMetadata || []).map(opt => (typeof opt === 'string' ? { label: opt, value: opt } : opt))}
                                    defaultValue={experienceLevels}
                                    onValueChange={setExperienceLevels}
                                    placeholder="-Select Experience Levels-"
                                    className="w-full border-[rgba(55,58,70,0.05)] bg-[rgba(248,248,255,1)]"
                                />
                            </div>
                        </div>

                        {/* AI Prompt */}
                        <div className="space-y-2 mb-2">
                            <label className="text-sm font-semibold text-[rgba(10,13,26,0.82)] block">
                                AI Prompt
                            </label>
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Provide guidelines to the AI Interviewer for this section"
                                className="min-h-[140px] text-xs placeholder: bg-[rgba(105,123,252,0.05)] placeholder:text-[rgba(10,13,26,0.5)] border-[rgba(206,215,255,0.5)] resize-none"
                            />
                        </div>
                        <p className="text-xs text-[rgba(10,13,26,0.5)] mb-7">
                            Guide the AI on what questions to ask, topics to cover, and evaluation
                            criteria.
                        </p>

                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white h-10 rounded-lg"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    Generating…
                                </>
                            ) : 'Generate Interview'}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

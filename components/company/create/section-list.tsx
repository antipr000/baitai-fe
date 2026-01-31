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
import { Clock, Minus, Plus, PlusCircle, Trash2 } from 'lucide-react'
import Image from 'next/image'
import {
    useInterviewStore,
    type Section,
    type EvaluationCriteria,
    type EvalCategory,
    type DifficultyLevel
} from '@/stores/interview-store'

const EVAL_CATEGORIES: { value: EvalCategory; label: string }[] = [
    { value: 'technical', label: 'Technical' },
    { value: 'problem_solving', label: 'Problem Solving' },
    { value: 'communication', label: 'Communication' },
    { value: 'team_work', label: 'Team Work' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'creativity', label: 'Creativity' },
    { value: 'organization', label: 'Organization' },
    { value: 'time_management', label: 'Time Management' },
    { value: 'decision_making', label: 'Decision Making' }
]

export const SectionList = () => {
    const {
        sections,
        updateSection,
        addSection,
        removeSection,
        addSectionQuestion,
        updateSectionQuestion,
        removeSectionQuestion,
        // Criteria Actions
        addSectionCriteria,
        updateSectionCriteria,
        removeSectionCriteria,
        // Follow-up Actions
        addQuestionFollowUp,
        updateQuestionFollowUp,
        removeQuestionFollowUp
    } = useInterviewStore()

    const handleAddSection = () => {
        addSection({
            name: 'New Section',
            sectionType: 'questioning'
        })
    }

    return (
        <div className="space-y-4">
            {sections.map((section, originalIndex) => {
                if (section.sectionType !== 'questioning') return null
                const sectionIndex = originalIndex

                return (
                    <Card key={sectionIndex} className="border border-[rgba(100,119,252,0.2)]">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Image src="/company/create/section.svg" alt="section" width={20} height={20} />
                                    <span className="text-lg font-medium text-[rgba(84,104,252,0.7)]">
                                        Section {sectionIndex + 1}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSection(sectionIndex)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Section Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Section Name <span className="text-red-500">*</span></label>
                                <Input
                                    value={section.name}
                                    onChange={(e) => updateSection(sectionIndex, { name: e.target.value })}
                                    placeholder="e.g., Technical Skills Assessment"
                                    className="bg-indigo-50/20 border-gray-200"
                                />
                            </div>

                            {/* Top Config Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Duration (min) <span className="text-red-500">*</span></label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-[rgba(84,104,252,0.6)]" />
                                        <Input
                                            type="number"
                                            value={section.duration}
                                            onChange={(e) => updateSection(sectionIndex, { duration: Number(e.target.value) })}
                                            className="bg-indigo-50/20 border-gray-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Max Questions</label>
                                    <Input
                                        type="number"
                                        value={section.maxQuestions || 3}
                                        onChange={(e) => updateSection(sectionIndex, { maxQuestions: Number(e.target.value) })}
                                        className="bg-indigo-50/20 border-gray-200"
                                    />
                                </div>
                            </div>

                            {/* AI Instructions */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">AI Instructions <span className="text-red-500">*</span></label>
                                <Textarea
                                    value={section.aiInstructions}
                                    onChange={(e) => updateSection(sectionIndex, { aiInstructions: e.target.value })}
                                    placeholder="Provide guidelines to the AI Interviewer for this section"
                                    className="min-h-[100px] bg-indigo-50/20 border-gray-200 resize-none"
                                />
                            </div>

                            {/* Evaluation Criteria */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Evaluation Criteria</label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addSectionCriteria(sectionIndex)}
                                        className="text-primary border-[rgba(84,104,252,0.5)] gap-2"
                                    >
                                        <Plus className="h-4 w-4 text-[rgba(84,104,252,1)]" />
                                        <span className="text-[rgba(84,104,252,0.7)]">Add Criteria</span>
                                    </Button>
                                </div>

                                {section.evaluationCriterias.map((criteria: EvaluationCriteria, cIndex: number) => (
                                    <div key={cIndex} className="bg-indigo-50/10 p-4 rounded-lg space-y-4 border border-[rgba(100,119,252,0.1)]">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Criteria {cIndex + 1}</h4>
                                            <Button variant="ghost" size="sm" onClick={() => removeSectionCriteria(sectionIndex, cIndex)} className="h-6 w-6 p-0 text-red-500"><Minus className="h-4 w-4" /></Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Category <span className="text-red-500">*</span></Label>
                                                <Select
                                                    value={criteria.category}
                                                    onValueChange={(val) => updateSectionCriteria(sectionIndex, cIndex, 'category', val)}
                                                >
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EVAL_CATEGORIES.map(cat => (
                                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Weight <span className="text-red-500">*</span></Label>
                                                <Input
                                                    type="number"
                                                    value={criteria.weight}
                                                    onChange={(e) => updateSectionCriteria(sectionIndex, cIndex, 'weight', Number(e.target.value))}
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Evaluation Prompt <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={criteria.evaluationPrompt}
                                                onChange={(e) => updateSectionCriteria(sectionIndex, cIndex, 'evaluationPrompt', e.target.value)}
                                                placeholder="What to evaluate?"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Scoring Scale <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="number"
                                                value={criteria.scoringScale}
                                                onChange={(e) => updateSectionCriteria(sectionIndex, cIndex, 'scoringScale', Number(e.target.value))}
                                                placeholder="10"
                                                className="bg-white max-w-[100px]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Questions Loop */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">Questions</label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addSectionQuestion(sectionIndex)}
                                        className="text-primary border-[rgba(84,104,252,0.5)] gap-2"
                                    >
                                        <Plus className="h-4 w-4 text-[rgba(84,104,252,1)]" />
                                        <span className="text-[rgba(84,104,252,0.7)]">Add Question</span>
                                    </Button>
                                </div>

                                {section.questions.map((question, qIndex) => (
                                    <div key={qIndex} className="pl-6 border-l-2 border-indigo-100 space-y-4 mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-semibold text-[rgba(34,37,49,1)]">Question {qIndex + 1}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSectionQuestion(sectionIndex, qIndex)}
                                                className="text-red-500 h-6 w-6 p-0"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Difficulty */}
                                        <div className="space-y-2">
                                            <Label>Difficulty Level <span className="text-red-500">*</span></Label>
                                            <RadioGroup
                                                value={question.difficultyLevel}
                                                onValueChange={(val: DifficultyLevel) => updateSectionQuestion(sectionIndex, qIndex, { difficultyLevel: val })}
                                                className="flex items-center gap-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="easy" id={`easy-${sectionIndex}-${qIndex}`} className="data-[state=checked]:border-[rgba(84,104,252,1)] [&_svg]:fill-[rgba(84,104,252,1)]" />
                                                    <Label htmlFor={`easy-${sectionIndex}-${qIndex}`} className="font-normal cursor-pointer">Easy</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="medium" id={`medium-${sectionIndex}-${qIndex}`} className="data-[state=checked]:border-[rgba(84,104,252,1)] [&_svg]:fill-[rgba(84,104,252,1)]" />
                                                    <Label htmlFor={`medium-${sectionIndex}-${qIndex}`} className="font-normal cursor-pointer">Medium</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="hard" id={`hard-${sectionIndex}-${qIndex}`} className="data-[state=checked]:border-[rgba(84,104,252,1)] [&_svg]:fill-[rgba(84,104,252,1)]" />
                                                    <Label htmlFor={`hard-${sectionIndex}-${qIndex}`} className="font-normal cursor-pointer">Hard</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {/* Question AI Instructions */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[rgba(10,13,26,0.82)] block">AI Instructions <span className="text-red-500">*</span></label>
                                            <Textarea
                                                value={question.aiInstructions}
                                                onChange={(e) => updateSectionQuestion(sectionIndex, qIndex, { aiInstructions: e.target.value })}
                                                placeholder="What should the AI ask?"
                                                className="min-h-[80px] bg-indigo-50/20 border-gray-200 resize-none"
                                            />
                                        </div>

                                        {/* Follow-up Rules */}
                                        <div className="pl-4 ml-4 border-l-2 border-[rgba(84,104,252,0.1)] rounded-lg space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-[rgba(150,162,253,0.9)]">Follow-up Logic</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addQuestionFollowUp(sectionIndex, qIndex)}
                                                    className="text-primary border-[rgba(84,104,252,0.5)] gap-2 h-8"
                                                >
                                                    <Plus className="h-3 w-3 text-[rgba(84,104,252,1)]" />
                                                    <span className="text-[rgba(84,104,252,0.7)]">Add Rule</span>
                                                </Button>
                                            </div>

                                            {question.followupRules.map((rule, rIndex) => (
                                                <div key={rIndex} className="bg-white/50 p-3 rounded border border-gray-100 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1 flex-1">
                                                            <label className="text-xs font-medium text-[rgba(10,13,26,0.82)] block">Trigger Condition <span className="text-red-500">*</span></label>
                                                            <Input
                                                                value={rule.triggerCondition}
                                                                onChange={(e) => updateQuestionFollowUp(sectionIndex, qIndex, rIndex, 'triggerCondition', e.target.value)}
                                                                placeholder="e.g. If mention caching"
                                                                className="bg-indigo-50/20 border-gray-200 h-8 text-sm"
                                                            />
                                                        </div>
                                                        <Button variant="ghost" size="sm" onClick={() => removeQuestionFollowUp(sectionIndex, qIndex, rIndex)} className="h-6 w-6 p-0 text-red-500 ml-2 mt-4"><Minus className="h-3 w-3" /></Button>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs font-medium text-[rgba(10,13,26,0.82)] block">AI Instructions <span className="text-red-500">*</span></label>
                                                        <Textarea
                                                            value={rule.aiInstructions}
                                                            onChange={(e) => updateQuestionFollowUp(sectionIndex, qIndex, rIndex, 'aiInstructions', e.target.value)}
                                                            placeholder="Ask about invalidation..."
                                                            className="min-h-[60px] bg-indigo-50/20 border-gray-200 resize-none text-sm"
                                                        />
                                                    </div>

                                                    <div className="space-y-1 w-24">
                                                        <label className="text-xs font-medium text-[rgba(10,13,26,0.82)] block">Max Depth <span className="text-red-500">*</span></label>
                                                        <Input
                                                            type="number"
                                                            value={rule.maxDepth}
                                                            onChange={(e) => updateQuestionFollowUp(sectionIndex, qIndex, rIndex, 'maxDepth', Number(e.target.value))}
                                                            className="bg-indigo-50/20 border-gray-200 h-8 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}

            {/* Add Section Button */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={handleAddSection}
                    className="text-primary border-[rgba(84,104,252,0.5)] gap-2"
                >
                    <PlusCircle className="h-4 w-4 text-[rgba(84,104,252,1)]" />
                    <span className="text-[rgba(84,104,252,0.7)]">Add Section</span>
                </Button>
            </div>
        </div>
    )
}

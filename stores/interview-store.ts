import { create } from 'zustand'

// --- Enums matching Backend ---

export type SectionType = 'intro' | 'questioning' | 'closing'
export type ArtifactType = 'none' | 'document' | 'diagram' | 'code'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type EvalCategory =
    | 'technical'
    | 'problem_solving'
    | 'communication'
    | 'team_work'
    | 'leadership'
    | 'creativity'
    | 'organization'
    | 'time_management'
    | 'decision_making'

// --- Interfaces matching Backend API ---

export interface FollowUpRule {
    triggerCondition: string
    aiInstructions: string
    maxDepth: number
    order?: number
}

export interface Question {
    difficultyLevel: DifficultyLevel
    aiInstructions: string
    order: number
    contextHints?: string | null
    followupRules: FollowUpRule[]
}

export interface EvaluationCriteria {
    category: EvalCategory | ''
    weight: number
    evaluationPrompt: string
    scoringScale: number
}

export interface Section {
    name: string
    order: number
    duration: number
    sectionType: SectionType
    aiInstructions: string
    minQuestions?: number | null
    maxQuestions?: number | null
    artifactType?: ArtifactType | null
    questions: Question[]
    evaluationCriterias: EvaluationCriteria[]
}

export interface InterviewState {
    // Top Level Fields (matching InterviewTemplateCreate)
    title: string
    description: string
    companyId: string
    role: string
    duration: number
    isPublic: boolean
    credits: number
    screenShare: boolean
    llmConfig: Record<string, unknown>
    sections: Section[]

    // Actions
    setTitle: (title: string) => void
    setDescription: (description: string) => void
    setRole: (role: string) => void
    setDuration: (duration: number) => void
    setIsPublic: (isPublic: boolean) => void
    setCredits: (credits: number) => void
    setScreenShare: (screenShare: boolean) => void
    setCompanyId: (companyId: string) => void

    // Section Actions
    addSection: (section: Partial<Section>) => void
    updateSection: (index: number, section: Partial<Section>) => void
    removeSection: (index: number) => void

    // Question Actions
    addSectionQuestion: (sectionIndex: number) => void
    updateSectionQuestion: (sectionIndex: number, questionIndex: number, question: Partial<Question>) => void
    removeSectionQuestion: (sectionIndex: number, questionIndex: number) => void

    // Criteria Actions
    addSectionCriteria: (sectionIndex: number) => void
    updateSectionCriteria: (sectionIndex: number, criteriaIndex: number, field: keyof EvaluationCriteria, value: string | number) => void
    removeSectionCriteria: (sectionIndex: number, criteriaIndex: number) => void

    // Follow-up Actions
    addQuestionFollowUp: (sectionIndex: number, questionIndex: number) => void
    updateQuestionFollowUp: (sectionIndex: number, questionIndex: number, ruleIndex: number, field: string, value: string | number) => void
    removeQuestionFollowUp: (sectionIndex: number, questionIndex: number, ruleIndex: number) => void

    // Reset
    resetStore: () => void
}

// --- Default Section Templates ---

const createDefaultQuestion = (order: number = 1): Question => ({
    difficultyLevel: 'medium',
    aiInstructions: '',
    order,
    followupRules: []
})

const createDefaultCriteria = (): EvaluationCriteria => ({
    category: '',
    weight: 1,
    evaluationPrompt: '',
    scoringScale: 10
})

const createDefaultIntroSection = (): Section => ({
    name: 'Introduction',
    order: 1,
    duration: 5,
    sectionType: 'intro',
    artifactType: 'none',
    aiInstructions: 'Introduce the company and the role.',
    minQuestions: 1,
    maxQuestions: 1,
    evaluationCriterias: [],
    questions: [{
        difficultyLevel: 'easy',
        aiInstructions: 'Ask about their background.',
        order: 1,
        followupRules: []
    }]
})

const createDefaultConclusionSection = (): Section => ({
    name: 'Conclusion',
    order: 99,
    duration: 5,
    sectionType: 'closing',
    artifactType: 'none',
    aiInstructions: 'Wrap up the interview and thank the candidate.',
    minQuestions: 0,
    maxQuestions: 1,
    evaluationCriterias: [],
    questions: []
})

const initialState = {
    title: '',
    description: '',
    companyId: '', // Will be set dynamically from auth context
    role: '',
    duration: 60,
    isPublic: false,
    credits: 0,
    screenShare: false,
    llmConfig: {},
    sections: [
        createDefaultIntroSection(),
        createDefaultConclusionSection()
    ]
}

// --- Store ---

export const useInterviewStore = create<InterviewState>((set, get) => ({
    ...initialState,

    setTitle: (title) => set({ title }),
    setDescription: (description) => set({ description }),
    setRole: (role) => set({ role }),
    setDuration: (duration) => set({ duration }),
    setIsPublic: (isPublic) => set({ isPublic }),
    setCredits: (credits) => set({ credits }),
    setScreenShare: (screenShare) => set({ screenShare }),
    setCompanyId: (companyId) => set({ companyId }),

    addSection: (sectionPartial) => set((state) => {
        const sections = [...state.sections]

        // Calculate order (before conclusion)
        const conclusionIndex = sections.findIndex(s => s.sectionType === 'closing')
        const newOrder = conclusionIndex > 0 ? sections[conclusionIndex - 1].order + 1 : sections.length + 1

        // Create section with defaults
        const newSection: Section = {
            name: sectionPartial.name || 'New Section',
            order: newOrder,
            duration: sectionPartial.duration || 15,
            sectionType: sectionPartial.sectionType || 'questioning',
            aiInstructions: sectionPartial.aiInstructions || '',
            minQuestions: sectionPartial.minQuestions ?? 1,
            maxQuestions: sectionPartial.maxQuestions ?? 3,
            artifactType: sectionPartial.artifactType || 'none',
            questions: sectionPartial.questions?.length
                ? sectionPartial.questions
                : [createDefaultQuestion()],
            evaluationCriterias: sectionPartial.evaluationCriterias?.length
                ? sectionPartial.evaluationCriterias
                : [createDefaultCriteria()]
        }

        // Insert before conclusion
        if (conclusionIndex >= 0) {
            sections.splice(conclusionIndex, 0, newSection)
            // Update conclusion order
            sections[conclusionIndex + 1].order = newOrder + 1
        } else {
            sections.push(newSection)
        }

        return { sections }
    }),

    updateSection: (index, sectionUpdate) => set((state) => {
        const newSections = [...state.sections]
        newSections[index] = { ...newSections[index], ...sectionUpdate }
        return { sections: newSections }
    }),

    removeSection: (index) => set((state) => {
        const section = state.sections[index]
        // Prevent removing intro/conclusion
        if (section.sectionType === 'intro' || section.sectionType === 'closing') {
            return state
        }
        return {
            sections: state.sections.filter((_, i) => i !== index)
        }
    }),

    addSectionQuestion: (sectionIndex) => set((state) => {
        const newSections = [...state.sections]
        const section = { ...newSections[sectionIndex] }
        const newOrder = section.questions.length + 1
        section.questions = [...section.questions, createDefaultQuestion(newOrder)]
        newSections[sectionIndex] = section
        return { sections: newSections }
    }),

    updateSectionQuestion: (sectionIndex, questionIndex, questionUpdate) => set((state) => {
        const newSections = [...state.sections]
        const questions = [...newSections[sectionIndex].questions]
        questions[questionIndex] = { ...questions[questionIndex], ...questionUpdate }
        newSections[sectionIndex] = { ...newSections[sectionIndex], questions }
        return { sections: newSections }
    }),

    removeSectionQuestion: (sectionIndex, questionIndex) => set((state) => {
        const newSections = [...state.sections]
        const questions = newSections[sectionIndex].questions
        // Prevent removing last question
        if (questions.length <= 1) return state

        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            questions: questions.filter((_, i) => i !== questionIndex)
        }
        return { sections: newSections }
    }),

    // Criteria Actions
    addSectionCriteria: (sectionIndex) => set((state) => {
        const newSections = [...state.sections]
        const section = { ...newSections[sectionIndex] }
        section.evaluationCriterias = [...section.evaluationCriterias, createDefaultCriteria()]
        newSections[sectionIndex] = section
        return { sections: newSections }
    }),

    updateSectionCriteria: (sectionIndex, criteriaIndex, field, value) => set((state) => {
        const newSections = [...state.sections]
        const section = { ...newSections[sectionIndex] }
        const newCriteria = [...section.evaluationCriterias]
        newCriteria[criteriaIndex] = { ...newCriteria[criteriaIndex], [field]: value }
        section.evaluationCriterias = newCriteria
        newSections[sectionIndex] = section
        return { sections: newSections }
    }),

    removeSectionCriteria: (sectionIndex, criteriaIndex) => set((state) => {
        const newSections = [...state.sections]
        const section = { ...newSections[sectionIndex] }
        if (section.evaluationCriterias.length <= 1) return state

        section.evaluationCriterias = section.evaluationCriterias.filter((_, i) => i !== criteriaIndex)
        newSections[sectionIndex] = section
        return { sections: newSections }
    }),

    // Follow-up Actions
    addQuestionFollowUp: (sectionIndex, questionIndex) => set((state) => {
        const newSections = [...state.sections]
        const questions = [...newSections[sectionIndex].questions]
        const question = { ...questions[questionIndex] }

        question.followupRules = [...question.followupRules, {
            triggerCondition: '',
            aiInstructions: '',
            maxDepth: 1
        }]
        questions[questionIndex] = question
        newSections[sectionIndex] = { ...newSections[sectionIndex], questions }
        return { sections: newSections }
    }),

    updateQuestionFollowUp: (sectionIndex, questionIndex, ruleIndex, field, value) => set((state) => {
        const newSections = [...state.sections]
        const questions = [...newSections[sectionIndex].questions]
        const question = { ...questions[questionIndex] }
        const newRules = [...question.followupRules]

        newRules[ruleIndex] = { ...newRules[ruleIndex], [field]: value }
        question.followupRules = newRules

        questions[questionIndex] = question
        newSections[sectionIndex] = { ...newSections[sectionIndex], questions }
        return { sections: newSections }
    }),

    removeQuestionFollowUp: (sectionIndex, questionIndex, ruleIndex) => set((state) => {
        const newSections = [...state.sections]
        const questions = [...newSections[sectionIndex].questions]
        const question = { ...questions[questionIndex] }

        question.followupRules = question.followupRules.filter((_, i) => i !== ruleIndex)

        questions[questionIndex] = question
        newSections[sectionIndex] = { ...newSections[sectionIndex], questions }
        return { sections: newSections }
    }),

    resetStore: () => set(initialState)
}))

// --- Payload Builder (for API submission) ---

export function buildInterviewPayload(state: InterviewState) {
    return {
        title: state.title,
        company_id: state.companyId,
        description: state.description || null,
        is_public: state.isPublic,
        duration: state.duration,
        llm_config: state.llmConfig,
        role: state.role,
        screen_share: state.screenShare,
        credits: state.credits,
        sections: state.sections.map(section => ({
            name: section.name,
            order: section.order,
            duration: section.duration,
            section_type: section.sectionType,
            ai_instructions: section.aiInstructions,
            min_questions: section.minQuestions,
            max_questions: section.maxQuestions,
            artifact_type: section.artifactType || null,
            questions: section.questions.map(q => ({
                difficulty_level: q.difficultyLevel,
                ai_instructions: q.aiInstructions,
                context_hints: q.contextHints || null,
                order: q.order,
                followup_rules: q.followupRules.map((rule, idx) => ({
                    trigger_condition: rule.triggerCondition,
                    ai_instructions: rule.aiInstructions,
                    max_depth: rule.maxDepth,
                    order: rule.order ?? idx
                }))
            })),
            evaluation_criterias: section.evaluationCriterias
                .filter(c => c.category) // Only include if category is set
                .map(c => ({
                    category: c.category,
                    weight: c.weight,
                    evaluation_prompt: c.evaluationPrompt,
                    scoring_scale: c.scoringScale
                }))
        }))
    }
}

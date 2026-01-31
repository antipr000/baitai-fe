import { z } from 'zod'

// --- Enum Schemas ---

export const sectionTypeSchema = z.enum(['intro', 'questioning', 'closing'])
export const artifactTypeSchema = z.enum(['none', 'document', 'diagram', 'code'])
export const difficultyLevelSchema = z.enum(['easy', 'medium', 'hard'])
export const evalCategorySchema = z.enum([
    'technical',
    'problem_solving',
    'communication',
    'team_work',
    'leadership',
    'creativity',
    'organization',
    'time_management',
    'decision_making'
])

// --- Nested Schemas ---

// FollowUpRule: all fields required except order
export const followupRuleSchema = z.object({
    trigger_condition: z.string().min(1, 'Trigger condition is required'),
    ai_instructions: z.string().min(1, 'AI instructions are required'),
    max_depth: z.number().int().min(1, 'Max depth must be at least 1').max(5),
    order: z.number().int().optional()
})

// QuestionTemplateCreate: difficulty_level, ai_instructions, order are required
export const questionSchema = z.object({
    difficulty_level: difficultyLevelSchema,
    ai_instructions: z.string().min(1, 'Question AI instructions are required'),
    context_hints: z.string().nullable().optional(),
    order: z.number().int().min(1),
    followup_rules: z.array(followupRuleSchema).default([])
})

// EvaluationCriteriaCreate: ALL fields required
export const evaluationCriteriaSchema = z.object({
    category: evalCategorySchema,
    weight: z.number().int().min(1, 'Weight must be at least 1').max(10),
    evaluation_prompt: z.string().min(1, 'Evaluation prompt is required'),
    scoring_scale: z.number().int().min(1, 'Scoring scale must be at least 1').max(100)
})

// InterviewSectionCreate: name, order, duration, section_type, ai_instructions are required
export const sectionSchema = z.object({
    name: z.string().min(1, 'Section name is required'),
    order: z.number().int().min(1),
    duration: z.number().int().min(1, 'Section duration must be at least 1 minute'),
    section_type: sectionTypeSchema,
    ai_instructions: z.string().min(1, 'Section AI instructions are required'),
    // Optional fields with defaults
    min_questions: z.number().int().nullable().optional(),
    max_questions: z.number().int().nullable().optional(),
    artifact_type: artifactTypeSchema.nullable().optional(),
    questions: z.array(questionSchema).default([]),
    evaluation_criterias: z.array(evaluationCriteriaSchema).default([])
})

// --- Main Interview Schema ---
// InterviewTemplateCreate: title, company_id, duration, role are REQUIRED

export const interviewCreateSchema = z.object({
    // REQUIRED fields
    title: z.string().min(1, 'Interview title is required').max(200, 'Title must be less than 200 characters'),
    company_id: z.string().min(1, 'Company ID is required'),
    duration: z.number().int().min(1, 'Total duration must be at least 1 minute'),
    role: z.string().min(1, 'Role/Job title is required').max(200, 'Role must be less than 200 characters'),

    // OPTIONAL fields with defaults
    description: z.string().nullable().optional(),
    is_public: z.boolean().default(false),
    llm_config: z.record(z.string(), z.unknown()).default({}),
    screen_share: z.boolean().default(false),
    credits: z.number().int().min(0).default(0),
    sections: z.array(sectionSchema).default([])
})

// --- Type Exports ---

export type InterviewCreatePayload = z.infer<typeof interviewCreateSchema>
export type SectionPayload = z.infer<typeof sectionSchema>
export type QuestionPayload = z.infer<typeof questionSchema>
export type EvaluationCriteriaPayload = z.infer<typeof evaluationCriteriaSchema>
export type FollowupRulePayload = z.infer<typeof followupRuleSchema>

// --- Validation Helper ---

export function validateInterviewPayload(payload: unknown): {
    success: true;
    data: InterviewCreatePayload
} | {
    success: false;
    errors: z.ZodError['issues']
} {
    const result = interviewCreateSchema.safeParse(payload)

    if (result.success) {
        return { success: true, data: result.data }
    }

    return { success: false, errors: result.error.issues }
}

// --- Error Formatter ---

export function formatZodErrors(errors: z.ZodError['issues']): string[] {
    return errors.map(err => {
        const path = err.path.join(' → ')
        return path ? `${path}: ${err.message}` : err.message
    })
}

// --- Required Fields Reference ---
// Backend Required Fields:
// InterviewTemplateCreate: title, company_id, duration, role
// InterviewSectionCreate: name, order, duration, section_type, ai_instructions
// QuestionTemplateCreate: difficulty_level, ai_instructions, order
// EvaluationCriteriaCreate: category, weight, evaluation_prompt, scoring_scale
// FollowUpRule: trigger_condition, ai_instructions, max_depth

/**
 * API utilities for fetching interview templates
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export type InterviewTemplateDetail = {
  id: string
  title: string
  role: string
  duration: number
  company_id: string
  is_public: boolean
  credits: number
  screen_share: boolean
  llm_config: Record<string, unknown>
  sections: Array<{
    id: string
    name: string
    order: number
    ai_instructions: string
    questions: Array<{
      id: string
      order: number
      ai_instructions: string
      followup_rules: Array<unknown>
    }>
  }>
  created_at: string
  updated_at: string
}

export type InterviewTemplateSummary = {
  id: string
  title: string
  role: string
  duration: number
  company_id: string
  is_public: boolean
  credits: number
  created_at: string
  updated_at: string
}

/**
 * Fetch a single interview template by ID
 * @param templateId - The interview template ID
 * @returns Interview template details or null if not found
 */
export async function getInterviewTemplate(
  templateId: string
): Promise<InterviewTemplateDetail | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/user/interview/${templateId}/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token when auth is implemented
          // 'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch interview: ${response.statusText}`)
    }

    const data = await response.json()
    return data as InterviewTemplateDetail
  } catch (error) {
    console.error('Error fetching interview template:', error)
    throw error
  }
}

/**
 * Filter/list interview templates
 * @param filters - Filter parameters (pagination, is_public, etc.)
 * @returns Paginated response with interview templates
 */
export async function listInterviewTemplates(filters?: {
  page?: number
  page_size?: number
  is_public?: boolean
  role?: string
}): Promise<{
  data: InterviewTemplateSummary[]
  total: number
  page: number
  page_size: number
  total_pages: number
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/user/interview/practice/filter/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token when auth is implemented
        },
        body: JSON.stringify(filters || {}),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch interviews: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching interview templates:', error)
    throw error
  }
}


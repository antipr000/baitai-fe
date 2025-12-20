import { useState, useEffect } from 'react'
import { getInterviewTemplate, type InterviewTemplateDetail } from '@/lib/api/interview'

/**
 * Hook to fetch interview template by ID
 * @param templateId - The interview template ID (null/undefined to skip fetch)
 * @returns Interview template data, loading state, and error
 */
export function useInterview(templateId: string | null | undefined) {
  const [interview, setInterview] = useState<InterviewTemplateDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!templateId) {
      setInterview(null)
      setError(null)
      return
    }

    let cancelled = false

    const fetchInterview = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getInterviewTemplate(templateId)
        if (!cancelled) {
          setInterview(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch interview')
          setLoading(false)
        }
      }
    }

    fetchInterview()

    return () => {
      cancelled = true
    }
  }, [templateId])

  return { interview, loading, error }
}


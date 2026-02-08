/**
 * API utilities for resume check and upload
 */

import api from './client'

export type UserResumeDTO = {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  storage_location: string
  storage_provider: string
  file_name: string
  content_type: string
  status: string
}

export type ResumeCheckResponse = {
  has_resume: boolean
  resume: UserResumeDTO | null
}

/**
 * Check if the authenticated user already has a resume uploaded
 * @returns ResumeCheckResponse with has_resume flag and optional resume details
 */
export async function checkResume(): Promise<ResumeCheckResponse> {
  const response = await api.get('/api/v1/resume/check/')
  return response.data as ResumeCheckResponse
}

/**
 * Upload a resume for the authenticated user
 * @param file - The resume file to upload
 * @param onUploadProgress - Optional progress callback
 * @returns The uploaded resume details
 */
export async function uploadResume(
  file: File,
  token?: string,
  onUploadProgress?: (progressEvent: { loaded: number; total?: number; lengthComputable?: boolean }) => void
): Promise<UserResumeDTO> {
  const formData = new FormData()
  formData.append('file', file)

  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await api.post('/api/v1/resume/upload/', formData, {
    headers,
    onUploadProgress,
  })

  return response.data as UserResumeDTO
}

import api from './client'

interface PurchaseResponse {
  payment_url: string
  money_in_id: string
}

interface VerifySessionResponse {
  status: 'paid' | 'pending' | 'failed'
  credits?: number
}

export async function purchaseUserCredits(planId: string, returnUrl: string): Promise<PurchaseResponse> {
  const response = await api.post('/api/v1/subscriptions/payments/user/purchase-credits/', {
    plan_id: planId,
    return_url: returnUrl,
  })
  return response.data as PurchaseResponse
}

export async function verifyUserSession(sessionId: string, token?: string): Promise<VerifySessionResponse> {
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const response = await api.post('/api/v1/subscriptions/payments/user/verify-session/', {
    session_id: sessionId,
  }, { headers })
  return response.data as VerifySessionResponse
}

export async function subscribeCompany(planId: string, returnUrl: string, token?: string): Promise<PurchaseResponse> {
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const response = await api.post('/api/v1/subscriptions/payments/company/subscribe/', {
    plan_id: planId,
    return_url: returnUrl,
  }, { headers })
  return response.data as PurchaseResponse
}

export async function verifyCompanySession(sessionId: string, token?: string): Promise<VerifySessionResponse> {
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const response = await api.post('/api/v1/subscriptions/payments/company/verify-session/', {
    session_id: sessionId,
  }, { headers })
  return response.data as VerifySessionResponse
}

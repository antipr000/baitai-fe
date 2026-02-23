import api from './client'

interface PurchaseResponse {
  payment_url: string
  money_in_id: string
}

export async function purchaseUserCredits(planId: string, returnUrl: string): Promise<PurchaseResponse> {
  const response = await api.post('/api/v1/subscriptions/payments/user/purchase-credits/', {
    plan_id: planId,
    return_url: returnUrl,
  })
  return response.data as PurchaseResponse
}

export async function subscribeCompany(planId: string, returnUrl: string): Promise<PurchaseResponse> {
  const response = await api.post('/api/v1/subscriptions/payments/company/subscribe/', {
    plan_id: planId,
    return_url: returnUrl,
  })
  return response.data as PurchaseResponse
}

import axios from 'axios'
import { auth } from '@/lib/firebase'
import { getIdToken } from 'firebase/auth'
import { toast } from 'sonner'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    if (auth.currentUser && !config.headers.Authorization) {
      // Get Firebase ID token
      const token = await getIdToken(auth.currentUser)
      // Send token to Django in Authorization header
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)

    // Handle 402 Payment Required
    if (error.response?.status === 402) {
      toast.error('Insufficient credits. Please purchase more credits to continue.')
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      toast.error('An error occurred. Please try again later.')
    }

    return Promise.reject(error)
  }
)

export default api
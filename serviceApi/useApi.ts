// src/serviceApi/useApi.ts
import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('supabase.auth.token')
      if (token) {
        try {
          const parsedToken = JSON.parse(token)
          if (parsedToken?.access_token) {
            config.headers.Authorization = `Bearer ${parsedToken.access_token}`
          }
        } catch (e) {
        }
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (typeof window !== 'undefined' && error.response?.status === 401) {
        localStorage.removeItem('supabase.auth.token')
        window.location.href = '/login'
      }
    } else {
      // Erreur non Axios (erreur JS générique)
    }

    return Promise.reject(error)
  }
)

export default api
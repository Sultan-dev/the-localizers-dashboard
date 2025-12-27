import apiClient from '../lib/axios'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user?: {
    id: string
    email: string
    name?: string
  }
}

export const authService = {
  // POST Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', credentials)
    return response.data
  },

  // POST Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}


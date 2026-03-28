import { apiFetch, setTokens, clearTokens } from './api'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export async function registerUser(name: string, email: string, password: string) {
  const res = await apiFetch<TokenResponse>('/api/Auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  if (res.success && res.data) {
    setTokens(res.data.accessToken, res.data.refreshToken)
  }
  return res
}

export async function loginUser(email: string, password: string) {
  const res = await apiFetch<TokenResponse>('/api/Auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (res.success && res.data) {
    setTokens(res.data.accessToken, res.data.refreshToken)
  }
  return res
}

export async function logoutUser() {
  const res = await apiFetch('/api/Auth/revoke', { method: 'POST' })
  clearTokens()
  return res
}

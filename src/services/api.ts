export const API_URL: string = import.meta.env.VITE_API_URL || ''

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

const ACCESS_TOKEN_KEY = 'bd_access_token'
const REFRESH_TOKEN_KEY = 'bd_refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Singleton promise to prevent multiple concurrent refresh attempts
let refreshPromise: Promise<string | null> | null = null

async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return null

    try {
      const res = await fetch(`${API_URL}/api/Auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setTokens(json.data.accessToken, json.data.refreshToken)
        return json.data.accessToken
      }
    } catch {
      // ignore
    }

    clearTokens()
    // Notify AuthContext that the session expired
    window.dispatchEvent(new Event('auth:session-expired'))
    return null
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401 && token) {
    const newToken = await tryRefreshToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${API_URL}${path}`, { ...options, headers })
    }
  }

  try {
    return await res.json()
  } catch {
    return { success: false, data: null as T, message: 'Erro de conexão com o servidor.' }
  }
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<ApiResponse<T>> {
  let token = getAccessToken()

  const makeRequest = (t: string | null) => {
    const headers: Record<string, string> = {}
    if (t) headers['Authorization'] = `Bearer ${t}`
    return fetch(`${API_URL}${path}`, { method: 'POST', headers, body: formData })
  }

  let res = await makeRequest(token)

  if (res.status === 401 && token) {
    const newToken = await tryRefreshToken()
    if (newToken) {
      res = await makeRequest(newToken)
    }
  }

  try {
    return await res.json()
  } catch {
    return { success: false, data: null as T, message: 'Erro de conexão com o servidor.' }
  }
}

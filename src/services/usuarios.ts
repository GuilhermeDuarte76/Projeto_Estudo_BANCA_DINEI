import { apiFetch } from './api'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type TipoContato = 'Celular' | 'Fixo' | 'WhatsApp'

export interface UserContato {
  id: number
  tipo: TipoContato
  valor: string
  isPrincipal: boolean
}

export interface UserContatoInput {
  tipo: TipoContato
  valor: string
  isPrincipal: boolean
}

export interface UserEndereco {
  id: number
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  isPrincipal: boolean
}

export interface UserEnderecoInput {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  isPrincipal: boolean
}

// ── Contatos ──────────────────────────────────────────────────────────────────

export const getContatos = (userId: number) =>
  apiFetch<UserContato[]>(`/api/usuarios/${userId}/contatos`)

export const createContato = (userId: number, data: UserContatoInput) =>
  apiFetch<UserContato>(`/api/usuarios/${userId}/contatos`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateContato = (userId: number, id: number, data: UserContatoInput) =>
  apiFetch<UserContato>(`/api/usuarios/${userId}/contatos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const setContatoPrincipal = (userId: number, id: number) =>
  apiFetch<null>(`/api/usuarios/${userId}/contatos/${id}/principal`, { method: 'PATCH' })

export const deleteContato = (userId: number, id: number) =>
  apiFetch<null>(`/api/usuarios/${userId}/contatos/${id}`, { method: 'DELETE' })

// ── Endereços ─────────────────────────────────────────────────────────────────

export const getEnderecos = (userId: number) =>
  apiFetch<UserEndereco[]>(`/api/usuarios/${userId}/enderecos`)

export const createEndereco = (userId: number, data: UserEnderecoInput) =>
  apiFetch<UserEndereco>(`/api/usuarios/${userId}/enderecos`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateEndereco = (userId: number, id: number, data: UserEnderecoInput) =>
  apiFetch<UserEndereco>(`/api/usuarios/${userId}/enderecos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const setEnderecoPrincipal = (userId: number, id: number) =>
  apiFetch<null>(`/api/usuarios/${userId}/enderecos/${id}/principal`, { method: 'PATCH' })

export const deleteEndereco = (userId: number, id: number) =>
  apiFetch<null>(`/api/usuarios/${userId}/enderecos/${id}`, { method: 'DELETE' })

// ── Admin - Usuários ──────────────────────────────────────────────────────────

export interface UserListItem {
  id: number
  nome: string | null
  role: string | null
  lastLoginAt: string | null
  isActive: boolean
}

export interface UsuarioPagedResult {
  items: UserListItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export const getAdminUsuarios = (page = 1, pageSize = 20) => {
  const q = new URLSearchParams()
  q.set('page', String(page))
  q.set('pageSize', String(pageSize))
  return apiFetch<UsuarioPagedResult>(`/api/admin/usuarios?${q}`)
}

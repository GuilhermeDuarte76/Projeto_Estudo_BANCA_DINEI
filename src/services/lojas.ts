import { apiFetch } from './api'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface LojaEndereco {
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

export interface Loja {
  id: number
  nome: string
  cnpj: string
  telefone: string
  email: string
  enderecos: LojaEndereco[]
}

export interface LojaCreateInput {
  nome: string
  cnpj: string
  telefone: string
  email: string
}

export type LojaUpdateInput = LojaCreateInput

export interface LojaEnderecoInput {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  isPrincipal: boolean
}

// ── Público ───────────────────────────────────────────────────────────────────

export const getLojas = () =>
  apiFetch<Loja[]>('/api/lojas')

export const getLoja = (id: number) =>
  apiFetch<Loja>(`/api/lojas/${id}`)

// ── Admin — Lojas ─────────────────────────────────────────────────────────────

export const createLoja = (data: LojaCreateInput) =>
  apiFetch<Loja>('/api/admin/lojas', { method: 'POST', body: JSON.stringify(data) })

export const updateLoja = (id: number, data: LojaUpdateInput) =>
  apiFetch<Loja>(`/api/admin/lojas/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const desativarLoja = (id: number) =>
  apiFetch<null>(`/api/admin/lojas/${id}`, { method: 'DELETE' })

// ── Admin — Endereços ─────────────────────────────────────────────────────────

export const addEnderecoLoja = (lojaId: number, data: LojaEnderecoInput) =>
  apiFetch<LojaEndereco>(`/api/admin/lojas/${lojaId}/enderecos`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateEnderecoLoja = (lojaId: number, id: number, data: LojaEnderecoInput) =>
  apiFetch<LojaEndereco>(`/api/admin/lojas/${lojaId}/enderecos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const setEnderecoPrincipalLoja = (lojaId: number, id: number) =>
  apiFetch<null>(`/api/admin/lojas/${lojaId}/enderecos/${id}/principal`, { method: 'PATCH' })

export const deleteEnderecoLoja = (lojaId: number, id: number) =>
  apiFetch<null>(`/api/admin/lojas/${lojaId}/enderecos/${id}`, { method: 'DELETE' })

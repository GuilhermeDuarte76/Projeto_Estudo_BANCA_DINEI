import { apiFetch } from './api'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type TipoDesconto = 'Percentual' | 'ValorFixo'

export interface Promocao {
  id: number
  nome: string
  descricao: string
  tipoDesconto: TipoDesconto
  valorDesconto: number
  dataInicio: string
  dataFim: string
  isAtivo?: boolean
}

export interface ProdutoPromocao {
  id: number
  nome: string
  preco: number
  imagemUrl: string
  categoria: string
}

export interface PromocaoCreateInput {
  nome: string
  descricao: string
  tipoDesconto: TipoDesconto
  valorDesconto: number
  dataInicio: string
  dataFim: string
}

export type PromocaoUpdateInput = PromocaoCreateInput

// ── Público ───────────────────────────────────────────────────────────────────

export const getPromocoes = () =>
  apiFetch<Promocao[]>('/api/promocoes')

export const getPromocaoProdutos = (id: number) =>
  apiFetch<ProdutoPromocao[]>(`/api/promocoes/${id}/produtos`)

// ── Admin ─────────────────────────────────────────────────────────────────────

export const getAdminPromocoes = () =>
  apiFetch<Promocao[]>('/api/admin/promocoes')

export const createPromocao = (data: PromocaoCreateInput) =>
  apiFetch<Promocao>('/api/admin/promocoes', { method: 'POST', body: JSON.stringify(data) })

export const updatePromocao = (id: number, data: PromocaoUpdateInput) =>
  apiFetch<Promocao>(`/api/admin/promocoes/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deletePromocao = (id: number) =>
  apiFetch<null>(`/api/admin/promocoes/${id}`, { method: 'DELETE' })

export const addProdutosToPromocao = (id: number, produtoIds: number[]) =>
  apiFetch<null>(`/api/admin/promocoes/${id}/produtos`, {
    method: 'POST',
    body: JSON.stringify({ produtoIds }),
  })

export const removeProdutoFromPromocao = (id: number, produtoId: number) =>
  apiFetch<null>(`/api/admin/promocoes/${id}/produtos/${produtoId}`, { method: 'DELETE' })

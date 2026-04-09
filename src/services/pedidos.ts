import { apiFetch } from './api'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type PedidoStatus =
  | 'Pendente'
  | 'Confirmado'
  | 'EmPreparo'
  | 'AEntregar'
  | 'Entregue'
  | 'Cancelado'

export interface PedidoItem {
  id: number
  produtoId: number
  produtoNome: string
  quantidade: number
  precoUnitario: number
  descontoAplicado: number
  subtotal: number
  promocaoId: number | null
}

export interface PedidoStatusHistorico {
  statusAnterior: PedidoStatus | null
  statusNovo: PedidoStatus
  alteradoPorUserId: number
  observacao: string | null
  alteradoEm: string
}

export interface Pedido {
  id: number
  userId: number
  enderecoEntregaId: number | null
  status: PedidoStatus
  formaPagamento: string | null
  subtotal: number
  descontoTotal: number
  valorFrete: number
  total: number
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
  itens: PedidoItem[]
  statusHistorico: PedidoStatusHistorico[]
}

export interface PedidoItemInput {
  produtoId: number
  quantidade: number
  promocaoId?: number | null
}

export interface PedidoCreateInput {
  enderecoEntregaId?: number | null
  formaPagamento?: string
  observacoes?: string
  itens: PedidoItemInput[]
}

export interface PedidoStatusUpdateInput {
  status: PedidoStatus
  observacao?: string
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export const getPedidos = (status?: PedidoStatus, page = 1, pageSize = 20) => {
  const q = new URLSearchParams()
  if (status) q.set('status', status)
  q.set('page', String(page))
  q.set('pageSize', String(pageSize))
  return apiFetch<PagedResult<Pedido>>(`/api/pedidos?${q.toString()}`)
}

export const getPedido = (id: number) =>
  apiFetch<Pedido>(`/api/pedidos/${id}`)

export const createPedido = (data: PedidoCreateInput) =>
  apiFetch<Pedido>('/api/pedidos', { method: 'POST', body: JSON.stringify(data) })

export const updatePedidoStatus = (id: number, data: PedidoStatusUpdateInput) =>
  apiFetch<Pedido>(`/api/pedidos/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) })

export const getPedidoHistoricoStatus = (id: number) =>
  apiFetch<PedidoStatusHistorico[]>(`/api/admin/pedidos/${id}/historico-status`)

import { apiFetch, apiUpload, type ApiResponse } from './api'

// ── Paginação ─────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// ── Produto ───────────────────────────────────────────────────────────────────

export interface PromocaoVigente {
  id: number
  nome: string
  tipoDesconto: 'Percentual' | 'ValorFixo'
  valorDesconto: number
}

export interface Product {
  id: number
  nome: string
  descricao: string
  preco: number
  precoOriginal?: number
  categoria: string
  marca?: string
  unidadeMedida: string
  codigoBarras?: string
  pesoKg?: number
  destaque: boolean
  imagemUrl: string
  isAtivo: boolean
  isVisivel: boolean
  criadoEm: string
  atualizadoEm: string
  promocaoVigente?: PromocaoVigente | null
}

export type ProductCreateInput = {
  nome: string
  descricao: string
  preco: number
  categoria: string
  marca?: string
  unidadeMedida: string
  codigoBarras?: string
  pesoKg?: number | null
  destaque: boolean
  isVisivel: boolean
  imagemUrl: string
}

export type ProductUpdateInput = ProductCreateInput

export const UNIDADES = ['UN', 'KG', 'G', 'L', 'ML', 'CX', 'PCT', 'DZ']

export interface PriceHistoryEntry {
  id: number
  precoAnterior: number
  precoNovo: number
  alteradoPorUserId: number
  alteradoEm: string
}

export const CATEGORIES = [
  'Frios',
  'Tábuas',
  'Doces',
  'Grãos e Castanhas',
  'Bebidas',
  'Vinhos',
  'Cervejas',
  'Cachaças',
  'Não Alcoólicos',
]

// ── Upload ────────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string
  nomeArquivo: string
  tamanhoBytes: number
  tipoConteudo: string
}

export interface UploadMultipleResult {
  sucesso: UploadResult[]
  falhas: { nomeOriginal: string; motivo: string }[]
}

export function uploadImage(file: File): Promise<ApiResponse<UploadResult>> {
  const formData = new FormData()
  formData.append('file', file)
  return apiUpload<UploadResult>('/api/upload', formData)
}

export function uploadMultiple(files: File[]): Promise<ApiResponse<UploadMultipleResult>> {
  const formData = new FormData()
  files.forEach((f) => formData.append('arquivos', f))
  return apiUpload<UploadMultipleResult>('/api/upload/multiplos', formData)
}

// ── Produtos — Catálogo público ───────────────────────────────────────────────

export interface PublicProductsParams {
  categoria?: string
  marca?: string
  destaque?: boolean
}

export const getPublicProducts = (params?: PublicProductsParams) => {
  const query = new URLSearchParams()
  if (params?.categoria) query.set('categoria', params.categoria)
  if (params?.marca) query.set('marca', params.marca)
  if (params?.destaque !== undefined) query.set('destaque', String(params.destaque))
  const qs = query.toString()
  return apiFetch<Product[]>(`/api/produtos${qs ? `?${qs}` : ''}`)
}

// ── Catálogo — Filtros ────────────────────────────────────────────────────────

export interface CatalogFilters {
  marcas: string[]
  categorias: string[]
  tipos: string[]
  sabores: string[]
  unidadesMedida: string[]
  nacionalidades: { id: number; nome: string; imagemUrl: string }[]
}

export const getCatalogFilters = () =>
  apiFetch<CatalogFilters>('/api/catalogo/filtros')

// ── Produtos — Admin ──────────────────────────────────────────────────────────

export interface GetProductsParams {
  page?: number
  pageSize?: number
  categoria?: string
  marca?: string
  busca?: string
  destaque?: boolean
}

export const getProducts = (params: GetProductsParams = {}) => {
  const { page = 1, pageSize = 50, categoria, marca, busca, destaque } = params
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (categoria) q.set('categoria', categoria)
  if (marca) q.set('marca', marca)
  if (busca) q.set('busca', busca)
  if (destaque !== undefined) q.set('destaque', String(destaque))
  return apiFetch<PagedResult<Product>>(`/api/admin/produtos?${q}`)
}

export const createProduct = (data: ProductCreateInput) =>
  apiFetch<Product>('/api/admin/produtos', { method: 'POST', body: JSON.stringify(data) })

export const updateProduct = (id: number, data: ProductUpdateInput) =>
  apiFetch<Product>(`/api/admin/produtos/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const toggleProductVisibility = (id: number, isVisivel: boolean) =>
  apiFetch<Product>(`/api/admin/produtos/${id}/visibilidade`, {
    method: 'PATCH',
    body: JSON.stringify({ isVisivel }),
  })

export const deleteProduct = (id: number) =>
  apiFetch<null>(`/api/admin/produtos/${id}`, { method: 'DELETE' })

export const getProductPriceHistory = (id: number, page = 1, pageSize = 10) =>
  apiFetch<PagedResult<PriceHistoryEntry>>(
    `/api/admin/produtos/${id}/historico-preco?page=${page}&pageSize=${pageSize}`,
  )

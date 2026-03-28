import { apiFetch, apiUpload, type ApiResponse } from './api'

export interface Product {
  id: number
  nome: string
  descricao: string
  preco: number
  categoria: string
  imagemUrl: string
  estoque: number
  isAtivo: boolean
  criadoEm: string
  atualizadoEm: string
}

export type ProductCreateInput = {
  nome: string
  descricao: string
  preco: number
  categoria: string
  imagemUrl: string
  estoque: number
}

export type ProductUpdateInput = ProductCreateInput & {
  isAtivo: boolean
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

export interface UploadResult {
  url: string
  fileName: string
  tipo: string
  tamanhoBytes: number
}

export function uploadImage(file: File): Promise<ApiResponse<UploadResult>> {
  const formData = new FormData()
  formData.append('file', file)
  return apiUpload<UploadResult>('/api/upload', formData)
}

export const getProducts = () =>
  apiFetch<Product[]>('/api/produto')

export const createProduct = (data: ProductCreateInput) =>
  apiFetch<Product>('/api/produto', { method: 'POST', body: JSON.stringify(data) })

export const updateProduct = (id: number, data: ProductUpdateInput) =>
  apiFetch<Product>(`/api/produto/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteProduct = (id: number) =>
  apiFetch<null>(`/api/produto/${id}`, { method: 'DELETE' })

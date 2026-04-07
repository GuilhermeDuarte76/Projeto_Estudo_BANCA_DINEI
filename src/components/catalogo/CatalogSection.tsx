import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '../../services/api'
import SectionDivider from '../layout/SectionDivider'
import ProdutoCard, { type ProdutoPublico } from './ProdutoCard'

interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

interface Props {
  titulo: string
  subtituloItalico: string
  categoria: string
}

export default function CatalogSection({ titulo, subtituloItalico, categoria }: Props) {
  const [produtos, setProdutos] = useState<ProdutoPublico[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ categoria, page: String(page), pageSize: '20' })
    apiFetch<PagedResult<ProdutoPublico>>(`/api/produtos?${params}`)
      .then((res) => {
        if (res.success) {
          setProdutos(res.data.items)
          setTotalPages(res.data.totalPages)
        } else {
          setError(res.message || 'Erro ao carregar produtos.')
        }
      })
      .catch(() => setError('Erro de conexão com o servidor.'))
      .finally(() => setLoading(false))
  }, [categoria, page])

  return (
    <section className="bg-beige pt-28 pb-16 px-6 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-10"
        >
          <p className="type-overline text-gold-primary mb-4">Nosso cardápio</p>
          <h2 className="type-h1 text-graphite">
            {titulo}
            <br />
            <span className="font-subtitle italic font-normal text-bordeaux">
              {subtituloItalico}
            </span>
          </h2>
        </motion.div>

        <SectionDivider className="mb-10 -mt-2" />

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-cream/60 animate-pulse border border-gold-primary/10"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="type-body text-graphite/50">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && produtos.length === 0 && (
          <div className="text-center py-20">
            <p className="type-body text-graphite/50">Nenhum produto encontrado.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && produtos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {produtos.map((produto, i) => (
                <ProdutoCard key={produto.id} produto={produto} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-full border border-gold-primary/30 text-graphite/60 font-body text-xs uppercase tracking-wider disabled:opacity-30 hover:border-gold-primary/60 hover:text-gold-primary transition-all duration-200"
                >
                  Anterior
                </button>
                <span className="type-overline text-graphite/40 text-xs">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-full border border-gold-primary/30 text-graphite/60 font-body text-xs uppercase tracking-wider disabled:opacity-30 hover:border-gold-primary/60 hover:text-gold-primary transition-all duration-200"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

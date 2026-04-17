import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (page === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    setError(null)
    const params = new URLSearchParams({ categoria, page: String(page), pageSize: '20' })
    apiFetch<PagedResult<ProdutoPublico>>(`/api/produtos?${params}`)
      .then((res) => {
        if (res.success) {
          setProdutos(prev => page === 1 ? res.data.items : [...prev, ...res.data.items])
          setTotalPages(res.data.totalPages)
        } else {
          setError(res.message || 'Erro ao carregar produtos.')
        }
      })
      .catch(() => setError('Erro de conexão com o servidor.'))
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })
  }, [categoria, page])

  return (
    <>
      {/* Dark page hero */}
      <section className="relative bg-dark-warm pt-28 pb-12 px-6 lg:px-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(184,134,11,0.07) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-[1400px] mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="type-overline text-gold-primary mb-4">Nosso cardápio</p>
            <h1 className="type-display text-cream leading-tight">{titulo}</h1>
            <p className="font-subtitle italic text-bordeaux text-2xl lg:text-3xl mt-3">
              {subtituloItalico}
            </p>
          </motion.div>
        </div>
        <SectionDivider dark className="mt-10 -mb-px" />
      </section>

      {/* Product grid */}
      <section className="bg-beige pt-12 pb-16 px-6 lg:px-16">
        <div className="max-w-[1400px] mx-auto">
          {/* Loading skeleton — only for page 1 */}
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

              {/* Loading more spinner */}
              <AnimatePresence>
                {loadingMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center pt-10"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-gold-primary/20 border-t-gold-primary animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Load more button */}
              {!loadingMore && page < totalPages && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="flex justify-center pt-10"
                >
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-8 py-3 rounded-full border border-gold-primary/40 text-graphite/70 font-body font-bold text-xs uppercase tracking-widest hover:border-gold-primary/70 hover:text-gold-primary transition-all duration-300 hover:-translate-y-px"
                  >
                    Carregar mais produtos
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}

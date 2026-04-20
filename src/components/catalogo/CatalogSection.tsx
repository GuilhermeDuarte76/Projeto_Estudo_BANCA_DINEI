import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  StarIcon,
  XIcon,
  CaretDownIcon,
  CheckIcon,
} from '@phosphor-icons/react'
import { apiFetch } from '../../services/api'
import SectionDivider from '../layout/SectionDivider'
import ProdutoCard, { type ProdutoPublico } from './ProdutoCard'
import { EASE } from '../../lib/motion'

interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

interface Props {
  titulo: string
  subtituloItalico: string
  categoria: string
}

type SortOpt = { label: string; ordenarPor: string; ordem: string }
const SORT_OPTIONS: SortOpt[] = [
  { label: 'Padrão',       ordenarPor: 'criadoEm', ordem: 'desc' },
  { label: 'Nome A–Z',     ordenarPor: 'nome',     ordem: 'asc'  },
  { label: 'Menor preço',  ordenarPor: 'preco',    ordem: 'asc'  },
  { label: 'Maior preço',  ordenarPor: 'preco',    ordem: 'desc' },
]

type PopoverId = 'sort' | 'marca' | 'preco'

/* ── Light-theme popover trigger button ─────────────────────── */
function FilterBtn({
  label,
  isActive,
  isOpen,
  onClick,
}: {
  label: string
  isActive: boolean
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 h-10 px-4 rounded-lg border font-body text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
        isActive || isOpen
          ? 'border-gold-primary/60 bg-gold-primary/10 text-gold-primary'
          : 'border-gold-primary/25 bg-cream text-graphite/60 hover:border-gold-primary/45 hover:text-graphite/80'
      }`}
    >
      {label}
      <CaretDownIcon
        size={10}
        weight="bold"
        className={`opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  )
}

/* ── Light-theme popover panel ──────────────────────────────── */
function FilterPanel({
  children,
  alignRight = false,
}: {
  children: React.ReactNode
  alignRight?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`absolute top-full mt-2 z-50 min-w-[190px] max-w-[min(280px,calc(100vw-48px))] rounded-xl border border-gold-primary/20 bg-cream shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden ${
        alignRight ? 'right-0' : 'left-0'
      }`}
    >
      {children}
    </motion.div>
  )
}

/* ── Light-theme popover option ─────────────────────────────── */
function FilterOpt({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left font-body text-xs transition-colors ${
        active
          ? 'bg-gold-primary/10 text-gold-primary'
          : 'text-graphite/70 hover:bg-gold-primary/[0.07] hover:text-graphite'
      }`}
    >
      <span
        className={`w-[5px] h-[5px] rounded-full flex-shrink-0 transition-colors ${
          active ? 'bg-gold-primary' : 'bg-gold-primary/25'
        }`}
      />
      {label}
    </button>
  )
}

/* ── Main component ─────────────────────────────────────────── */
export default function CatalogSection({ titulo, subtituloItalico, categoria }: Props) {
  /* products */
  const [produtos, setProdutos] = useState<ProdutoPublico[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* filters */
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [marcaFilter, setMarcaFilter] = useState('')
  const [destaqueFilter, setDestaqueFilter] = useState(false)
  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')
  const [precoMinDebounced, setPrecoMinDebounced] = useState('')
  const [precoMaxDebounced, setPrecoMaxDebounced] = useState('')
  const [sortIdx, setSortIdx] = useState(0)
  const [availableMarcas, setAvailableMarcas] = useState<string[]>([])

  /* popover */
  const [openPopover, setOpenPopover] = useState<PopoverId | null>(null)
  const filterRowRef = useRef<HTMLDivElement>(null)

  /* close popover on outside click */
  useEffect(() => {
    if (!openPopover) return
    const handler = (e: MouseEvent) => {
      if (filterRowRef.current && !filterRowRef.current.contains(e.target as Node)) {
        setOpenPopover(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openPopover])

  /* debounce busca */
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscaDebounced(busca)
      setPage(1)
    }, 380)
    return () => clearTimeout(t)
  }, [busca])

  /* debounce precos */
  useEffect(() => {
    const t = setTimeout(() => {
      setPrecoMinDebounced(precoMin)
      setPage(1)
    }, 500)
    return () => clearTimeout(t)
  }, [precoMin])

  useEffect(() => {
    const t = setTimeout(() => {
      setPrecoMaxDebounced(precoMax)
      setPage(1)
    }, 500)
    return () => clearTimeout(t)
  }, [precoMax])

  /* discovery fetch for available marcas */
  useEffect(() => {
    const params = new URLSearchParams({ categoria, pageSize: '200' })
    apiFetch<PagedResult<ProdutoPublico>>(`/api/produtos?${params}`)
      .then((res) => {
        if (res.success) {
          const marcas = [
            ...new Set(res.data.items.map((p) => p.marca).filter((m): m is string => !!m)),
          ].sort()
          setAvailableMarcas(marcas)
        }
      })
      .catch(() => {})
  }, [categoria])

  /* main fetch */
  useEffect(() => {
    if (page === 1) setLoading(true)
    else setLoadingMore(true)
    setError(null)

    const sort = SORT_OPTIONS[sortIdx]
    const params = new URLSearchParams({ categoria, page: String(page), pageSize: '20' })
    if (buscaDebounced.trim()) params.set('busca', buscaDebounced.trim())
    if (marcaFilter) params.set('marca', marcaFilter)
    if (destaqueFilter) params.set('destaque', 'true')
    if (precoMinDebounced) params.set('precoMin', precoMinDebounced)
    if (precoMaxDebounced) params.set('precoMax', precoMaxDebounced)
    if (sortIdx > 0) {
      params.set('ordenarPor', sort.ordenarPor)
      params.set('ordem', sort.ordem)
    }

    apiFetch<PagedResult<ProdutoPublico>>(`/api/produtos?${params}`)
      .then((res) => {
        if (res.success) {
          setProdutos((prev) => (page === 1 ? res.data.items : [...prev, ...res.data.items]))
          setTotalPages(res.data.totalPages)
          setTotalCount(res.data.totalCount)
        } else {
          setError(res.message || 'Erro ao carregar produtos.')
        }
      })
      .catch(() => setError('Erro de conexão com o servidor.'))
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })
  }, [categoria, page, buscaDebounced, marcaFilter, destaqueFilter, precoMinDebounced, precoMaxDebounced, sortIdx])

  /* derived labels */
  const sortLabel = sortIdx === 0 ? 'Ordenar' : SORT_OPTIONS[sortIdx].label
  const marcaLabel = marcaFilter || 'Marca'
  const precoLabel =
    precoMin && precoMax
      ? `R$${precoMin}–${precoMax}`
      : precoMin
      ? `≥ R$${precoMin}`
      : precoMax
      ? `≤ R$${precoMax}`
      : 'Preço'

  const hasFilters = !!(busca || marcaFilter || destaqueFilter || precoMin || precoMax || sortIdx !== 0)

  const clearFilters = () => {
    setBusca('')
    setBuscaDebounced('')
    setMarcaFilter('')
    setDestaqueFilter(false)
    setPrecoMin('')
    setPrecoMax('')
    setPrecoMinDebounced('')
    setPrecoMaxDebounced('')
    setSortIdx(0)
    setPage(1)
    setOpenPopover(null)
  }

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
      <section className="bg-beige pt-10 pb-16 px-6 lg:px-16">
        <div className="max-w-[1400px] mx-auto">

          {/* ── Filter bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className="mb-8"
          >
            <div ref={filterRowRef} className="flex flex-col gap-3">

              {/* Row 1: Search */}
              <div className="relative">
                <MagnifyingGlassIcon
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-primary/50 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Buscar por nome ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full h-10 pl-10 pr-10 rounded-lg border border-gold-primary/25 bg-cream font-body text-sm text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-gold-primary/55 focus:bg-white transition-all duration-200"
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite/40 hover:text-graphite/70 transition-colors"
                  >
                    <XIcon size={13} weight="bold" />
                  </button>
                )}
              </div>

              {/* Row 2: Filter buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Destaques toggle */}
                <button
                  type="button"
                  onClick={() => { setDestaqueFilter((d) => !d); setPage(1) }}
                  className={`flex items-center gap-2 h-10 px-4 rounded-lg border font-body text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    destaqueFilter
                      ? 'border-gold-primary/60 bg-gold-primary/10 text-gold-primary'
                      : 'border-gold-primary/25 bg-cream text-graphite/60 hover:border-gold-primary/45 hover:text-graphite/80'
                  }`}
                >
                  <StarIcon size={11} weight={destaqueFilter ? 'fill' : 'regular'} />
                  Destaques
                </button>

                {/* Separator (desktop) */}
                <div className="hidden sm:block w-px h-5 bg-gold-primary/20 flex-shrink-0" />

                {/* Ordenar */}
                <div className="relative flex-shrink-0">
                  <FilterBtn
                    label={sortLabel}
                    isActive={sortIdx !== 0}
                    isOpen={openPopover === 'sort'}
                    onClick={() => setOpenPopover((o) => (o === 'sort' ? null : 'sort'))}
                  />
                  <AnimatePresence>
                    {openPopover === 'sort' && (
                      <FilterPanel>
                        {SORT_OPTIONS.map((opt, i) => (
                          <FilterOpt
                            key={i}
                            label={opt.label}
                            active={sortIdx === i}
                            onClick={() => { setSortIdx(i); setPage(1); setOpenPopover(null) }}
                          />
                        ))}
                      </FilterPanel>
                    )}
                  </AnimatePresence>
                </div>

                {/* Marca */}
                {availableMarcas.length > 0 && (
                  <div className="relative flex-shrink-0">
                    <FilterBtn
                      label={marcaLabel}
                      isActive={marcaFilter !== ''}
                      isOpen={openPopover === 'marca'}
                      onClick={() => setOpenPopover((o) => (o === 'marca' ? null : 'marca'))}
                    />
                    <AnimatePresence>
                      {openPopover === 'marca' && (
                        <FilterPanel>
                          <FilterOpt
                            label="Todas as marcas"
                            active={marcaFilter === ''}
                            onClick={() => { setMarcaFilter(''); setPage(1); setOpenPopover(null) }}
                          />
                          <div className="h-px bg-gold-primary/10 mx-2" />
                          <div className="max-h-52 overflow-y-auto">
                            {availableMarcas.map((m) => (
                              <FilterOpt
                                key={m}
                                label={m}
                                active={marcaFilter === m}
                                onClick={() => { setMarcaFilter(m); setPage(1); setOpenPopover(null) }}
                              />
                            ))}
                          </div>
                        </FilterPanel>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Preço */}
                <div className="relative flex-shrink-0">
                  <FilterBtn
                    label={precoLabel}
                    isActive={!!(precoMin || precoMax)}
                    isOpen={openPopover === 'preco'}
                    onClick={() => setOpenPopover((o) => (o === 'preco' ? null : 'preco'))}
                  />
                  <AnimatePresence>
                    {openPopover === 'preco' && (
                      <FilterPanel alignRight>
                        <div className="p-3 flex flex-col gap-3">
                          <p className="type-overline text-graphite/40 text-[9px]">Faixa de preço</p>
                          <div className="flex flex-col gap-2">
                            <div>
                              <label className="type-overline text-graphite/40 text-[9px] block mb-1">De</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-xs text-graphite/40 pointer-events-none">
                                  R$
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={precoMin}
                                  onChange={(e) => setPrecoMin(e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gold-primary/20 bg-beige font-body text-xs text-graphite focus:outline-none focus:border-gold-primary/50 transition-colors"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="type-overline text-graphite/40 text-[9px] block mb-1">Até</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-xs text-graphite/40 pointer-events-none">
                                  R$
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="999"
                                  value={precoMax}
                                  onChange={(e) => setPrecoMax(e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-gold-primary/20 bg-beige font-body text-xs text-graphite focus:outline-none focus:border-gold-primary/50 transition-colors"
                                />
                              </div>
                            </div>
                            {(precoMin || precoMax) && (
                              <button
                                type="button"
                                onClick={() => { setPrecoMin(''); setPrecoMax('') }}
                                className="w-full py-1.5 border border-gold-primary/20 rounded-lg text-graphite/50 font-body text-[10px] uppercase tracking-wider hover:border-gold-primary/40 hover:text-graphite/70 transition-colors"
                              >
                                Limpar
                              </button>
                            )}
                          </div>
                        </div>
                      </FilterPanel>
                    )}
                  </AnimatePresence>
                </div>

                {/* Clear filters */}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 h-10 px-4 rounded-lg border border-bordeaux/30 text-bordeaux/70 font-body text-xs uppercase tracking-wider hover:border-bordeaux/55 hover:text-bordeaux transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  >
                    <XIcon size={11} weight="bold" />
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Results count */}
          {!loading && !error && (
            <motion.p
              key={totalCount}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="type-caption text-graphite/40 not-italic mb-6 text-sm"
            >
              {totalCount} {totalCount === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </motion.p>
          )}

          {/* Loading skeleton — only for page 1 */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[360px] rounded-2xl bg-cream/60 animate-pulse border border-gold-primary/10"
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
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-gold-primary underline underline-offset-4 hover:text-gold-primary/70 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
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

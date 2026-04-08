import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon, PencilSimpleIcon, TrashIcon, MagnifyingGlassIcon,
  WarningCircleIcon, EyeIcon, EyeSlashIcon, StarIcon, ClockIcon, XIcon,
  CheckCircleIcon, ArrowsClockwiseIcon, FunnelIcon, CaretDownIcon, CheckIcon,
} from '@phosphor-icons/react'
import {
  type Product,
  type ProductCreateInput,
  type PriceHistoryEntry,
  type CatalogFilters,
  type GetProductsParams,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
  getProductPriceHistory,
  getCatalogFilters,
} from '../../services/admin'
import ProductForm from '../../components/admin/ProductForm'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

// ── FilterSelect ──────────────────────────────────────────────────────────────
interface FilterSelectProps {
  placeholder: string
  value: string
  options: string[]
  onChange: (v: string) => void
}

function FilterSelect({ placeholder, value, options, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const active = !!value

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-body transition-all duration-200 whitespace-nowrap ${
          active
            ? 'border-gold-primary/45 text-gold-light bg-gold-primary/10'
            : 'border-gold-primary/15 text-cream/50 bg-white/5 hover:border-gold-primary/30 hover:text-cream/70'
        }`}
      >
        <span>{active ? value : placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="flex items-center"
        >
          <CaretDownIcon size={10} weight="bold" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[160px] max-h-64 overflow-y-auto rounded-2xl border border-gold-primary/20 bg-[#191309] shadow-[0_8px_32px_rgba(0,0,0,0.55)] py-1"
          >
            {/* "Todos" option */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className={`flex items-center justify-between w-full px-4 py-2 text-xs font-body transition-colors duration-150 ${
                !value
                  ? 'text-gold-light bg-gold-primary/10'
                  : 'text-cream/45 hover:text-cream/80 hover:bg-white/5'
              }`}
            >
              <span>Todos</span>
              {!value && <CheckIcon size={11} weight="bold" className="text-gold-primary" />}
            </button>

            {options.length > 0 && (
              <div className="my-1 h-px bg-gold-primary/8" />
            )}

            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`flex items-center justify-between w-full px-4 py-2 text-xs font-body transition-colors duration-150 ${
                  value === opt
                    ? 'text-gold-light bg-gold-primary/10'
                    : 'text-cream/65 hover:text-cream hover:bg-white/5'
                }`}
              >
                <span>{opt}</span>
                {value === opt && <CheckIcon size={11} weight="bold" className="text-gold-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR')
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white/4 border border-gold-primary/10 rounded-2xl px-4 py-3">
      <p className="type-overline text-[9px] text-cream/35 tracking-widest uppercase mb-1">{label}</p>
      <p className={`font-display font-bold text-2xl ${accent ?? 'text-cream'}`}>{value}</p>
    </div>
  )
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [marcaFilter, setMarcaFilter] = useState('')
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters | null>(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formServerError, setFormServerError] = useState('')

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, message })
    toastTimer.current = setTimeout(() => setToast(null), 4500)
  }

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const [historyProduct, setHistoryProduct] = useState<Product | null>(null)
  const [history, setHistory] = useState<PriceHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchProducts = useCallback(async (params: GetProductsParams = {}) => {
    setLoading(true)
    setError('')
    const res = await getProducts(params)
    if (res.success && res.data) {
      setProducts(res.data.items ?? [])
      setTotalCount(res.data.totalCount)
      setTotalPages(res.data.totalPages)
      setPage(res.data.page)
    } else {
      setError(res.message || 'Erro ao carregar produtos.')
    }
    setLoading(false)
  }, [])

  // Ref para acessar estado atual dentro de callbacks sem stale closures
  const stateRef = useRef({ categoryFilter, marcaFilter, search, page, pageSize })
  stateRef.current = { categoryFilter, marcaFilter, search, page, pageSize }

  const buildParams = (overrides: Partial<GetProductsParams> = {}): GetProductsParams => {
    const { categoryFilter: cat, marcaFilter: marca, search: busca, page: pg, pageSize: ps } = stateRef.current
    return {
      categoria: cat || undefined,
      marca: marca || undefined,
      busca: busca || undefined,
      page: pg,
      pageSize: ps,
      ...overrides,
    }
  }

  const refetch = useCallback(() => {
    fetchProducts(buildParams())
  }, [fetchProducts]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce ref para busca por texto
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Re-fetch quando categoria ou marca mudam — reseta para página 1
  useEffect(() => {
    setPage(1)
    fetchProducts(buildParams({ page: 1 }))
  }, [categoryFilter, marcaFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch com debounce quando busca muda — reseta para página 1
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchProducts(buildParams({ page: 1 }))
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch quando página muda + scroll ao topo
  useEffect(() => {
    fetchProducts(buildParams({ page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch quando pageSize muda — reseta para página 1
  useEffect(() => {
    setPage(1)
    fetchProducts(buildParams({ page: 1, pageSize }))
  }, [pageSize]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getCatalogFilters().then((res) => {
      if (res.success) setCatalogFilters(res.data)
    })
  }, [])

  const handleSave = async (data: ProductCreateInput) => {
    setFormLoading(true)
    setFormServerError('')
    const res = editTarget
      ? await updateProduct(editTarget.id, data)
      : await createProduct(data)
    setFormLoading(false)

    if (res.success) {
      setFormOpen(false)
      setEditTarget(null)
      refetch()
      showToast('success', res.message || 'Produto salvo com sucesso')
    } else {
      const raw = res as unknown as Record<string, unknown>
      let msg = res.message
      if (!msg && raw.errors && typeof raw.errors === 'object') {
        const msgs = Object.values(raw.errors as Record<string, string[]>).flat()
        msg = msgs.join(' ')
      }
      if (!msg && typeof raw.title === 'string') msg = raw.title
      setFormServerError(msg || 'Ocorreu um erro inesperado. Tente novamente.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    await deleteProduct(deleteTarget.id)
    setDeleteLoading(false)
    setDeleteTarget(null)
    refetch()
  }

  const handleToggleVisibility = async (p: Product) => {
    setTogglingId(p.id)
    await toggleProductVisibility(p.id, !p.isVisivel)
    setTogglingId(null)
    refetch()
  }

  const openCreate = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (p: Product) => { setEditTarget(p); setFormOpen(true) }

  const openHistory = async (p: Product) => {
    setHistoryProduct(p)
    setHistoryLoading(true)
    setHistory([])
    const res = await getProductPriceHistory(p.id)
    if (res.success) setHistory(res.data?.items ?? [])
    setHistoryLoading(false)
  }

  const hasActiveFilters = !!(search || categoryFilter || marcaFilter)

  // Stats
  const totalVisible = products.filter((p) => p.isVisivel).length
  const totalHidden = products.filter((p) => !p.isVisivel).length
  const totalFeatured = products.filter((p) => p.destaque).length

  return (
    <div className="space-y-5">

      {/* ── Stats row ─────────────────────────────────────────────── */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={products.length} />
          <StatCard label="Visíveis" value={totalVisible} accent="text-emerald-400" />
          <StatCard label="Ocultos" value={totalHidden} accent="text-cream/40" />
          <StatCard label="Destaques" value={totalFeatured} accent="text-gold-light" />
        </div>
      )}

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: search + actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-primary/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, categoria ou marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl pl-9 pr-4 py-2.5 text-cream placeholder-cream/25 text-sm outline-none transition-[border-color] duration-300"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={refetch}
              disabled={loading}
              title="Atualizar lista"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200 disabled:opacity-40"
            >
              <ArrowsClockwiseIcon size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest hover:shadow-gold transition-all duration-300"
            >
              <PlusIcon size={14} weight="bold" />
              Novo produto
            </motion.button>
          </div>
        </div>

        {/* Row 2: predefined filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FunnelIcon size={12} className="text-gold-primary/40 shrink-0" weight={hasActiveFilters ? 'fill' : 'regular'} />

          {/* Category filter */}
          <FilterSelect
            placeholder="Categoria"
            value={categoryFilter}
            options={catalogFilters?.categorias ?? []}
            onChange={setCategoryFilter}
          />

          {/* Marca filter */}
          <FilterSelect
            placeholder="Marca"
            value={marcaFilter}
            options={catalogFilters?.marcas ?? []}
            onChange={setMarcaFilter}
          />

          {/* Clear filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setSearch(''); setCategoryFilter(''); setMarcaFilter('') }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/40 text-xs font-body transition-all duration-200"
              >
                <XIcon size={10} />
                Limpar
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"
          >
            <WarningCircleIcon size={16} weight="fill" className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading skeleton ──────────────────────────────────────── */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Mobile: Card list ─────────────────────────────────────── */}
      {!loading && !error && (
        <div className="md:hidden space-y-2">
          {products.length === 0 ? (
            <div className="py-14 text-center text-cream/30 text-sm font-body">
              {hasActiveFilters ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
            </div>
          ) : (
            products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.22, ease: EASE }}
                className="rounded-2xl border border-gold-primary/12 bg-white/3 overflow-hidden"
              >
                {/* Card body */}
                <div className="flex gap-3 px-4 pt-4 pb-3">
                  {p.imagemUrl ? (
                    <img
                      src={p.imagemUrl}
                      alt={p.nome}
                      className="w-12 h-12 rounded-xl object-cover border border-gold-primary/15 shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-gold-primary/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-cream/90 font-body font-medium text-sm leading-snug">{p.nome}</p>
                      {p.isVisivel
                        ? <EyeIcon size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        : <EyeSlashIcon size={14} className="text-cream/25 shrink-0 mt-0.5" />
                      }
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-gold-primary/10 text-gold-light type-overline text-[9px] tracking-widest">
                        {p.categoria}
                      </span>
                      {p.marca && (
                        <span className="text-cream/30 text-xs font-body">{p.marca}</span>
                      )}
                      {p.destaque && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gold-primary/15 text-gold-light type-overline text-[8px] tracking-widest">
                          <StarIcon size={8} weight="fill" />Destaque
                        </span>
                      )}
                    </div>
                    <p className="text-gold-light font-bold text-sm tabular-nums mt-1">
                      {formatCurrency(p.preco)}
                      <span className="text-cream/30 font-normal text-xs ml-1">/ {p.unidadeMedida || 'UN'}</span>
                    </p>
                  </div>
                </div>

                {/* Card actions */}
                <div className="flex items-center border-t border-gold-primary/8 px-4 py-2 gap-1">
                  <button
                    onClick={() => openHistory(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-cream/45 hover:text-gold-light hover:bg-white/5 transition-all duration-200 text-xs font-body"
                  >
                    <ClockIcon size={13} />
                    Histórico
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(p)}
                    disabled={togglingId === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-cream/45 hover:text-gold-light hover:bg-white/5 transition-all duration-200 text-xs font-body disabled:opacity-40"
                  >
                    {togglingId === p.id
                      ? <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                      : p.isVisivel
                        ? <EyeSlashIcon size={13} />
                        : <EyeIcon size={13} />
                    }
                    {p.isVisivel ? 'Ocultar' : 'Exibir'}
                  </button>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200"
                    >
                      <PencilSimpleIcon size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-500/20 text-cream/40 hover:text-red-400 hover:border-red-500/50 transition-all duration-200"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── Desktop: Table ────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-gold-primary/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-primary/15 bg-white/2">
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Produto</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Marca</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Categoria</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Preço</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Un.</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Visível</th>
                <th className="px-5 py-3.5 w-36" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-cream/30 text-sm font-body">
                      {hasActiveFilters ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
                    </td>
                  </tr>
                ) : (
                  products.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.22, ease: EASE }}
                      className="border-b border-gold-primary/8 last:border-0 hover:bg-white/3 transition-colors duration-200 group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.imagemUrl ? (
                            <img
                              src={p.imagemUrl}
                              alt={p.nome}
                              className="w-9 h-9 rounded-lg object-cover border border-gold-primary/15 shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/5 border border-gold-primary/10 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="text-cream/90 font-body truncate max-w-[180px] block">{p.nome}</span>
                            {p.destaque && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gold-primary/15 text-gold-light type-overline text-[8px] tracking-widest mt-0.5">
                                <StarIcon size={8} weight="fill" />Destaque
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-cream/50 font-body">
                        {p.marca || <span className="text-cream/20">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-gold-primary/10 text-gold-light type-overline text-[9px] tracking-widest">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-cream/70 font-body tabular-nums">
                        {formatCurrency(p.preco)}
                      </td>
                      <td className="px-5 py-3.5 text-cream/40 font-body text-xs">
                        {p.unidadeMedida || 'UN'}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.isVisivel
                          ? <EyeIcon size={14} className="text-emerald-400" />
                          : <EyeSlashIcon size={14} className="text-cream/25" />
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => openHistory(p)}
                            title="Histórico de preço"
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-200"
                          >
                            <ClockIcon size={13} />
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(p)}
                            disabled={togglingId === p.id}
                            title={p.isVisivel ? 'Ocultar' : 'Tornar visível'}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-200 disabled:opacity-40"
                          >
                            {togglingId === p.id
                              ? <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                              : p.isVisivel
                                ? <EyeSlashIcon size={13} />
                                : <EyeIcon size={13} />
                            }
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            title="Editar"
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-200"
                          >
                            <PencilSimpleIcon size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            title="Desativar"
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-red-500/20 text-cream/40 hover:text-red-400 hover:border-red-500/50 transition-all duration-200"
                          >
                            <TrashIcon size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination bar ────────────────────────────────────────── */}
      {!loading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">

          {/* Info + page size */}
          <div className="flex items-center gap-3">
            <p className="type-overline text-[9px] text-cream/30 tracking-widest whitespace-nowrap">
              {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalCount)} de {totalCount}
            </p>
            <div className="flex items-center gap-1.5">
              {[10, 20, 50, 100].map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`px-2.5 py-1 rounded-lg type-overline text-[9px] tracking-widest transition-all duration-150 ${
                    pageSize === size
                      ? 'bg-gold-primary/15 text-gold-light border border-gold-primary/30'
                      : 'border border-gold-primary/10 text-cream/30 hover:border-gold-primary/25 hover:text-cream/60'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Page navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gold-primary/15 text-cream/40 hover:text-gold-light hover:border-gold-primary/40 transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {/* Page numbers */}
              {(() => {
                const pages: (number | '…')[] = []
                const delta = 1
                const left = page - delta
                const right = page + delta

                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                    pages.push(i)
                  } else if (pages[pages.length - 1] !== '…') {
                    pages.push('…')
                  }
                }

                return pages.map((p, idx) =>
                  p === '…' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-cream/25 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-body transition-all duration-150 ${
                        page === p
                          ? 'bg-gold-primary/15 text-gold-light border border-gold-primary/35 font-bold'
                          : 'border border-gold-primary/10 text-cream/40 hover:border-gold-primary/30 hover:text-cream/70'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )
              })()}

              {/* Next */}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gold-primary/15 text-cream/40 hover:text-gold-light hover:border-gold-primary/40 transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2L8 6l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Modals & Dialogs ──────────────────────────────────────── */}
      <ProductForm
        open={formOpen}
        initial={editTarget}
        loading={formLoading}
        serverError={formServerError}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditTarget(null); setFormServerError('') }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Desativar produto"
        description={`Tem certeza que deseja desativar "${deleteTarget?.nome}"? O produto ficará oculto no catálogo.`}
        confirmLabel="Desativar produto"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Toast ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.3, ease: EASE }}
            className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-body max-w-sm w-full pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-dark-warm border-emerald-500/30'
                : 'bg-dark-warm border-red-500/30'
            }`}
            role="status"
          >
            <span className={`shrink-0 ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {toast.type === 'success'
                ? <CheckCircleIcon size={18} weight="fill" />
                : <WarningCircleIcon size={18} weight="fill" />
              }
            </span>
            <span className={toast.type === 'success' ? 'text-cream/90' : 'text-red-200'}>
              {toast.message}
            </span>
            <button
              onClick={() => setToast(null)}
              className="ml-auto shrink-0 text-cream/30 hover:text-cream/70 transition-colors duration-200"
            >
              <XIcon size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Price history modal ───────────────────────────────────── */}
      <AnimatePresence>
        {historyProduct && (
          <>
            <motion.div
              key="hist-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[70] bg-black/75"
              onClick={() => setHistoryProduct(null)}
            />
            <motion.div
              key="hist-modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="fixed inset-0 z-[71] flex items-end md:items-center justify-center px-4 py-4 md:py-8 pointer-events-none"
            >
              <div
                className="relative w-full max-w-lg bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold pointer-events-auto max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0 border-b border-gold-primary/10">
                  <div>
                    <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">Histórico de preço</p>
                    <h2 className="font-display font-bold text-xl text-cream leading-tight truncate max-w-[280px]">
                      {historyProduct.nome}
                    </h2>
                    <p className="text-cream/40 text-xs font-body mt-0.5">
                      Preço atual: {formatCurrency(historyProduct.preco)}
                    </p>
                  </div>
                  <button
                    onClick={() => setHistoryProduct(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300 shrink-0"
                  >
                    <XIcon size={14} />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-5">
                  {historyLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <p className="text-cream/30 text-sm font-body text-center py-8">
                      Nenhuma alteração de preço registrada.
                    </p>
                  ) : (
                    <div className="rounded-xl border border-gold-primary/10 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gold-primary/10 bg-white/2">
                            <th className="text-left px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Anterior</th>
                            <th className="text-left px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Novo</th>
                            <th className="text-left px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((h) => (
                            <tr key={h.id} className="border-b border-gold-primary/8 last:border-0">
                              <td className="px-4 py-2.5 text-cream/40 font-body tabular-nums line-through">
                                {formatCurrency(h.precoAnterior)}
                              </td>
                              <td className="px-4 py-2.5 text-gold-light font-body tabular-nums font-bold">
                                {formatCurrency(h.precoNovo)}
                              </td>
                              <td className="px-4 py-2.5 text-cream/30 font-body text-xs">
                                {formatDateTime(h.alteradoEm)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

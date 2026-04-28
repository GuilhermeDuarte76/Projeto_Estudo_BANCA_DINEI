import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon,
  ClockIcon,
  XIcon,
  ArrowsClockwiseIcon,
  FunnelIcon,
  CaretDownIcon,
  CheckIcon,
  CopyIcon,
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
import { AdminToast, useAdminToast } from '../../components/admin/AdminToast'
import { EASE } from '../../lib/motion'

type StatusScope = 'all' | 'online' | 'cardapio' | 'hidden'

interface FilterSelectProps {
  placeholder: string
  value: string
  options: string[]
  onChange: (v: string) => void
  disabled?: boolean
}

function FilterSelect({ placeholder, value, options, onChange, disabled = false }: FilterSelectProps) {
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
  const canOpen = !disabled && options.length > 0
  const label = active ? value : disabled ? `${placeholder} indisponível` : placeholder

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!canOpen) return
          setOpen((o) => !o)
        }}
        className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm transition-all duration-200 ${
          disabled
            ? 'cursor-not-allowed border-[#3a2b22] bg-[#1c120d] text-[#786b5f] opacity-70'
            :
          active
            ? 'border-[#c4a05e] bg-[#3a2818] text-[#f8f2e8] shadow-[0_10px_24px_rgba(0,0,0,0.16)]'
            : 'border-[#433127] bg-[#241711] text-[#dbcfc0] hover:border-[#8e7243] hover:text-[#fff8ef]'
        }`}
      >
        <span>{label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} className="flex items-center">
          <CaretDownIcon size={12} weight="bold" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && canOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute left-0 top-[calc(100%+10px)] z-50 min-w-[220px] max-w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-[#433127] bg-[#18100c] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.34)]"
          >
            <div className="max-h-72 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false) }}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-sm transition-colors ${
                  !value ? 'bg-[#312115] text-[#fff4dd]' : 'text-[#d2c5b7] hover:bg-white/5 hover:text-[#fff8ef]'
                }`}
              >
                <span>Todos</span>
                {!value && <CheckIcon size={12} weight="bold" className="text-[#d9b36c]" />}
              </button>

              {options.length > 0 && <div className="my-2 h-px bg-white/6" />}

              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-sm transition-colors ${
                    value === opt ? 'bg-[#312115] text-[#fff4dd]' : 'text-[#d2c5b7] hover:bg-white/5 hover:text-[#fff8ef]'
                  }`}
                >
                  <span>{opt}</span>
                  {value === opt && <CheckIcon size={12} weight="bold" className="text-[#d9b36c]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR')
}

function normalizeOption(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function buildDistinctOptions(values: Array<string | null | undefined>) {
  const seen = new Map<string, string>()

  values.forEach((value) => {
    const normalized = normalizeOption(value)
    if (!normalized) return

    const key = normalized.toLocaleLowerCase('pt-BR')
    if (!seen.has(key)) {
      seen.set(key, normalized)
    }
  })

  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

function StatPill({
  label,
  value,
  hint,
  accent = 'text-[#fff8ef]',
}: {
  label: string
  value: number
  hint: string
  accent?: string
}) {
  return (
    <div className="min-h-[132px] rounded-[30px] border border-[#3b2c22] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-5 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
      <p className="type-overline text-[9px] uppercase tracking-[0.28em] text-[#b9ab99]">{label}</p>
      <p className={`mt-4 font-display text-[2rem] leading-none ${accent}`}>{value}</p>
      <p className="mt-4 max-w-[24ch] text-[12px] leading-relaxed text-[#b9ab99]">{hint}</p>
    </div>
  )
}

function StatusBadge({
  active,
  label,
  tone = 'default',
}: {
  active: boolean
  label: string
  tone?: 'default' | 'success' | 'muted'
}) {
  if (!active) return null

  const classes =
    tone === 'success'
      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
      : tone === 'muted'
      ? 'border-[#433127] bg-white/[0.04] text-[#c7baaa]'
        : 'border-[#c59c58]/20 bg-[#3a2818] text-[#f3d7a6]'

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] ${classes}`}>
      {label}
    </span>
  )
}

function ScopeChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-w-[150px] items-center justify-between rounded-full border px-5 py-3 text-left transition-all duration-200 ${
        active
          ? 'border-[#c59c58] bg-[#2f2015] text-[#fff7ea] shadow-[0_12px_28px_rgba(0,0,0,0.18)]'
          : 'border-[#3b2c22] bg-[#201510] text-[#cdbfaf] hover:border-[#8d7042] hover:text-[#fff8ef]'
      }`}
    >
      <span className="text-sm">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.2em] ${
        active ? 'bg-[#4b3521] text-[#f2d8ab]' : 'bg-white/5 text-[#b7a998] group-hover:text-[#fff1d4]'
      }`}>
        {count}
      </span>
    </button>
  )
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [analyticsProducts, setAnalyticsProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [marcaFilter, setMarcaFilter] = useState('')
  const [destaqueFilter, setDestaqueFilter] = useState(false)
  const [statusScope, setStatusScope] = useState<StatusScope>('all')
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters | null>(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [duplicateSource, setDuplicateSource] = useState<Product | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formServerError, setFormServerError] = useState('')

  const { toast, showToast } = useAdminToast()

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const [historyProduct, setHistoryProduct] = useState<Product | null>(null)
  const [history, setHistory] = useState<PriceHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!historyProduct) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setHistoryProduct(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [historyProduct])

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

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    const res = await getProducts({ page: 1, pageSize: 5000 })
    if (res.success && res.data) {
      setAnalyticsProducts(res.data.items ?? [])
    }
    setAnalyticsLoading(false)
  }, [])

  const stateRef = useRef({
    categoryFilter,
    marcaFilter,
    search,
    page,
    pageSize,
    destaqueFilter,
    statusScope,
  })

  stateRef.current = {
    categoryFilter,
    marcaFilter,
    search,
    page,
    pageSize,
    destaqueFilter,
    statusScope,
  }

  const buildParams = (overrides: Partial<GetProductsParams> = {}): GetProductsParams => {
    const {
      categoryFilter: cat,
      marcaFilter: marca,
      search: busca,
      page: currentPage,
      pageSize: currentPageSize,
      destaqueFilter: destaque,
      statusScope: scope,
    } = stateRef.current

    return {
      categoria: cat || undefined,
      marca: marca || undefined,
      busca: busca || undefined,
      page: currentPage,
      pageSize: currentPageSize,
      destaque: destaque ? true : undefined,
      isVisivel: scope === 'online' ? true : scope === 'hidden' ? false : undefined,
      isCardapio: scope === 'cardapio' ? true : undefined,
      ...overrides,
    }
  }

  const refreshAll = useCallback(() => {
    fetchProducts(buildParams())
    fetchAnalytics()
  }, [fetchProducts, fetchAnalytics])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchAnalytics()
    getCatalogFilters().then((res) => {
      if (res.success) setCatalogFilters(res.data)
    })
  }, [fetchAnalytics])

  useEffect(() => {
    setPage(1)
    fetchProducts(buildParams({ page: 1 }))
  }, [categoryFilter, marcaFilter, destaqueFilter, statusScope, fetchProducts])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchProducts(buildParams({ page: 1 }))
    }, 280)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, fetchProducts])

  useEffect(() => {
    fetchProducts(buildParams({ page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page, fetchProducts])

  useEffect(() => {
    setPage(1)
    fetchProducts(buildParams({ page: 1, pageSize }))
  }, [pageSize, fetchProducts])

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
      setDuplicateSource(null)
      refreshAll()
      showToast('success', res.message || 'Produto salvo com sucesso')
    } else {
      const raw = res as unknown as Record<string, unknown>
      let message = res.message
      if (!message && raw.errors && typeof raw.errors === 'object') {
        const messages = Object.values(raw.errors as Record<string, string[]>).flat()
        message = messages.join(' ')
      }
      if (!message && typeof raw.title === 'string') message = raw.title
      setFormServerError(message || 'Ocorreu um erro inesperado. Tente novamente.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const res = await deleteProduct(deleteTarget.id)
    setDeleteLoading(false)
    const nome = deleteTarget.nome
    setDeleteTarget(null)
    if (res.success) {
      showToast('success', `"${nome}" foi desativado.`)
      refreshAll()
    } else {
      showToast('error', res.message || 'Não foi possível desativar o produto.')
    }
  }

  const handleToggleVisibility = async (product: Product) => {
    setTogglingId(product.id)
    const res = await toggleProductVisibility(product.id, !product.isVisivel)
    setTogglingId(null)
    if (res.success) {
      refreshAll()
    } else {
      showToast('error', res.message || 'Não foi possível alterar a visibilidade.')
    }
  }

  const openCreate = () => { setEditTarget(null); setDuplicateSource(null); setFormOpen(true) }
  const openEdit = (product: Product) => { setEditTarget(product); setDuplicateSource(null); setFormOpen(true) }
  const openDuplicate = (product: Product) => { setDuplicateSource(product); setEditTarget(null); setFormOpen(true) }

  const openHistory = async (product: Product) => {
    setHistoryProduct(product)
    setHistoryLoading(true)
    setHistory([])
    const res = await getProductPriceHistory(product.id)
    if (res.success) setHistory(res.data?.items ?? [])
    setHistoryLoading(false)
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setMarcaFilter('')
    setDestaqueFilter(false)
    setStatusScope('all')
  }

  const hasActiveFilters = !!(
    search ||
    categoryFilter ||
    marcaFilter ||
    destaqueFilter ||
    statusScope !== 'all'
  )

  const analyticsSource = analyticsProducts.length > 0 ? analyticsProducts : products
  const totalAnalytics = analyticsSource.length
  const totalVisible = analyticsSource.filter((product) => product.isVisivel).length
  const totalHidden = analyticsSource.filter((product) => !product.isVisivel).length
  const totalCardapio = analyticsSource.filter((product) => product.isCardapio).length
  const totalFeatured = analyticsSource.filter((product) => product.destaque).length

  const categoryCounts = analyticsSource.reduce<Record<string, number>>((acc, product) => {
    acc[product.categoria] = (acc[product.categoria] ?? 0) + 1
    return acc
  }, {})

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const rangeStart = totalCount === 0 ? 0 : ((page - 1) * pageSize) + 1
  const rangeEnd = Math.min(page * pageSize, totalCount)

  const activeFilterPills = [
    search ? `Busca: ${search}` : null,
    categoryFilter ? `Categoria: ${categoryFilter}` : null,
    marcaFilter ? `Marca: ${marcaFilter}` : null,
    destaqueFilter ? 'Somente destaques' : null,
    statusScope === 'online' ? 'Somente loja online' : null,
    statusScope === 'cardapio' ? 'Somente cardápio' : null,
    statusScope === 'hidden' ? 'Somente ocultos' : null,
  ].filter(Boolean) as string[]

  const categoryOptions = buildDistinctOptions([
    ...analyticsProducts.map((product) => product.categoria),
    ...(catalogFilters?.categorias ?? []),
  ])

  const marcaOptions = buildDistinctOptions([
    ...analyticsProducts.map((product) => product.marca),
    ...(catalogFilters?.marcas ?? []),
  ])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] md:rounded-[40px] border border-[#3b2c22] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] shadow-[0_24px_65px_rgba(0,0,0,0.22)]">
        <div className="border-b border-[#34271f] bg-[radial-gradient(circle_at_top_left,rgba(197,156,88,0.14),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] px-4 py-5 md:px-7 md:py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <p className="type-overline text-[10px] uppercase tracking-[0.32em] text-[#c7b499]">Produtos</p>
              <h2 className="mt-3 max-w-[16ch] font-body text-[1.55rem] font-semibold leading-[1.08] text-[#fffaf2] sm:max-w-[18ch] sm:text-[1.75rem] md:text-[2.25rem]">
                Catálogo com leitura clara, filtros úteis e decisões rápidas
              </h2>
              <p className="mt-3 max-w-[58ch] text-[13px] leading-relaxed text-[#b8ab9b] md:text-sm">
                Os indicadores usam o catálogo inteiro para te dar contexto real, enquanto a lista abaixo fica focada no que você precisa encontrar e editar.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshAll}
                disabled={loading || analyticsLoading}
                title="Atualizar lista"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#433127] bg-white/[0.03] text-[#d1c3b3] transition-colors hover:border-[#8d7042] hover:text-[#fff4df] disabled:opacity-40"
              >
                <ArrowsClockwiseIcon size={16} className={(loading || analyticsLoading) ? 'animate-spin' : ''} />
              </button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={openCreate}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f4ead8] px-4 sm:px-5 text-sm font-semibold text-[#20140f] shadow-[0_12px_26px_rgba(0,0,0,0.15)] transition-transform"
              >
                <PlusIcon size={15} weight="bold" />
                <span className="sm:inline">Novo produto</span>
                <span className="sm:hidden">Novo</span>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 md:px-7 md:py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-5">
            <StatPill label="Catálogo total" value={totalAnalytics} hint="Contagem global usada como base para a visão analítica." />
            <StatPill label="Loja online" value={totalVisible} hint="Produtos atualmente ativos na vitrine do site." accent="text-emerald-200" />
            <StatPill label="Cardápio" value={totalCardapio} hint="Itens marcados para o cardápio presencial da loja." accent="text-[#f3d7a6]" />
            <StatPill label="Ocultos" value={totalHidden} hint="Produtos que continuam no sistema, mas não aparecem na loja." accent="text-[#d7c8b5]" />
            <StatPill label="Destaques" value={totalFeatured} hint="Itens com prioridade visual na experiência pública." accent="text-[#f3d7a6]" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-5">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#ab9d8b]">Categorias mais presentes</span>
            {topCategories.length === 0 && !analyticsLoading && (
              <span className="text-sm text-[#a89a8a]">Sem dados suficientes ainda.</span>
            )}
            {topCategories.map(([categoria, count]) => (
              <button
                key={categoria}
                type="button"
                onClick={() => setCategoryFilter(categoria)}
                className="inline-flex items-center gap-2 rounded-full border border-[#433127] bg-white/[0.03] px-4 py-2 text-sm text-[#ddd2c4] transition-colors hover:border-[#8d7042] hover:text-[#fff8ef]"
              >
                <span>{categoria}</span>
                <span className="rounded-full bg-[#2b1d15] px-2 py-0.5 text-[10px] tracking-[0.18em] text-[#d7ba89]">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 overflow-visible rounded-[30px] md:rounded-[36px] border border-[#3b2c22] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.012))] shadow-[0_22px_52px_rgba(0,0,0,0.18)]">
        <div className="px-4 py-4 md:px-7 md:py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative flex-1 xl:max-w-xl">
                <MagnifyingGlassIcon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#907b61]" />
                <input
                  type="text"
                  placeholder="Buscar por nome, descrição, categoria ou marca"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-full border border-[#433127] bg-[#201510] pl-11 pr-4 text-sm text-[#fff8ef] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-[#8f8273] hover:border-[#8d7042] focus:border-[#c59c58] focus:bg-[#241913] focus:shadow-[0_0_0_4px_rgba(197,156,88,0.12)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-[#b3a595]">
                <span className="rounded-full border border-[#3b2c22] bg-white/[0.03] px-4 py-2">
                  Mostrando {rangeStart}-{rangeEnd} de {totalCount}
                </span>
                {hasActiveFilters && (
                  <span className="rounded-full border border-[#8d7042]/30 bg-[#302116] px-4 py-2 text-[#f0d4a4]">
                    Lista filtrada
                  </span>
                )}
              </div>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
              <div className="flex min-w-max gap-3 pb-1 md:min-w-0 md:flex-wrap">
                <ScopeChip label="Todos" count={totalAnalytics} active={statusScope === 'all'} onClick={() => setStatusScope('all')} />
                <ScopeChip label="Loja online" count={totalVisible} active={statusScope === 'online'} onClick={() => setStatusScope('online')} />
                <ScopeChip label="Cardápio" count={totalCardapio} active={statusScope === 'cardapio'} onClick={() => setStatusScope('cardapio')} />
                <ScopeChip label="Ocultos" count={totalHidden} active={statusScope === 'hidden'} onClick={() => setStatusScope('hidden')} />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#3b2c22] bg-white/[0.03] px-4 py-2 text-sm text-[#cabbaa]">
                <FunnelIcon size={14} className="text-[#9c8360]" weight={hasActiveFilters ? 'fill' : 'regular'} />
                <span>Filtros</span>
              </div>

              <div className="relative z-30 grid grid-cols-1 gap-3 sm:grid-cols-2 md:flex md:flex-wrap md:items-center">
                <FilterSelect
                  placeholder="Categoria"
                  value={categoryFilter}
                  options={categoryOptions}
                  onChange={setCategoryFilter}
                  disabled={categoryOptions.length === 0}
                />

                <FilterSelect
                  placeholder="Marca"
                  value={marcaFilter}
                  options={marcaOptions}
                  onChange={setMarcaFilter}
                  disabled={marcaOptions.length === 0}
                />

                <button
                  type="button"
                  onClick={() => setDestaqueFilter((current) => !current)}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm transition-all duration-200 ${
                    destaqueFilter
                      ? 'border-[#c59c58] bg-[#2f2015] text-[#fff3df]'
                      : 'border-[#433127] bg-[#241711] text-[#cdbfaf] hover:border-[#8d7042] hover:text-[#fff8ef]'
                  }`}
                >
                  <StarIcon size={13} weight={destaqueFilter ? 'fill' : 'regular'} />
                  Destaques
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-500/18 bg-red-500/8 px-4 text-sm text-red-200 transition-colors hover:border-red-400/35 hover:bg-red-500/10"
                  >
                    <XIcon size={12} />
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {activeFilterPills.length > 0 && (
              <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
                <div className="flex min-w-max gap-2 md:min-w-0 md:flex-wrap">
                {activeFilterPills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center rounded-full border border-[#3b2c22] bg-white/[0.03] px-4 py-2 text-sm text-[#d5c8b8]"
                  >
                    {pill}
                  </span>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-[26px] border border-red-500/18 bg-red-500/8 px-5 py-4 text-sm text-red-200"
          >
            <WarningCircleIcon size={16} weight="fill" className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {(loading || analyticsLoading) && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-[88px] rounded-[28px] border border-[#34271f] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3 md:hidden">
          {products.length === 0 ? (
            <div className="rounded-[30px] border border-[#3b2c22] bg-white/[0.02] px-5 py-16 text-center text-sm text-[#afa293]">
              {hasActiveFilters ? 'Nenhum produto encontrado com os filtros atuais.' : 'Nenhum produto cadastrado ainda.'}
            </div>
          ) : (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.22, ease: EASE }}
                className="overflow-hidden rounded-[32px] border border-[#3b2c22] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] shadow-[0_14px_30px_rgba(0,0,0,0.16)]"
              >
                <div className="flex gap-4 px-4 py-4">
                  {product.imagemUrl ? (
                    <img
                      src={product.imagemUrl}
                      alt={product.nome}
                      className="h-14 w-14 rounded-[18px] object-cover border border-[#433127] shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                      <div className="h-14 w-14 rounded-[18px] border border-[#433127] bg-white/[0.03] shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold leading-snug text-[#fff8ef] break-words">{product.nome}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#ad9f8f] break-words">{product.marca || 'Sem marca'} • {product.categoria}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge active={product.isVisivel} label="Loja online" tone="success" />
                          <StatusBadge active={!product.isVisivel} label="Oculto" tone="muted" />
                          <StatusBadge active={product.isCardapio} label="Cardápio" />
                          <StatusBadge active={product.destaque} label="Destaque" />
                        </div>
                        <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-[#f1d09a]">{formatCurrency(product.preco)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#34271f] bg-black/10 px-3 py-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openHistory(product)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#433127] bg-white/[0.03] px-3 text-xs text-[#d1c3b3] transition-colors hover:border-[#8d7042] hover:text-[#fff4df]"
                    >
                      <ClockIcon size={13} />
                      Histórico
                    </button>
                    <button
                      onClick={() => openDuplicate(product)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#433127] bg-white/[0.03] px-3 text-xs text-[#d1c3b3] transition-colors hover:border-[#8d7042] hover:text-[#fff4df]"
                    >
                      <CopyIcon size={13} />
                      Duplicar
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(product)}
                      disabled={togglingId === product.id}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#433127] bg-white/[0.03] px-3 text-xs text-[#d1c3b3] transition-colors hover:border-[#8d7042] hover:text-[#fff4df] disabled:opacity-40"
                    >
                      {togglingId === product.id
                        ? <span className="h-3 w-3 rounded-full border-2 border-[#5d4a3d] border-t-[#dcc7a3] animate-spin" />
                        : product.isVisivel
                          ? <EyeSlashIcon size={13} />
                          : <EyeIcon size={13} />
                      }
                      {product.isVisivel ? 'Ocultar' : 'Exibir'}
                    </button>
                    <button
                      onClick={() => openEdit(product)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#433127] bg-white/[0.03] px-3 text-xs text-[#d1c3b3] transition-colors hover:border-[#8d7042] hover:text-[#fff4df]"
                    >
                      <PencilSimpleIcon size={13} />
                      Editar
                    </button>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-red-500/18 bg-red-500/8 px-3 text-xs text-red-200 transition-colors hover:border-red-400/35 hover:bg-red-500/10"
                  >
                    <TrashIcon size={13} />
                    Desativar produto
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {!loading && !error && (
        <div className="hidden overflow-hidden rounded-[38px] border border-[#3b2c22] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.01))] shadow-[0_24px_58px_rgba(0,0,0,0.18)] md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-[#34271f] bg-white/[0.02]">
                  <th className="px-6 py-5 text-left text-[10px] font-medium uppercase tracking-[0.24em] text-[#b4a693]">Produto</th>
                  <th className="px-4 py-5 text-left text-[10px] font-medium uppercase tracking-[0.24em] text-[#b4a693]">Categoria</th>
                  <th className="px-4 py-5 text-left text-[10px] font-medium uppercase tracking-[0.24em] text-[#b4a693]">Status</th>
                  <th className="px-4 py-5 text-left text-[10px] font-medium uppercase tracking-[0.24em] text-[#b4a693]">Preço</th>
                  <th className="px-4 py-5 text-left text-[10px] font-medium uppercase tracking-[0.24em] text-[#b4a693]">Atualizado</th>
                  <th className="px-6 py-5 text-right text-[10px] font-medium uppercase tracking-[0.24em] text-[#b4a693]">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-sm text-[#afa293]">
                        {hasActiveFilters ? 'Nenhum produto encontrado com os filtros atuais.' : 'Nenhum produto cadastrado ainda.'}
                      </td>
                    </tr>
                  ) : (
                    products.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.22, ease: EASE }}
                        className="border-b border-[#34271f] last:border-0 hover:bg-white/[0.025]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            {product.imagemUrl ? (
                              <img
                                src={product.imagemUrl}
                                alt={product.nome}
                                className="h-12 w-12 rounded-[18px] border border-[#433127] object-cover shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-[18px] border border-[#433127] bg-white/[0.03] shrink-0" />
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-semibold text-[#fff8ef]">{product.nome}</p>
                              <p className="mt-1 truncate text-xs text-[#b0a291]">{product.marca || 'Sem marca'} • {product.unidadeMedida || 'UN'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-5">
                          <span className="inline-flex rounded-full border border-[#3b2c22] bg-white/[0.03] px-3 py-1.5 text-xs text-[#eadfce]">
                            {product.categoria}
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge active={product.isVisivel} label="Loja online" tone="success" />
                            <StatusBadge active={!product.isVisivel} label="Oculto" tone="muted" />
                            <StatusBadge active={product.isCardapio} label="Cardápio" />
                            <StatusBadge active={product.destaque} label="Destaque" />
                          </div>
                        </td>

                        <td className="px-4 py-5 text-[15px] font-semibold text-[#f1d09a]">
                          {formatCurrency(product.preco)}
                        </td>

                        <td className="px-4 py-5 text-xs text-[#aa9c8b]">
                          {formatDateTime(product.atualizadoEm)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openHistory(product)}
                              title="Histórico de preço"
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#433127] bg-white/[0.03] text-[#d4c7b8] transition-colors hover:border-[#8d7042] hover:text-[#fff4df]"
                            >
                              <ClockIcon size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleVisibility(product)}
                              disabled={togglingId === product.id}
                              title={product.isVisivel ? 'Ocultar' : 'Tornar visível'}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#433127] bg-white/[0.03] text-[#d4c7b8] transition-colors hover:border-[#8d7042] hover:text-[#fff4df] disabled:opacity-40"
                            >
                              {togglingId === product.id
                                ? <span className="h-3.5 w-3.5 rounded-full border-2 border-[#5d4a3d] border-t-[#dcc7a3] animate-spin" />
                                : product.isVisivel
                                  ? <EyeSlashIcon size={14} />
                                  : <EyeIcon size={14} />
                              }
                            </button>
                            <button
                              onClick={() => openDuplicate(product)}
                              title="Duplicar produto"
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#433127] bg-white/[0.03] text-[#d4c7b8] transition-colors hover:border-[#8d7042] hover:text-[#fff4df]"
                            >
                              <CopyIcon size={14} />
                            </button>
                            <button
                              onClick={() => openEdit(product)}
                              title="Editar"
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#433127] bg-white/[0.03] text-[#d4c7b8] transition-colors hover:border-[#8d7042] hover:text-[#fff4df]"
                            >
                              <PencilSimpleIcon size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              title="Desativar"
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/18 bg-red-500/8 text-red-200 transition-colors hover:border-red-400/35 hover:bg-red-500/10"
                            >
                              <TrashIcon size={14} />
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
        </div>
      )}

      {!loading && totalCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full border border-[#3b2c22] bg-white/[0.03] px-4 py-2 text-xs text-[#b8ab9b]">
              {rangeStart}-{rangeEnd} de {totalCount}
            </p>

            <div className="flex items-center gap-2">
              {[10, 20, 50, 100].map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`h-10 rounded-full px-4 text-xs transition-colors ${
                    pageSize === size
                      ? 'border border-[#c59c58] bg-[#2f2015] text-[#fff3df]'
                      : 'border border-[#3b2c22] bg-white/[0.03] text-[#bbae9f] hover:border-[#8d7042] hover:text-[#fff4df]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3b2c22] bg-white/[0.03] text-[#d2c5b6] transition-colors hover:border-[#8d7042] hover:text-[#fff4df] disabled:opacity-25 disabled:pointer-events-none"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {(() => {
                const pages: (number | '...')[] = []
                const delta = 1
                const left = page - delta
                const right = page + delta

                for (let current = 1; current <= totalPages; current++) {
                  if (current === 1 || current === totalPages || (current >= left && current <= right)) {
                    pages.push(current)
                  } else if (pages[pages.length - 1] !== '...') {
                    pages.push('...')
                  }
                }

                return pages.map((current, index) =>
                  current === '...' ? (
                    <span key={`ellipsis-${index}`} className="flex h-10 w-10 items-center justify-center text-sm text-[#8f8171]">...</span>
                  ) : (
                    <button
                      key={current}
                      onClick={() => setPage(current as number)}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-full px-4 text-sm transition-colors ${
                        page === current
                          ? 'border border-[#c59c58] bg-[#2f2015] text-[#fff3df]'
                          : 'border border-[#3b2c22] bg-white/[0.03] text-[#c5b7a7] hover:border-[#8d7042] hover:text-[#fff4df]'
                      }`}
                    >
                      {current}
                    </button>
                  ),
                )
              })()}

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3b2c22] bg-white/[0.03] text-[#d2c5b6] transition-colors hover:border-[#8d7042] hover:text-[#fff4df] disabled:opacity-25 disabled:pointer-events-none"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2L8 6l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        </div>
      )}

      <ProductForm
        open={formOpen}
        initial={editTarget}
        duplicateSource={duplicateSource ?? undefined}
        loading={formLoading}
        serverError={formServerError}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditTarget(null); setDuplicateSource(null); setFormServerError('') }}
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

      <AdminToast toast={toast} onDismiss={() => {}} />

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
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="fixed inset-0 z-[71] flex items-end justify-center px-4 py-4 pointer-events-none md:items-center md:py-8"
            >
              <div
                className="pointer-events-auto relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-[34px] border border-[#433127] bg-[#17100c] shadow-[0_28px_70px_rgba(0,0,0,0.35)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-[#34271f] px-6 pb-4 pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#b9ab99]">Histórico de preço</p>
                      <h2 className="mt-2 text-xl font-semibold text-[#fff8ef]">{historyProduct.nome}</h2>
                      <p className="mt-1 text-sm text-[#aa9c8b]">Preço atual: {formatCurrency(historyProduct.preco)}</p>
                    </div>

                    <button
                      onClick={() => setHistoryProduct(null)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#433127] bg-white/[0.03] text-[#d2c5b6] transition-colors hover:border-[#8d7042] hover:text-[#fff4df]"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {historyLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-14 rounded-[22px] border border-[#34271f] bg-white/[0.03] animate-pulse" />
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#aca08f]">
                      Nenhuma alteração de preço registrada.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-[24px] border border-[#3b2c22] bg-white/[0.03] px-4 py-4"
                        >
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-[#a99984]">Alteração</p>
                            <p className="mt-2 text-sm text-[#fff6ea]">
                              <span className="line-through text-[#8c8072]">{formatCurrency(item.precoAnterior)}</span>
                              <span className="mx-2 text-[#6e6256]">→</span>
                              <span className="font-semibold text-[#f1d09a]">{formatCurrency(item.precoNovo)}</span>
                            </p>
                          </div>
                          <p className="text-xs text-[#aa9c8b]">{formatDateTime(item.alteradoEm)}</p>
                        </div>
                      ))}
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

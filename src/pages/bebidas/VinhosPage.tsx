import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Wine as WineIcon,
  MagnifyingGlass,
  X as XIcon,
  ForkKnife as ForkKnifeIcon,
  ShoppingCart as ShoppingCartIcon,
  Check as CheckIcon,
  Tag as TagIcon,
  Crown as CrownIcon,
  CaretDown,
} from '@phosphor-icons/react'
import { apiFetch } from '../../services/api'
import { useCart } from '../../context/CartContext'
import SectionDivider from '../../components/layout/SectionDivider'
import HarmonizacoesModal from '../../components/vinhos/HarmonizacoesModal'
import { type ProdutoPublico } from '../../components/catalogo/ProdutoCard'

/* ── Generic wine‑bottle SVG (no brand / no label) ─────────────────── */
const WINE_BOTTLE_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
    <rect width="400" height="600" fill="#1E0808"/>
    <g transform="translate(140,30)">
      <rect x="46" y="0" width="28" height="16" rx="4" fill="#B8860B" opacity=".25"/>
      <rect x="49" y="16" width="22" height="75" rx="3" fill="#2D0A0A" stroke="#B8860B" stroke-width="1" opacity=".45"/>
      <path d="M49 91C49 91,24 130,24 190L24 440C24 462,38 480,60 480C82 480,96 462,96 440L96 190C96 130,71 91,71 91Z" fill="#2D0A0A" stroke="#B8860B" stroke-width="1.5" opacity=".55"/>
      <ellipse cx="60" cy="480" rx="36" ry="7" fill="#B8860B" opacity=".12"/>
      <rect x="36" y="240" width="48" height="70" rx="3" fill="none" stroke="#B8860B" stroke-width=".7" opacity=".2"/>
      <line x1="44" y1="265" x2="76" y2="265" stroke="#B8860B" stroke-width=".5" opacity=".15"/>
      <line x1="48" y1="280" x2="72" y2="280" stroke="#B8860B" stroke-width=".5" opacity=".15"/>
      <line x1="50" y1="295" x2="70" y2="295" stroke="#B8860B" stroke-width=".5" opacity=".15"/>
    </g>
  </svg>`,
)}`

/* ── Types ──────────────────────────────────────────────────────────── */
interface NacionalidadeFiltro {
  id: number
  nome: string
  imagemUrl?: string
}

interface FiltrosDto {
  marcas: string[]
  categorias: string[]
  tipos: string[]
  sabores: string[]
  unidadesMedida: string[]
  nacionalidades: NacionalidadeFiltro[]
}

interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

/* ── Extended product type (API returns extra fields for wines) ───── */
interface NacionalidadeProduto {
  id: number
  nome: string
  imagemUrl?: string
}

interface VinhoProduto extends ProdutoPublico {
  tipos?: string
  sabores?: string
  nacionalidade?: NacionalidadeProduto
}

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

/* ── FilterSelect — searchable dropdown styled for dark theme ──────── */
interface FilterOption {
  value: string
  label: string
  icon?: React.ReactNode
}

function FilterSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string
  options: FilterOption[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const selected = options.find((o) => o.value === value)

  /* close on outside click */
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  /* close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setQuery('') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const handleSelect = useCallback((v: string) => {
    onChange(v)
    setOpen(false)
    setQuery('')
  }, [onChange])

  return (
    <div ref={containerRef} className="relative min-w-[160px]">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open)
          if (!open) setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm transition-all duration-300 text-left ${
          value
            ? 'border-gold-light/40 bg-gold-primary/10 text-gold-light'
            : 'border-gold-light/15 bg-white/[0.03] text-cream/60 hover:border-gold-light/30 hover:text-cream/80'
        } ${open ? 'border-gold-light/50 bg-white/[0.06]' : ''}`}
      >
        {selected?.icon && <span className="flex-shrink-0">{selected.icon}</span>}
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <CaretDown
          size={12}
          weight="bold"
          className={`flex-shrink-0 text-cream/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #1E0808 0%, #140606 100%)',
              border: '1px solid rgba(200,160,74,0.2)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,160,74,0.08)',
            }}
          >
            {/* Search input inside dropdown */}
            <div className="p-2 border-b border-white/[0.06]">
              <div className="relative">
                <MagnifyingGlass
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cream/25"
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Filtrar..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-cream font-body text-xs placeholder:text-cream/25 focus:outline-none focus:border-gold-light/30 transition-colors"
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-52 overflow-y-auto py-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,160,74,0.2) transparent' }}>
              {/* "All" option */}
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left font-body text-xs transition-all duration-150 ${
                  !value
                    ? 'bg-gold-primary/10 text-gold-light'
                    : 'text-cream/50 hover:bg-white/[0.04] hover:text-cream/80'
                }`}
              >
                <span className="flex-1">{placeholder}</span>
                {!value && (
                  <CheckIcon size={12} weight="bold" className="text-gold-light flex-shrink-0" />
                )}
              </button>

              {filtered.length === 0 && (
                <p className="px-3.5 py-3 text-cream/25 text-xs font-body text-center">Nenhum resultado</p>
              )}

              {filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left font-body text-xs transition-all duration-150 ${
                    value === opt.value
                      ? 'bg-gold-primary/10 text-gold-light'
                      : 'text-cream/60 hover:bg-white/[0.04] hover:text-cream/90'
                  }`}
                >
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {value === opt.value && (
                    <CheckIcon size={12} weight="bold" className="text-gold-light flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Dark WineProductCard ──────────────────────────────────────────── */
function WineProductCard({ produto, index }: { produto: VinhoProduto; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const hasDiscount = produto.precoComDesconto < produto.preco
  const activePromo = produto.promocoes[0]
  const imgSrc = produto.imagemUrl || WINE_BOTTLE_PLACEHOLDER
  const tiposList = produto.tipos ? produto.tipos.split(',').map((t) => t.trim()).filter(Boolean) : []
  const nac = produto.nacionalidade

  const handleAdd = () => {
    addItem({
      id: `produto-${produto.id}`,
      produtoId: produto.id,
      name: produto.nome,
      subtitle: produto.marca
        ? `${produto.marca} · ${produto.unidadeMedida}`
        : produto.unidadeMedida,
      price: produto.precoComDesconto,
      category: produto.categoria,
      promocaoId: activePromo?.id ?? null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: EASE }}
      className="group relative h-full"
    >
      <div
        className={`h-full flex flex-col rounded-xl border transition-all duration-300 ${
          produto.destaque
            ? 'border-gold-light/25 bg-gold-primary/[0.07] hover:border-gold-light/50'
            : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.16]'
        }`}
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-xl h-40">
          <img
            src={imgSrc}
            alt={produto.nome}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = WINE_BOTTLE_PLACEHOLDER
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(15,4,4,0.85) 0%, rgba(15,4,4,0.3) 40%, transparent 70%)',
            }}
          />
          {produto.destaque && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-gold text-dark-warm px-2.5 py-1 rounded-full">
              <CrownIcon size={9} weight="fill" />
              <span className="type-overline text-[8px]">Destaque</span>
            </div>
          )}
          {/* Nacionalidade ribbon — top right */}
          {nac && (
            <div
              className="absolute top-3 right-0 flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-l-full"
              style={{
                background: 'linear-gradient(135deg, rgba(30,8,8,0.92) 0%, rgba(15,4,4,0.95) 100%)',
                borderLeft: '1px solid rgba(200,160,74,0.35)',
                borderTop: '1px solid rgba(200,160,74,0.2)',
                borderBottom: '1px solid rgba(200,160,74,0.2)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              {nac.imagemUrl ? (
                <img
                  src={nac.imagemUrl}
                  alt={nac.nome}
                  className="w-5 h-[14px] rounded-[2px] object-cover flex-shrink-0 shadow-sm"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              ) : (
                <img
                  src={`https://flagcdn.com/20x15/${nac.nome.slice(0, 2).toLowerCase()}.png`}
                  alt={nac.nome}
                  className="w-5 h-[14px] rounded-[2px] object-cover flex-shrink-0 shadow-sm"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              )}
              <span className="font-subtitle italic text-cream text-[10px] tracking-wide">
                {nac.nome}
              </span>
            </div>
          )}
          {hasDiscount && (
            <div className={`absolute ${nac ? 'top-10' : 'top-3'} right-3 flex items-center gap-1 bg-bordeaux text-cream px-2 py-1 rounded-full transition-all`}>
              <TagIcon size={9} weight="fill" />
              <span className="type-overline text-[8px]">Oferta</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="font-display font-bold text-cream text-sm leading-snug line-clamp-2">
              {produto.nome}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Tipos tags */}
          {tiposList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tiposList.map((t) => (
                <span
                  key={t}
                  className="text-[9px] font-body bg-white/[0.06] border border-white/10 text-cream/60 px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {produto.descricao && (
            <p className="text-cream/40 text-[12px] leading-snug line-clamp-2 font-body">
              {produto.descricao}
              {produto.marca && (
                <span className="text-cream/25"> · {produto.marca}</span>
              )}
            </p>
          )}
          {!produto.descricao && produto.marca && (
            <p className="text-cream/25 text-[11px] font-body italic">{produto.marca}</p>
          )}

          {activePromo && (
            <div className="bg-bordeaux/20 border border-bordeaux/30 rounded-lg px-2.5 py-1.5">
              <p className="type-overline text-gold-light/80 text-[9px]">{activePromo.nome}</p>
            </div>
          )}

          <div className="h-px bg-white/[0.07] mt-auto" />

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div>
              {hasDiscount && (
                <p className="font-body text-cream/30 text-[11px] line-through">
                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                </p>
              )}
              <p className="font-display font-bold text-gold-light text-lg">
                R$ {produto.precoComDesconto.toFixed(2).replace('.', ',')}
              </p>
              <p className="type-overline text-cream/25 text-[9px]">{produto.unidadeMedida}</p>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              className={`flex items-center gap-1 type-overline text-[9px] px-3 py-2 rounded-full border transition-all duration-300 ${
                added
                  ? 'border-gold-light/50 bg-gold-primary/20 text-gold-light'
                  : 'border-white/10 text-cream/40 hover:border-gold-primary/40 hover:text-gold-light hover:bg-gold-primary/10'
              }`}
              aria-label={`Adicionar ${produto.nome} ao carrinho`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1"
                  >
                    <CheckIcon size={10} weight="bold" />
                    Adicionado
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1"
                  >
                    <ShoppingCartIcon size={10} weight="fill" />
                    Adicionar
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Page Component ────────────────────────────────────────────────── */
export default function VinhosPage() {
  /* modals */
  const [showHarmonizacoes, setShowHarmonizacoes] = useState(false)

  /* filters */
  const [filtros, setFiltros] = useState<FiltrosDto | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [busca, setBusca] = useState('')
  const [marca, setMarca] = useState('')
  const [nacionalidadeId, setNacionalidadeId] = useState<number | ''>('')
  const [tipo, setTipo] = useState('')

  /* products */
  const [produtos, setProdutos] = useState<VinhoProduto[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* debounce search input → busca */
  useEffect(() => {
    const t = setTimeout(() => setBusca(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  /* fetch filter options once */
  useEffect(() => {
    apiFetch<FiltrosDto>('/api/catalogo/filtros').then((res) => {
      if (res.success) setFiltros(res.data)
    })
  }, [])

  /* fetch wines whenever filters / page change */
  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      categoria: 'Vinhos',
      page: String(page),
      pageSize: '20',
    })
    if (busca.trim()) params.set('busca', busca.trim())
    if (marca) params.set('marca', marca)
    if (nacionalidadeId !== '') params.set('nacionalidadeId', String(nacionalidadeId))
    if (tipo) params.set('tipo', tipo)

    apiFetch<PagedResult<VinhoProduto>>(`/api/produtos?${params}`)
      .then((res) => {
        if (res.success) {
          setProdutos(res.data.items)
          setTotalPages(res.data.totalPages)
          setTotalCount(res.data.totalCount)
        } else {
          setError(res.message || 'Erro ao carregar vinhos.')
        }
      })
      .catch(() => setError('Erro de conexão com o servidor.'))
      .finally(() => setLoading(false))
  }, [busca, marca, nacionalidadeId, tipo, page])

  const clearFilters = () => {
    setSearchInput('')
    setBusca('')
    setMarca('')
    setNacionalidadeId('')
    setTipo('')
    setPage(1)
  }

  const hasActiveFilters = busca || marca || nacionalidadeId !== '' || tipo

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <>
      <section
        id="vinhos"
        className="pt-28 pb-16 px-6 lg:px-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1E0808 0%, #0F0404 100%)' }}
      >
        {/* Gold radial accent */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />

        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* ── Header ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-12"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <WineIcon size={18} weight="light" className="text-gold-light" />
                <p className="type-overline text-gold-light/70 text-[11px]">Curadoria de terroir</p>
              </div>
              <h2 className="type-h1 text-cream">
                Carta de
                <br />
                <span className="font-subtitle italic font-normal text-gold-light">Vinhos</span>
              </h2>
            </div>
            <div className="flex flex-col items-start gap-5">
              <p className="type-body text-cream/50 text-sm leading-relaxed">
                Rótulos selecionados de Portugal, Argentina, Chile, Itália, França e mais. Do
                cotidiano ao reserva especial.
              </p>
              <button
                onClick={() => setShowHarmonizacoes(true)}
                className="flex items-center gap-2 border border-gold-light/40 text-gold-light hover:bg-gold-light/10 hover:border-gold-light/70 transition-all duration-300 type-overline text-[11px] px-5 py-2.5 rounded-full"
              >
                <ForkKnifeIcon size={13} weight="light" />
                Harmonização
              </button>
            </div>
          </motion.div>

          <SectionDivider dark className="mb-10" />

          {/* ── Filter bar (dark theme) ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className="mb-10"
          >
            <div className="flex flex-wrap gap-3 items-center">
              {/* Busca */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-light/40"
                />
                <input
                  type="text"
                  placeholder="Buscar vinho..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gold-light/15 bg-white/[0.03] text-cream font-body text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-light/40 focus:bg-white/[0.05] transition-all duration-300"
                />
              </div>

              {/* Marca */}
              {filtros && filtros.marcas.length > 0 && (
                <FilterSelect
                  placeholder="Marca"
                  value={marca}
                  onChange={(v) => { setMarca(v); setPage(1) }}
                  options={filtros.marcas.filter(Boolean).map((m) => ({ value: m, label: m }))}
                />
              )}

              {/* Tipo */}
              {filtros && filtros.tipos.length > 0 && (
                <FilterSelect
                  placeholder="Tipo"
                  value={tipo}
                  onChange={(v) => { setTipo(v); setPage(1) }}
                  options={filtros.tipos.map((t) => ({ value: t, label: t }))}
                />
              )}

              {/* Origem */}
              {filtros && filtros.nacionalidades.length > 0 && (
                <FilterSelect
                  placeholder="Origem"
                  value={nacionalidadeId === '' ? '' : String(nacionalidadeId)}
                  onChange={(v) => { setNacionalidadeId(v ? Number(v) : ''); setPage(1) }}
                  options={filtros.nacionalidades.map((n) => ({
                    value: String(n.id),
                    label: n.nome,
                    icon: (
                      <img
                        src={n.imagemUrl || `https://flagcdn.com/20x15/${n.nome.slice(0, 2).toLowerCase()}.png`}
                        alt={n.nome}
                        className="w-[18px] h-[13px] rounded-[2px] object-cover"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    ),
                  }))}
                />
              )}

              {/* Limpar filtros */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gold-light/25 text-gold-light/80 font-body text-[11px] uppercase tracking-widest hover:bg-gold-light/10 hover:border-gold-light/40 transition-all duration-300"
                >
                  <XIcon size={11} weight="bold" />
                  Limpar
                </button>
              )}
            </div>
          </motion.div>

          {/* Results count */}
          {!loading && !error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="type-caption text-cream/40 not-italic mb-6 text-sm"
            >
              {totalCount} {totalCount === 1 ? 'rótulo encontrado' : 'rótulos encontrados'}
            </motion.p>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.06]"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20">
              <p className="type-body text-cream/40">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && produtos.length === 0 && (
            <div className="text-center py-20">
              <WineIcon size={48} weight="light" className="mx-auto text-cream/15 mb-4" />
              <p className="type-body text-cream/40">Nenhum vinho encontrado.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-gold-light underline underline-offset-4 hover:text-gold-light/70 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!loading && !error && produtos.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {produtos.map((produto, i) => (
                  <WineProductCard key={produto.id} produto={produto} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 rounded-full border border-gold-light/20 text-cream/40 font-body text-xs uppercase tracking-wider disabled:opacity-30 hover:border-gold-light/50 hover:text-gold-light transition-all duration-200"
                  >
                    Anterior
                  </button>
                  <span className="type-overline text-cream/30 text-xs">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-full border border-gold-light/20 text-cream/40 font-body text-xs uppercase tracking-wider disabled:opacity-30 hover:border-gold-light/50 hover:text-gold-light transition-all duration-200"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </section>

      <HarmonizacoesModal isOpen={showHarmonizacoes} onClose={() => setShowHarmonizacoes(false)} />
    </>
  )
}

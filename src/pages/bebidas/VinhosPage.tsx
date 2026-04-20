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
  Star as StarIcon,
} from '@phosphor-icons/react'
import { apiFetch } from '../../services/api'
import { useCart } from '../../context/CartContext'
import SectionDivider from '../../components/layout/SectionDivider'
import HarmonizacoesModal from '../../components/vinhos/HarmonizacoesModal'
import { type ProdutoPublico } from '../../components/catalogo/ProdutoCard'
import { EASE } from '../../lib/motion'

/* ── Generic wine‑bottle SVG placeholder ────────────────────── */
const WINE_BOTTLE_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
    <rect width="400" height="600" fill="#1E0808"/>
    <g transform="translate(140,30)">
      <rect x="46" y="0" width="28" height="16" rx="4" fill="#B8860B" opacity=".25"/>
      <rect x="49" y="16" width="22" height="75" rx="3" fill="#2D0A0A" stroke="#B8860B" stroke-width="1" opacity=".45"/>
      <path d="M49 91C49 91,24 130,24 190L24 440C24 462,38 480,60 480C82 480,96 462,96 440L96 190C96 130,71 91,71 91Z" fill="#2D0A0A" stroke="#B8860B" stroke-width="1.5" opacity=".55"/>
      <ellipse cx="60" cy="480" rx="36" ry="7" fill="#B8860B" opacity=".12"/>
      <rect x="36" y="240" width="48" height="70" rx="3" fill="none" stroke="#B8860B" stroke-width=".7" opacity=".2"/>
    </g>
  </svg>`,
)}`

/* ── Types ──────────────────────────────────────────────────── */
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

type SortOpt = { label: string; ordenarPor: string; ordem: string }
const SORT_OPTIONS: SortOpt[] = [
  { label: 'Padrão',       ordenarPor: 'criadoEm', ordem: 'desc' },
  { label: 'Nome A–Z',     ordenarPor: 'nome',     ordem: 'asc'  },
  { label: 'Menor preço',  ordenarPor: 'preco',    ordem: 'asc'  },
  { label: 'Maior preço',  ordenarPor: 'preco',    ordem: 'desc' },
]

type PopoverId = 'sort' | 'tipo' | 'origem' | 'marca'

/* ── Dark-theme filter button ────────────────────────────────── */
function DarkFilterBtn({
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
          ? 'border-gold-light/50 bg-gold-primary/10 text-gold-light'
          : 'border-white/10 bg-white/[0.03] text-cream/60 hover:border-white/20 hover:text-cream/80'
      }`}
    >
      {label}
      <CaretDown
        size={10}
        weight="bold"
        className={`opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  )
}

/* ── Dark-theme popover panel ────────────────────────────────── */
function DarkPanel({
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
      className={`absolute top-full mt-2 z-50 min-w-[190px] max-w-[min(280px,calc(100vw-48px))] rounded-xl border border-gold-light/20 overflow-hidden ${
        alignRight ? 'right-0' : 'left-0'
      }`}
      style={{
        background: 'linear-gradient(160deg, #1E0808 0%, #140606 100%)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(200,160,74,0.06)',
      }}
    >
      {children}
    </motion.div>
  )
}

/* ── Dark-theme popover option ───────────────────────────────── */
function DarkOpt({
  label,
  active,
  onClick,
  icon,
}: {
  label: string
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left font-body text-xs transition-colors ${
        active
          ? 'bg-gold-primary/10 text-gold-light'
          : 'text-cream/60 hover:bg-white/[0.04] hover:text-cream/90'
      }`}
    >
      <span
        className={`w-[5px] h-[5px] rounded-full flex-shrink-0 transition-colors ${
          active ? 'bg-gold-light' : 'bg-white/20'
        }`}
      />
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      {active && <CheckIcon size={11} weight="bold" className="text-gold-light flex-shrink-0" />}
    </button>
  )
}

/* ── Wine product card (dark) ────────────────────────────────── */
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
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
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
              <img
                src={nac.imagemUrl || `https://flagcdn.com/20x15/${nac.nome.slice(0, 2).toLowerCase()}.png`}
                alt={nac.nome}
                className="w-5 h-[14px] rounded-[2px] object-cover flex-shrink-0 shadow-sm"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <span className="font-subtitle italic text-cream text-[10px] tracking-wide">
                {nac.nome}
              </span>
            </div>
          )}
          {hasDiscount && (
            <div className={`absolute ${nac ? 'top-10' : 'top-3'} right-3 flex items-center gap-1 bg-bordeaux text-cream px-2 py-1 rounded-full`}>
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

/* ── Page component ──────────────────────────────────────────── */
export default function VinhosPage() {
  const [showHarmonizacoes, setShowHarmonizacoes] = useState(false)

  /* filter options */
  const [filtros, setFiltros] = useState<FiltrosDto | null>(null)

  /* filter state */
  const [searchInput, setSearchInput] = useState('')
  const [busca, setBusca] = useState('')
  const [marca, setMarca] = useState('')
  const [nacionalidadeId, setNacionalidadeId] = useState<number | ''>('')
  const [tipo, setTipo] = useState('')
  const [sortIdx, setSortIdx] = useState(0)
  const [destaqueFilter, setDestaqueFilter] = useState(false)

  /* products */
  const [produtos, setProdutos] = useState<VinhoProduto[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => setBusca(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  /* fetch filter options */
  useEffect(() => {
    apiFetch<FiltrosDto>('/api/catalogo/filtros').then((res) => {
      if (res.success) setFiltros(res.data)
    })
  }, [])

  /* main fetch */
  useEffect(() => {
    if (page === 1) setLoading(true)
    else setLoadingMore(true)
    setError(null)

    const sort = SORT_OPTIONS[sortIdx]
    const params = new URLSearchParams({
      categoria: 'Vinhos',
      page: String(page),
      pageSize: '20',
    })
    if (busca.trim()) params.set('busca', busca.trim())
    if (marca) params.set('marca', marca)
    if (nacionalidadeId !== '') params.set('nacionalidadeId', String(nacionalidadeId))
    if (tipo) params.set('tipo', tipo)
    if (destaqueFilter) params.set('destaque', 'true')
    if (sortIdx > 0) {
      params.set('ordenarPor', sort.ordenarPor)
      params.set('ordem', sort.ordem)
    }

    apiFetch<PagedResult<VinhoProduto>>(`/api/produtos?${params}`)
      .then((res) => {
        if (res.success) {
          setProdutos((prev) => (page === 1 ? res.data.items : [...prev, ...res.data.items]))
          setTotalPages(res.data.totalPages)
          setTotalCount(res.data.totalCount)
        } else {
          setError(res.message || 'Erro ao carregar vinhos.')
        }
      })
      .catch(() => setError('Erro de conexão com o servidor.'))
      .finally(() => {
        setLoading(false)
        setLoadingMore(false)
      })
  }, [busca, marca, nacionalidadeId, tipo, sortIdx, destaqueFilter, page])

  const clearFilters = useCallback(() => {
    setSearchInput('')
    setBusca('')
    setMarca('')
    setNacionalidadeId('')
    setTipo('')
    setSortIdx(0)
    setDestaqueFilter(false)
    setPage(1)
    setOpenPopover(null)
  }, [])

  const hasActiveFilters = !!(busca || marca || nacionalidadeId !== '' || tipo || destaqueFilter || sortIdx !== 0)

  /* derived labels */
  const sortLabel = sortIdx === 0 ? 'Ordenar' : SORT_OPTIONS[sortIdx].label
  const tipoLabel = tipo || 'Tipo'
  const origemLabel = (() => {
    if (nacionalidadeId === '') return 'Origem'
    const found = filtros?.nacionalidades.find((n) => n.id === nacionalidadeId)
    return found ? found.nome : 'Origem'
  })()

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
          {/* Header */}
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

          {/* ── Filter bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className="mb-10"
          >
            <div ref={filterRowRef} className="flex flex-col gap-3">

              {/* Row 1: Search */}
              <div className="relative">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-light/40 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Buscar vinho..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setPage(1)
                  }}
                  className="w-full h-10 pl-10 pr-10 rounded-lg border border-gold-light/15 bg-white/[0.03] text-cream font-body text-sm placeholder:text-cream/30 focus:outline-none focus:border-gold-light/40 focus:bg-white/[0.05] transition-all duration-300"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); setBusca(''); setPage(1) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/60 transition-colors"
                  >
                    <XIcon size={13} weight="bold" />
                  </button>
                )}
              </div>

              {/* Row 2: Filter buttons */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2">
                {/* Destaques toggle */}
                <button
                  type="button"
                  onClick={() => { setDestaqueFilter((d) => !d); setPage(1) }}
                  className={`flex items-center justify-between sm:justify-start gap-2 h-10 px-4 rounded-lg border font-body text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                    destaqueFilter
                      ? 'border-gold-light/50 bg-gold-primary/10 text-gold-light'
                      : 'border-white/10 bg-white/[0.03] text-cream/60 hover:border-white/20 hover:text-cream/80'
                  }`}
                >
                  <StarIcon size={11} weight={destaqueFilter ? 'fill' : 'regular'} />
                  Destaques
                </button>

                {/* Separator (desktop) */}
                <div className="hidden sm:block w-px h-5 bg-white/10 flex-shrink-0" />

                {/* Ordenar */}
                <div className="relative flex-shrink-0">
                  <DarkFilterBtn
                    label={sortLabel}
                    isActive={sortIdx !== 0}
                    isOpen={openPopover === 'sort'}
                    onClick={() => setOpenPopover((o) => (o === 'sort' ? null : 'sort'))}
                  />
                  <AnimatePresence>
                    {openPopover === 'sort' && (
                      <DarkPanel>
                        {SORT_OPTIONS.map((opt, i) => (
                          <DarkOpt
                            key={i}
                            label={opt.label}
                            active={sortIdx === i}
                            onClick={() => { setSortIdx(i); setPage(1); setOpenPopover(null) }}
                          />
                        ))}
                      </DarkPanel>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tipo */}
                {filtros && filtros.tipos.length > 0 && (
                  <div className="relative flex-shrink-0">
                    <DarkFilterBtn
                      label={tipoLabel}
                      isActive={tipo !== ''}
                      isOpen={openPopover === 'tipo'}
                      onClick={() => setOpenPopover((o) => (o === 'tipo' ? null : 'tipo'))}
                    />
                    <AnimatePresence>
                      {openPopover === 'tipo' && (
                        <DarkPanel>
                          <DarkOpt
                            label="Todos os tipos"
                            active={tipo === ''}
                            onClick={() => { setTipo(''); setPage(1); setOpenPopover(null) }}
                          />
                          <div className="h-px bg-white/[0.06] mx-2" />
                          {filtros.tipos.map((t) => (
                            <DarkOpt
                              key={t}
                              label={t}
                              active={tipo === t}
                              onClick={() => { setTipo(t); setPage(1); setOpenPopover(null) }}
                            />
                          ))}
                        </DarkPanel>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Origem */}
                {filtros && filtros.nacionalidades.length > 0 && (
                  <div className="relative flex-shrink-0">
                    <DarkFilterBtn
                      label={origemLabel}
                      isActive={nacionalidadeId !== ''}
                      isOpen={openPopover === 'origem'}
                      onClick={() => setOpenPopover((o) => (o === 'origem' ? null : 'origem'))}
                    />
                    <AnimatePresence>
                      {openPopover === 'origem' && (
                        <DarkPanel>
                          <DarkOpt
                            label="Todas as origens"
                            active={nacionalidadeId === ''}
                            onClick={() => { setNacionalidadeId(''); setPage(1); setOpenPopover(null) }}
                          />
                          <div className="h-px bg-white/[0.06] mx-2" />
                          <div className="max-h-52 overflow-y-auto">
                            {filtros.nacionalidades.map((n) => (
                              <DarkOpt
                                key={n.id}
                                label={n.nome}
                                active={nacionalidadeId === n.id}
                                onClick={() => { setNacionalidadeId(n.id); setPage(1); setOpenPopover(null) }}
                                icon={
                                  <img
                                    src={n.imagemUrl || `https://flagcdn.com/20x15/${n.nome.slice(0, 2).toLowerCase()}.png`}
                                    alt={n.nome}
                                    className="w-[18px] h-[13px] rounded-[2px] object-cover"
                                    style={{ imageRendering: 'crisp-edges' }}
                                  />
                                }
                              />
                            ))}
                          </div>
                        </DarkPanel>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Clear */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 h-10 px-4 rounded-lg border border-gold-light/25 text-gold-light/80 font-body text-xs uppercase tracking-wider hover:bg-gold-light/10 hover:border-gold-light/40 transition-all duration-300 whitespace-nowrap"
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

              {/* Loading more spinner */}
              <AnimatePresence>
                {loadingMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center pt-10"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-gold-light/20 border-t-gold-light animate-spin" />
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
                    className="px-8 py-3 rounded-full border border-gold-light/25 text-cream/50 font-body font-bold text-xs uppercase tracking-widest hover:border-gold-light/50 hover:text-gold-light transition-all duration-300 hover:-translate-y-px"
                  >
                    Carregar mais rótulos
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      <HarmonizacoesModal isOpen={showHarmonizacoes} onClose={() => setShowHarmonizacoes(false)} />
    </>
  )
}

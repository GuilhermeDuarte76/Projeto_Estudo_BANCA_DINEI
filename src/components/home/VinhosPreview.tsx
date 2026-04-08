import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Wine as WineIcon,
  ArrowRight as ArrowRightIcon,
  ShoppingCart as ShoppingCartIcon,
  Check as CheckIcon,
  Tag as TagIcon,
  Crown as CrownIcon,
} from '@phosphor-icons/react'
import { apiFetch } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { type ProdutoPublico } from '../catalogo/ProdutoCard'
import SectionDivider from '../layout/SectionDivider'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

/* ── Generic wine-bottle SVG placeholder ───────────────────────────── */
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

interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

/* ── Wine card (same style as VinhosPage) ──────────────────────────── */
function WinePreviewCard({ produto, index }: { produto: VinhoProduto; index: number }) {
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

/* ── Main Component ────────────────────────────────────────────────── */
export default function VinhosPreview() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<VinhoProduto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<PagedResult<VinhoProduto>>('/api/produtos?categoria=Vinhos&page=1&pageSize=3')
      .then((res) => {
        if (res.success) {
          setProdutos(res.data.items)
          setTotalCount(res.data.totalCount)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      className="py-20 px-6 lg:px-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1E0808 0%, #0F0404 100%)' }}
    >
      {/* Decorative orb */}
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
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <WineIcon size={18} weight="light" className="text-gold-light" />
              <p className="type-overline text-gold-light/70 text-[11px]">Curadoria de terroir</p>
            </div>
            <h2 className="type-h1 text-cream">
              Carta de<br />
              <span className="font-subtitle italic font-normal text-gold-light">Vinhos</span>
            </h2>
          </div>

          <button
            onClick={() => { navigate('/bebidas/vinhos'); window.scrollTo({ top: 0 }) }}
            className="group self-start sm:self-end flex items-center gap-3 border border-gold-light/40 text-gold-light font-body font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-full transition-all duration-300 hover:bg-gold-primary/20 hover:border-gold-light/70"
          >
            Ver carta completa
            <ArrowRightIcon
              size={13}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </motion.div>

        <SectionDivider dark className="mb-10" />

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.06]"
              />
            ))}
          </div>
        )}

        {/* Wine grid — 8 cards from API */}
        {!loading && produtos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {produtos.map((produto, i) => (
              <WinePreviewCard key={produto.id} produto={produto} index={i} />
            ))}
          </div>
        )}

        {/* CTA bottom */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="flex justify-center"
        >
          <button
            onClick={() => { navigate('/bebidas/vinhos'); window.scrollTo({ top: 0 }) }}
            className="group flex items-center gap-3 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-gold"
          >
            {totalCount > 0 ? `Ver os ${totalCount}+ rótulos` : 'Ver carta completa'}
            <ArrowRightIcon
              size={13}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

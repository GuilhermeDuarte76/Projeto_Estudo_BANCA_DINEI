import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  CrownIcon,
  ShoppingCartIcon,
  CheckIcon,
  TagIcon,
  WhatsappLogoIcon,
  ArrowLeftIcon,
  CaretRightIcon,
  ScalesIcon,
  BuildingsIcon,
  ListBulletsIcon,
  LeafIcon,
  PercentIcon,
} from '@phosphor-icons/react'
import { apiFetch } from '../services/api'
import { useCart } from '../context/CartContext'
import SectionDivider from '../components/layout/SectionDivider'
import ProdutoCard, { type ProdutoPublico, type ProdutoVariante } from '../components/catalogo/ProdutoCard'
import { EASE } from '../lib/motion'
import { WHATSAPP_NUMBER } from '../config/constants'

const PLACEHOLDER = 'https://picsum.photos/seed/produto/800/600'
const fmt = (val: number) => val.toFixed(2).replace('.', ',')

const CATEGORY_ROUTES: Record<string, string> = {
  Frios: '/frios',
  Doces: '/doces',
  'Grãos e Castanhas': '/graos-castanhas',
  Vinhos: '/bebidas/vinhos',
  Cervejas: '/bebidas/cerveja',
  Bebidas: '/bebidas',
  Tábuas: '/tabuas',
}

const MARIDAGEM_MAP: Record<string, string[]> = {
  Frios: ['Vinhos', 'Cervejas'],
  Doces: ['Vinhos', 'Cervejas'],
  'Grãos e Castanhas': ['Vinhos', 'Cervejas'],
  Tábuas: ['Vinhos', 'Cervejas'],
  Vinhos: ['Frios', 'Tábuas'],
  Cervejas: ['Frios', 'Tábuas'],
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-dark-warm pt-24 px-6 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="h-3 w-28 bg-cream/10 rounded-full mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pb-16 lg:items-start">
          <div className="aspect-square bg-cream/5 rounded-2xl animate-pulse" />
          <div className="flex flex-col gap-4 py-2">
            <div className="h-3 w-20 bg-gold-primary/15 rounded-full animate-pulse" />
            <div className="h-10 w-3/4 bg-cream/10 rounded-lg animate-pulse" />
            <div className="h-6 w-1/2 bg-cream/10 rounded-lg animate-pulse" />
            <div className="space-y-2 mt-2">
              {[1, 0.9, 0.8].map((op, i) => (
                <div
                  key={i}
                  className="h-3 bg-cream/[0.06] rounded-full animate-pulse"
                  style={{ width: `${op * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-6 h-14 bg-gold-primary/10 rounded-full animate-pulse" />
            <div className="h-14 bg-cream/5 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProdutoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [produto, setProduto] = useState<ProdutoPublico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relacionados, setRelacionados] = useState<ProdutoPublico[]>([])
  const [maridagem, setMaridagem] = useState<ProdutoPublico[]>([])
  const [maridagemLoading, setMaridagemLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaInView = useInView(ctaRef, { margin: '-20px 0px' })

  const variantes = produto?.variantes?.filter((v) => v.preco > 0) ?? []
  const multiVariant = variantes.length >= 2
  const singleVariant = variantes.length === 1 ? variantes[0] : null

  const [selectedVariante, setSelectedVariante] = useState<ProdutoVariante | null>(null)

  useEffect(() => {
    setSelectedVariante(singleVariant ?? null)
  }, [produto])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    setProduto(null)
    apiFetch<ProdutoPublico>(`/api/produtos/${id}`)
      .then((res) => {
        if (res.success) setProduto(res.data)
        else setError('Produto não encontrado.')
      })
      .catch(() => setError('Erro de conexão com o servidor.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!produto) return

    const relParams = new URLSearchParams({ categoria: produto.categoria, pageSize: '5', destaque: 'true' })
    apiFetch<{ items: ProdutoPublico[] }>(`/api/produtos?${relParams}`)
      .then((res) => {
        if (res.success) setRelacionados(res.data.items.filter((p) => p.id !== produto.id).slice(0, 4))
      })
      .catch(() => {})

    const catPares = MARIDAGEM_MAP[produto.categoria]
    if (!catPares?.length) return
    setMaridagemLoading(true)
    const fetchCat = (cat: string) =>
      apiFetch<{ items: ProdutoPublico[] }>(
        `/api/produtos?${new URLSearchParams({ categoria: cat, pageSize: '6', destaque: 'true' })}`,
      )
    fetchCat(catPares[0])
      .then(async (res) => {
        if (res.success && res.data.items.length >= 1) {
          setMaridagem(res.data.items.slice(0, 4))
        } else if (catPares[1]) {
          const fb = await fetchCat(catPares[1])
          if (fb.success) setMaridagem(fb.data.items.slice(0, 4))
        }
      })
      .catch(() => {})
      .finally(() => setMaridagemLoading(false))
  }, [produto])

  const handleAdd = (overrideAdded?: () => void) => {
    if (!produto) return
    if (multiVariant && !selectedVariante) {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 2000)
      return
    }
    const activePromo = produto.promocoes[0]
    const precoFinal = selectedVariante?.preco ?? produto.precoComDesconto
    addItem({
      id: selectedVariante ? `produto-${produto.id}-v${selectedVariante.id}` : `produto-${produto.id}`,
      produtoId: produto.id,
      name: produto.nome,
      subtitle: selectedVariante
        ? selectedVariante.descricao
          ? `${selectedVariante.label} · ${selectedVariante.descricao}`
          : selectedVariante.label
        : produto.marca
        ? `${produto.marca} · ${produto.unidadeMedida}`
        : produto.unidadeMedida,
      price: precoFinal,
      category: produto.categoria,
      promocaoId: selectedVariante ? null : (activePromo?.id ?? null),
    })
    if (overrideAdded) {
      overrideAdded()
    } else {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  if (loading) return <PageSkeleton />

  if (error || !produto) {
    return (
      <div className="min-h-screen bg-dark-warm flex flex-col items-center justify-center gap-6 px-6">
        <CrownIcon size={48} weight="fill" className="text-gold-primary/20" />
        <div className="text-center">
          <p className="font-display text-cream/60 text-xl mb-2">Produto não encontrado</p>
          <p className="type-body text-cream/30 text-sm">{error}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 border border-gold-primary/40 text-gold-light font-body font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-full hover:border-gold-primary/70 transition-all duration-300"
        >
          <ArrowLeftIcon size={14} />
          Voltar
        </button>
      </div>
    )
  }

  const hasDiscount = produto.precoComDesconto < produto.preco
  const activePromo = produto.promocoes[0]
  const categoryRoute = CATEGORY_ROUTES[produto.categoria] ?? '/'
  const tipos = produto.tipos ? produto.tipos.split(',').map((t) => t.trim()).filter(Boolean) : []
  const sabores = produto.sabores ? produto.sabores.split(',').map((s) => s.trim()).filter(Boolean) : []
  const maridagemCategoria = MARIDAGEM_MAP[produto.categoria]?.[0]

  const precoExibido = selectedVariante?.preco ?? produto.precoComDesconto
  const minPreco = multiVariant ? Math.min(...variantes.map((v) => v.preco)) : null
  const showAPartirDe = multiVariant && !selectedVariante

  return (
    <>
      {/* ── Mobile CTA fixo ──────────────────────────────────── */}
      <AnimatePresence>
        {!ctaInView && (
          <motion.div
            initial={{ y: 88, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 88, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-cream/96 backdrop-blur-sm border-t border-gold-primary/15 px-4 py-3 flex items-center gap-3"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <div className="flex-1 min-w-0">
              {showAPartirDe ? (
                <>
                  <p className="font-body text-graphite/50 text-[10px] leading-none mb-0.5">a partir de</p>
                  <p className="font-display font-bold text-gold-primary text-xl leading-none">R$ {fmt(minPreco!)}</p>
                </>
              ) : (
                <>
                  {hasDiscount && !selectedVariante && (
                    <p className="font-body text-graphite/40 text-[10px] line-through leading-none">R$ {fmt(produto.preco)}</p>
                  )}
                  <p className="font-display font-bold text-gold-primary text-xl leading-none">R$ {fmt(precoExibido)}</p>
                </>
              )}
            </div>
            <MobileAddButton produto={produto} multiVariant={multiVariant} selectedVariante={selectedVariante} onAdd={handleAdd} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ ÁREA DARK ════════════════════════════════════════════ */}
      <div className="bg-dark-warm">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative pt-24">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 60% 40%, rgba(184,134,11,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 10% 80%, rgba(139,26,26,0.08) 0%, transparent 60%)',
            }}
          />

          {/* Back + Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16 mb-8 flex items-center justify-between gap-4 flex-wrap"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 type-overline text-cream/35 hover:text-cream/70 transition-colors duration-200 text-[10px]"
            >
              <ArrowLeftIcon size={12} />
              Voltar
            </button>
            <nav className="flex items-center gap-2 text-cream/30 text-xs font-body" aria-label="Navegação estrutural">
              <Link to="/" className="hover:text-cream/55 transition-colors duration-200">Início</Link>
              <CaretRightIcon size={10} />
              <Link to={categoryRoute} className="hover:text-cream/55 transition-colors duration-200 capitalize">
                {produto.categoria}
              </Link>
              <CaretRightIcon size={10} />
              <span className="text-cream/50 line-clamp-1 max-w-[120px] sm:max-w-none">{produto.nome}</span>
            </nav>
          </motion.div>

          {/* 2-col grid */}
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pb-16 lg:items-start">

            {/* Imagem — sticky no desktop */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="lg:sticky lg:top-[88px]"
            >
              <div className="relative overflow-hidden rounded-2xl border border-gold-primary/15 aspect-square">
                <img
                  src={produto.imagemUrl || PLACEHOLDER}
                  alt={produto.nome}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  loading="eager"
                  onError={(e) => { ;(e.target as HTMLImageElement).src = PLACEHOLDER }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(26,10,0,0.35) 0%, transparent 55%)' }}
                />
                {produto.destaque && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gradient-gold text-dark-warm px-3 py-1.5 rounded-full">
                    <CrownIcon size={10} weight="fill" />
                    <span className="type-overline text-[9px]">Destaque</span>
                  </div>
                )}
                {hasDiscount && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-bordeaux text-cream px-2.5 py-1.5 rounded-full">
                    <TagIcon size={10} weight="fill" />
                    <span className="type-overline text-[9px]">Oferta</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Informações */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="flex flex-col gap-5 py-1"
            >
              {/* Categoria + marca */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="type-overline text-gold-primary text-[10px]">{produto.categoria}</span>
                {produto.marca && (
                  <>
                    <span className="text-gold-primary/30">·</span>
                    <span className="text-xs font-body bg-gold-primary/10 border border-gold-primary/20 text-gold-light px-2.5 py-0.5 rounded-full">
                      {produto.marca}
                    </span>
                  </>
                )}
              </div>

              {/* Nome + unidade */}
              <div>
                <h1 className="type-display text-cream leading-tight">{produto.nome}</h1>
                {produto.unidadeMedida && (
                  <p className="type-overline text-cream/30 text-[10px] mt-2">{produto.unidadeMedida}</p>
                )}
              </div>

              {/* Descrição */}
              {produto.descricao && (
                <p className="type-body text-cream/60 leading-relaxed">{produto.descricao}</p>
              )}

              {/* Chips de tipos */}
              {tipos.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ListBulletsIcon size={11} className="text-gold-primary/60" />
                    <p className="type-overline text-gold-primary/60 text-[9px]">Tipos</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tipos.map((t) => (
                      <span key={t} className="font-body text-[11px] bg-gold-primary/8 border border-gold-primary/20 text-gold-light/80 px-2.5 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chips de sabores */}
              {sabores.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <LeafIcon size={11} className="text-gold-primary/60" />
                    <p className="type-overline text-gold-primary/60 text-[9px]">Sabores / Ingredientes</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sabores.map((s) => (
                      <span key={s} className="font-body text-[11px] bg-cream/5 border border-cream/15 text-cream/60 px-2.5 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seletor de variantes */}
              {multiVariant && (
                <div>
                  <p className="type-overline text-gold-primary/70 text-[9px] mb-2.5">Tamanho</p>
                  <div className="flex flex-wrap gap-2">
                    {variantes.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariante((prev) => (prev?.id === v.id ? null : v))}
                        className={`px-4 py-2 rounded-lg border font-body text-sm transition-all duration-200 ${
                          selectedVariante?.id === v.id
                            ? 'border-gold-primary bg-gold-primary/15 text-gold-primary'
                            : 'border-cream/20 text-cream/60 hover:border-gold-primary/50 hover:text-gold-light'
                        }`}
                        aria-pressed={selectedVariante?.id === v.id}
                      >
                        {v.label}
                        {v.descricao && <span className="block text-[10px] opacity-60 font-normal">{v.descricao}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {singleVariant && (
                <p className="type-overline text-cream/40 text-[9px]">
                  {singleVariant.label}{singleVariant.descricao ? ` · ${singleVariant.descricao}` : ''}
                </p>
              )}

              {/* Preço */}
              <div className="border-t border-gold-primary/15 pt-5">
                {showAPartirDe ? (
                  <>
                    <p className="font-body text-cream/35 text-sm">a partir de</p>
                    <p className="font-display font-bold text-gold-primary text-4xl">R$ {fmt(minPreco!)}</p>
                  </>
                ) : (
                  <>
                    {hasDiscount && !selectedVariante && (
                      <p className="font-body text-cream/30 text-sm line-through mb-1">R$ {fmt(produto.preco)}</p>
                    )}
                    <p className="font-display font-bold text-gold-primary text-4xl">R$ {fmt(precoExibido)}</p>
                  </>
                )}
              </div>

              {/* CTAs */}
              <div ref={ctaRef} className="flex flex-col gap-3">
                <div className="relative">
                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-dark-warm border border-gold-primary/20 text-cream text-xs font-body rounded-lg whitespace-nowrap shadow-lg z-10 pointer-events-none"
                      >
                        Selecione um tamanho
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                          style={{
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '5px solid rgb(26,10,0)',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => handleAdd()}
                    className={`w-full flex items-center justify-center gap-2 font-body font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-full transition-all duration-300 active:scale-[0.98] ${
                      added
                        ? 'bg-gold-primary/15 border border-gold-primary/40 text-gold-primary'
                        : multiVariant && !selectedVariante
                        ? 'bg-cream/5 border border-cream/15 text-cream/35 cursor-default'
                        : 'bg-gradient-gold text-dark-warm hover:-translate-y-px hover:shadow-gold'
                    }`}
                    aria-label={`Adicionar ${produto.nome} ao carrinho`}
                  >
                    <AnimatePresence mode="wait">
                      {added ? (
                        <motion.span key="added" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                          <CheckIcon size={16} weight="bold" />
                          Adicionado ao carrinho
                        </motion.span>
                      ) : (
                        <motion.span key="add" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                          <ShoppingCartIcon size={16} weight="fill" />
                          {multiVariant && !selectedVariante ? 'Selecione um tamanho' : 'Adicionar ao carrinho'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Tenho interesse no produto "${produto.nome}" da Banca do Dinei.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-gold-primary/40 text-gold-light font-body font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-full hover:border-gold-primary/70 hover:-translate-y-px transition-all duration-300"
                >
                  <WhatsappLogoIcon size={16} weight="fill" />
                  Perguntar no WhatsApp
                </a>
              </div>

              {/* Detalhes inline — peso, marca, promoção */}
              {(produto.pesoKg || produto.marca || activePromo) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gold-primary/8">
                  {produto.pesoKg && (
                    <span className="flex items-center gap-1.5 bg-cream/5 border border-cream/10 rounded-full px-3 py-1.5">
                      <ScalesIcon size={11} weight="light" className="text-gold-primary/50" />
                      <span className="font-body text-cream/45 text-xs">
                        {produto.pesoKg >= 1 ? `${produto.pesoKg} kg` : `${produto.pesoKg * 1000} g`}
                      </span>
                    </span>
                  )}
                  {produto.marca && (
                    <span className="flex items-center gap-1.5 bg-cream/5 border border-cream/10 rounded-full px-3 py-1.5">
                      <BuildingsIcon size={11} weight="light" className="text-gold-primary/50" />
                      <span className="font-body text-cream/45 text-xs">{produto.marca}</span>
                    </span>
                  )}
                  {activePromo && (
                    <span className="flex items-center gap-1.5 bg-bordeaux/15 border border-bordeaux/25 rounded-full px-3 py-1.5">
                      <PercentIcon size={11} weight="bold" className="text-gold-light/70" />
                      <span className="font-body text-gold-light/80 text-xs">{activePromo.nome}</span>
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Combina com (maridagem via API) ─────────────────── */}
        {(maridagemLoading || maridagem.length > 0) && (
          <section className="border-t border-gold-primary/10 py-14 px-6 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE }}
                className="mb-8"
              >
                <p className="type-overline text-gold-primary/70 text-[10px] mb-1">Maridagem</p>
                <h2 className="font-display font-bold text-cream text-2xl">Combina com este produto</h2>
                {maridagemCategoria && (
                  <p className="type-body text-cream/45 text-sm mt-1">
                    Selecionados da nossa carta de{' '}
                    <Link
                      to={CATEGORY_ROUTES[maridagemCategoria] ?? '/'}
                      className="text-gold-light/70 hover:text-gold-light underline underline-offset-2 transition-colors duration-200"
                    >
                      {maridagemCategoria}
                    </Link>{' '}
                    para elevar a experiência.
                  </p>
                )}
              </motion.div>

              {maridagemLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[4/3] bg-cream/5 rounded-xl mb-3" />
                      <div className="h-2.5 bg-cream/8 rounded-full mb-2 w-3/4" />
                      <div className="h-2.5 bg-cream/5 rounded-full w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4">
                  {maridagem.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
                      className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-auto snap-start"
                    >
                      <Link
                        to={`/produtos/${p.id}`}
                        className="group block bg-cream/5 border border-gold-primary/12 rounded-xl overflow-hidden hover:border-gold-primary/30 transition-all duration-300"
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={p.imagemUrl || PLACEHOLDER}
                            alt={p.nome}
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 flex flex-col gap-1.5">
                          <span className="type-overline text-gold-primary/60 text-[9px]">{p.categoria}</span>
                          <p className="font-body font-medium text-cream text-sm leading-snug line-clamp-2">{p.nome}</p>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="font-display text-gold-light font-bold text-base">R$ {fmt(p.precoComDesconto)}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                addItem({
                                  id: `produto-${p.id}`,
                                  produtoId: p.id,
                                  name: p.nome,
                                  subtitle: p.marca ?? p.unidadeMedida,
                                  price: p.precoComDesconto,
                                  category: p.categoria,
                                  promocaoId: p.promocoes?.[0]?.id ?? null,
                                })
                              }}
                              className="p-2 rounded-full bg-gold-primary/10 hover:bg-gold-primary/20 text-gold-primary transition-all duration-200"
                              aria-label={`Adicionar ${p.nome} ao carrinho`}
                            >
                              <ShoppingCartIcon size={14} weight="fill" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Divider antes da seção cream */}
        {relacionados.length >= 2 && (
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-8">
            <SectionDivider dark />
          </div>
        )}
      </div>

      {/* ── Você também pode gostar ──────────────────────────── */}
      {relacionados.length >= 2 && (
        <section className="bg-cream py-12 px-6 lg:px-16 pb-20">
          <div className="max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mb-6"
            >
              <p className="type-overline text-gold-primary text-[10px] mb-1">{produto.categoria}</p>
              <h2 className="font-display font-bold text-graphite text-2xl">Você também pode gostar</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relacionados.map((p, i) => (
                <ProdutoCard key={p.id} produto={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function MobileAddButton({
  produto,
  multiVariant,
  selectedVariante,
  onAdd,
}: {
  produto: ProdutoPublico
  multiVariant: boolean
  selectedVariante: ProdutoVariante | null
  onAdd: (cb?: () => void) => void
}) {
  const [added, setAdded] = useState(false)

  return (
    <button
      onClick={() => onAdd(() => { setAdded(true); setTimeout(() => setAdded(false), 1500) })}
      className={`flex-shrink-0 flex items-center gap-2 font-body font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-full transition-all duration-300 active:scale-[0.98] ${
        added
          ? 'bg-gold-primary/15 border border-gold-primary/40 text-gold-primary'
          : multiVariant && !selectedVariante
          ? 'bg-graphite/10 text-graphite/40'
          : 'bg-gradient-gold text-dark-warm'
      }`}
      aria-label={`Adicionar ${produto.nome} ao carrinho`}
    >
      <AnimatePresence mode="wait">
        {added ? (
          <motion.span key="ok" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5">
            <CheckIcon size={13} weight="bold" />
            Adicionado
          </motion.span>
        ) : (
          <motion.span key="add" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5">
            <ShoppingCartIcon size={13} weight="fill" />
            Adicionar
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

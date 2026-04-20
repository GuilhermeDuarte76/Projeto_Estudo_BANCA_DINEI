import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CrownIcon,
  ShoppingCartIcon,
  CheckIcon,
  TagIcon,
  WhatsappLogoIcon,
  ArrowLeftIcon,
  CaretRightIcon,
} from '@phosphor-icons/react'
import { apiFetch } from '../services/api'
import { useCart } from '../context/CartContext'
import SectionDivider from '../components/layout/SectionDivider'
import { type ProdutoPublico } from '../components/catalogo/ProdutoCard'
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
}

export default function ProdutoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [produto, setProduto] = useState<ProdutoPublico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    apiFetch<ProdutoPublico>(`/api/produtos/${id}`)
      .then((res) => {
        if (res.success) {
          setProduto(res.data)
        } else {
          setError('Produto não encontrado.')
        }
      })
      .catch(() => setError('Erro de conexão com o servidor.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = () => {
    if (!produto) return
    const activePromo = produto.promocoes[0]
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-warm flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold-primary/20 border-t-gold-primary animate-spin" />
      </div>
    )
  }

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

  return (
    <>
      {/* Hero */}
      <section className="relative bg-dark-warm pt-24 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 60% 40%, rgba(184,134,11,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 10% 80%, rgba(139,26,26,0.08) 0%, transparent 60%)',
          }}
        />

        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16 flex items-center gap-2 text-cream/30 text-xs font-body mb-8"
          aria-label="Navegação estrutural"
        >
          <Link to="/" className="hover:text-cream/60 transition-colors duration-200">Início</Link>
          <CaretRightIcon size={10} />
          <Link to={categoryRoute} className="hover:text-cream/60 transition-colors duration-200 capitalize">
            {produto.categoria}
          </Link>
          <CaretRightIcon size={10} />
          <span className="text-cream/50 line-clamp-1">{produto.nome}</span>
        </motion.nav>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pb-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="relative p-2 bg-gold-primary/5 border border-gold-primary/15 rounded-2xl">
              <div className="relative overflow-hidden rounded-[calc(1rem-0.25rem)] aspect-[4/3]">
                <img
                  src={produto.imagemUrl || PLACEHOLDER}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = PLACEHOLDER
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(26,10,0,0.4) 0%, transparent 60%)',
                  }}
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
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="flex flex-col gap-6 py-2"
          >
            {/* Category + brand */}
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

            {/* Name */}
            <div>
              <h1 className="type-display text-cream leading-tight">{produto.nome}</h1>
              {produto.unidadeMedida && (
                <p className="type-overline text-cream/30 text-[10px] mt-2">{produto.unidadeMedida}</p>
              )}
            </div>

            {/* Description */}
            {produto.descricao && (
              <p className="type-body text-cream/60 leading-relaxed">{produto.descricao}</p>
            )}

            {/* Active promo */}
            {activePromo && (
              <div className="bg-bordeaux/15 border border-bordeaux/25 rounded-xl px-4 py-3">
                <p className="type-overline text-gold-light text-[10px]">{activePromo.nome}</p>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t border-gold-primary/15 pt-6">
              {hasDiscount && (
                <p className="font-body text-cream/30 text-sm line-through mb-1">
                  R$ {fmt(produto.preco)}
                </p>
              )}
              <p className="font-display font-bold text-gold-primary text-4xl">
                R$ {fmt(produto.precoComDesconto)}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAdd}
                className={`flex items-center justify-center gap-2 font-body font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-full transition-all duration-300 active:scale-[0.98] ${
                  added
                    ? 'bg-gold-primary/15 border border-gold-primary/40 text-gold-primary'
                    : 'bg-gradient-gold text-dark-warm hover:-translate-y-px hover:shadow-gold'
                }`}
                aria-label={`Adicionar ${produto.nome} ao carrinho`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <CheckIcon size={16} weight="bold" />
                      Adicionado ao carrinho
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCartIcon size={16} weight="fill" />
                      Adicionar ao carrinho
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Olá! Tenho interesse no produto "${produto.nome}" da Banca do Dinei.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-gold-primary/40 text-gold-light font-body font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-full hover:border-gold-primary/70 hover:-translate-y-px transition-all duration-300"
              >
                <WhatsappLogoIcon size={16} weight="fill" />
                Perguntar no WhatsApp
              </a>
            </div>
          </motion.div>
        </div>

        <SectionDivider dark className="-mb-px" />
      </section>

      {/* Back link */}
      <section className="bg-cream py-8 px-6 lg:px-16">
        <div className="max-w-[1400px] mx-auto">
          <Link
            to={categoryRoute}
            className="inline-flex items-center gap-2 text-graphite/50 hover:text-gold-primary transition-colors duration-200 font-body text-sm"
          >
            <ArrowLeftIcon size={14} />
            Ver todos em {produto.categoria}
          </Link>
        </div>
      </section>
    </>
  )
}

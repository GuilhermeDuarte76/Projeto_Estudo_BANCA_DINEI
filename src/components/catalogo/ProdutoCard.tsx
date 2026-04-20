import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { CrownIcon, ShoppingCartIcon, CheckIcon, TagIcon } from '@phosphor-icons/react'
import { useCart } from '../../context/CartContext'
import { EASE } from '../../lib/motion'

export interface PromocaoResumo {
  id: number
  nome: string
  tipoDesconto: string
  valorDesconto: number
  dataFim: string
}

export interface ProdutoPublico {
  id: number
  nome: string
  descricao: string
  preco: number
  precoComDesconto: number
  categoria: string
  marca?: string
  unidadeMedida: string
  pesoKg?: number
  imagemUrl?: string
  destaque: boolean
  promocoes: PromocaoResumo[]
}

const PLACEHOLDER = 'https://picsum.photos/seed/produto/800/600'

interface Props {
  produto: ProdutoPublico
  index: number
}

export default function ProdutoCard({ produto, index }: Props) {
  const [added, setAdded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { addItem } = useCart()

  const hasDiscount = produto.precoComDesconto < produto.preco
  const activePromo = produto.promocoes[0]

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
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.05, ease: EASE }}
      className="group relative h-full"
    >
      <Link
        to={`/produtos/${produto.id}`}
        className="absolute inset-0 z-[1] rounded-2xl"
        aria-label={`Ver detalhes de ${produto.nome}`}
        tabIndex={-1}
      />
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl z-[2] pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(184,134,11,0.4), transparent)',
        }}
      />
      <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-gold-primary/20 bg-cream/80 transition-all duration-500 group-hover:border-gold-primary/50 group-hover:shadow-[0_4px_24px_rgba(184,134,11,0.12)]">
        {/* Image */}
        <div className="relative overflow-hidden h-[220px] flex-shrink-0">
          <img
            src={produto.imagemUrl || PLACEHOLDER}
            alt={produto.nome}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = PLACEHOLDER
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(26,10,0,0.88) 0%, rgba(26,10,0,0.45) 45%, transparent 75%)',
            }}
          />
          {produto.destaque && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-gold text-dark-warm px-3 py-1.5 rounded-full z-10">
              <CrownIcon size={10} weight="fill" />
              <span className="type-overline text-[9px]">Destaque</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-bordeaux text-cream px-2 py-1 rounded-full z-10">
              <TagIcon size={10} weight="fill" />
              <span className="type-overline text-[9px]">Oferta</span>
            </div>
          )}
          {/* Brand + Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            {produto.marca && (
              <span className="type-overline text-gold-primary text-[10px] block mb-1">
                {produto.marca}
              </span>
            )}
            <p className="font-display text-cream text-xl leading-tight line-clamp-2">
              {produto.nome}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          <p className="font-body text-graphite/65 text-xs leading-relaxed line-clamp-3">
            {produto.descricao}
          </p>

          {activePromo && (
            <div className="bg-bordeaux/10 border border-bordeaux/25 rounded-lg px-3 py-1.5">
              <p className="type-overline text-bordeaux text-[10px]">{activePromo.nome}</p>
            </div>
          )}

          {/* Pricing */}
          <div className="border-t border-gold-primary/15 pt-3 mt-auto">
            {hasDiscount && (
              <p className="font-body text-graphite/40 text-xs line-through mb-0.5">
                R$ {produto.preco.toFixed(2).replace('.', ',')}
              </p>
            )}
            <p className="font-display font-bold text-gold-primary text-2xl">
              R$ {produto.precoComDesconto.toFixed(2).replace('.', ',')}
            </p>
            <p className="type-overline text-graphite/40 text-[10px]">{produto.unidadeMedida}</p>
          </div>

          {/* CTA */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAdd()
            }}
            className={`relative z-[2] flex items-center justify-center gap-2 font-body font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg border transition-all duration-300 active:scale-[0.98] ${
              added
                ? 'border-gold-primary/40 bg-gold-primary/15 text-gold-primary'
                : 'border-gold-primary/35 text-gold-primary/75 hover:border-gold-primary/70 hover:bg-gold-primary/10 hover:text-gold-primary'
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
                  <CheckIcon size={14} weight="bold" />
                  Adicionado
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
                  <ShoppingCartIcon size={14} weight="fill" />
                  Adicionar
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.article>
  )
}

import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { CrownIcon, ShoppingCartIcon, CheckIcon, TagIcon } from '@phosphor-icons/react'
import { useCart } from '../../context/CartContext'

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

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]
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
      <div className="h-full p-1 bg-cream border border-gold-primary/30 rounded-2xl transition-all duration-500 group-hover:border-gold-primary/60 group-hover:shadow-gold-hover">
        <div
          className="h-full flex flex-col rounded-[calc(1rem-0.25rem)] overflow-hidden bg-cream"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)' }}
        >
          {/* Image */}
          <div className="relative overflow-hidden h-40">
            <img
              src={produto.imagemUrl || PLACEHOLDER}
              alt={produto.nome}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = PLACEHOLDER
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(26,10,0,0.6) 0%, transparent 60%)',
              }}
            />
            {produto.destaque && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gradient-gold text-dark-warm px-3 py-1.5 rounded-full">
                <CrownIcon size={10} weight="fill" />
                <span className="type-overline text-[9px]">Destaque</span>
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-bordeaux text-cream px-2 py-1 rounded-full">
                <TagIcon size={10} weight="fill" />
                <span className="type-overline text-[9px]">Oferta</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <p className="font-display font-bold text-cream text-lg leading-tight">
                {produto.nome}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col gap-3 flex-1">
            {produto.marca && (
              <span className="text-[11px] font-body bg-beige border border-gold-primary/20 text-graphite px-2 py-0.5 rounded-full self-start">
                {produto.marca}
              </span>
            )}

            <p className="type-body text-graphite/70 text-sm leading-snug line-clamp-2">
              {produto.descricao}
            </p>

            {activePromo && (
              <div className="bg-bordeaux/10 border border-bordeaux/20 rounded-xl px-3 py-2">
                <p className="type-overline text-bordeaux text-[10px]">{activePromo.nome}</p>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t border-gold-primary/20 pt-3 mt-auto">
              <div className="flex items-end gap-1">
                {hasDiscount && (
                  <p className="font-body text-graphite/40 text-xs line-through mb-0.5">
                    R$ {produto.preco.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
              <p className="font-display font-bold text-gold-primary text-2xl">
                R$ {produto.precoComDesconto.toFixed(2).replace('.', ',')}
              </p>
              <p className="type-overline text-graphite/40 text-[10px]">{produto.unidadeMedida}</p>
            </div>

            {/* CTA */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd() }}
              className={`relative z-[2] flex items-center justify-center gap-2 font-body font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-full transition-all duration-300 active:scale-[0.98] ${
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
      </div>
    </motion.article>
  )
}

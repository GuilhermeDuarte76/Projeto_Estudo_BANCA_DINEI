import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'
import CardapioItem from './CardapioItem'
import CardapioVariantes from './CardapioVariantes'

interface CardapioNacionalidade {
  id: number
  nome: string
  imagemUrl: string
}

export interface CardapioProduct {
  id: number
  nome: string
  descricao?: string | null
  preco: number
  precoComDesconto?: number
  categoria: string
  tipos?: string | null
  nacionalidade?: CardapioNacionalidade | null
  variantes?: { id: number; label: string; descricao?: string | null; preco: number; ordem: number }[]
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.50, ease: EASE } },
}

interface Props {
  titulo: string
  produtos: CardapioProduct[]
}

export default function CardapioSection({ titulo, produtos }: Props) {
  const isVinhos = titulo === 'Vinhos'

  return (
    <div>
      {/* Section header */}
      <div className="relative overflow-hidden mb-6 py-1">
        <div className="h-px mb-3" style={{ background: 'linear-gradient(to right, transparent, rgba(223,166,43,0.55), transparent)' }} />
        <motion.p
          className="text-center tracking-[0.36em] uppercase"
          style={{ fontFamily: "'Teko', sans-serif", fontSize: 13, color: 'rgba(223,166,43,0.85)', letterSpacing: '0.36em' }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: EASE }}
        >
          {titulo}
        </motion.p>
        <div className="h-px mt-3" style={{ background: 'linear-gradient(to right, transparent, rgba(223,166,43,0.35), transparent)' }} />

        {/* Shimmer sweep on section mount */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(223,166,43,0.13) 50%, transparent 100%)' }}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 1.0, delay: 0.06, ease: 'easeOut' }}
        />
      </div>

      <motion.div variants={container} initial="hidden" animate="visible">
        {produtos.map((p) => {
          const variantes = p.variantes ?? []
          const precoEfetivo = p.precoComDesconto && p.precoComDesconto > 0 && p.precoComDesconto < p.preco
            ? p.precoComDesconto
            : p.preco
          const temDesconto = precoEfetivo < p.preco
          const wineDescription = isVinhos ? p.tipos?.trim() || undefined : p.descricao
          const titlePrefix = isVinhos && p.nacionalidade?.imagemUrl ? (
            <img
              src={p.nacionalidade.imagemUrl}
              alt={`Bandeira de ${p.nacionalidade.nome}`}
              className="h-4 w-6 rounded-[4px] border border-[#dba94c]/25 object-cover shadow-[0_4px_10px_rgba(0,0,0,0.18)] shrink-0"
              loading="lazy"
            />
          ) : null

          return (
            <motion.div key={p.id} variants={item}>
              {variantes.length > 1 ? (
                <CardapioVariantes
                  nome={p.nome}
                  descricao={wineDescription}
                  titlePrefix={titlePrefix}
                  variantes={variantes.map((v) => ({ label: v.label, descricao: v.descricao, preco: v.preco }))}
                />
              ) : (
                <CardapioItem
                  nome={p.nome}
                  descricao={wineDescription}
                  preco={precoEfetivo}
                  precoOriginal={temDesconto ? p.preco : undefined}
                  titlePrefix={titlePrefix}
                />
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

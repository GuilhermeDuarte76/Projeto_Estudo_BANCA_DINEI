import type { ReactNode } from 'react'

const fmt = (preco: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco)

interface Props {
  nome: string
  descricao?: string | null
  preco: number
  precoOriginal?: number
  titlePrefix?: ReactNode
}

export default function CardapioItem({ nome, descricao, preco, precoOriginal, titlePrefix }: Props) {
  const hasPromo = precoOriginal !== undefined && precoOriginal > preco

  return (
    <div className="group relative py-4 border-b transition-colors duration-200" style={{ borderColor: 'rgba(223,166,43,0.13)' }}>
      {/* Accent left bar */}
      <div
        className="absolute left-0 inset-y-0 w-[2px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(223,166,43,0.70), transparent)' }}
      />
      {/* Row hover bg */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'rgba(223,166,43,0.032)' }}
      />

      {/*
        Grid layout: nome ocupa toda a largura disponível (wraps se necessário),
        preço sempre na segunda coluna — nunca cortado em mobile.
      */}
      <div
        className="relative"
        style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '0 12px' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {titlePrefix}
          <span
            className="font-display leading-snug min-w-0"
            style={{ fontSize: 16, color: '#F0EAD6' }}
          >
            {nome}
          </span>
        </div>

        {/* Price column — sempre visível */}
        <div className="flex flex-col items-end gap-0.5 pt-[2px]">
          {hasPromo && (
            <span
              className="font-display line-through leading-none"
              style={{ fontSize: 12, color: 'rgba(245,240,232,0.32)' }}
            >
              {fmt(precoOriginal!)}
            </span>
          )}
          <span
            className="font-display font-bold whitespace-nowrap leading-snug"
            style={{ fontSize: 16, color: hasPromo ? '#DFA62B' : '#C8A04A' }}
          >
            {fmt(preco)}
          </span>
        </div>

        {/* Description — span full width */}
        {descricao && (
          <p
            className="font-subtitle italic mt-1 leading-relaxed line-clamp-2"
            style={{ fontSize: 13, color: 'rgba(245,240,232,0.50)', gridColumn: '1 / -1' }}
          >
            {descricao}
          </p>
        )}
      </div>
    </div>
  )
}

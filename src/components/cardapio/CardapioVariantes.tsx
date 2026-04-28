import type { ReactNode } from 'react'

const fmt = (preco: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco)

interface Variante {
  label: string
  descricao?: string | null
  preco: number
}

interface Props {
  nome: string
  variantes: Variante[]
  descricao?: string | null
  titlePrefix?: ReactNode
}

export default function CardapioVariantes({ nome, variantes, descricao, titlePrefix }: Props) {
  return (
    <div className="py-4 border-b" style={{ borderColor: 'rgba(223,166,43,0.13)' }}>
      <div className="mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {titlePrefix}
          <p
            className="font-display font-semibold leading-snug min-w-0"
            style={{ fontSize: 16, color: '#F0EAD6' }}
          >
            {nome}
          </p>
        </div>
        {descricao && (
          <p
            className="font-subtitle italic mt-1 leading-relaxed line-clamp-2"
            style={{ fontSize: 12.5, color: 'rgba(245,240,232,0.50)' }}
          >
            {descricao}
          </p>
        )}
      </div>
      {variantes.map((v, i) => (
        <div
          key={i}
          className="pl-4 py-2 border-b last:border-0"
          style={{
            borderColor: 'rgba(223,166,43,0.08)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: '0 10px',
          }}
        >
          {/* Label + descrição */}
          <div className="flex flex-wrap items-baseline gap-x-2 min-w-0">
            <span
              className="flex-shrink-0 tracking-[0.16em] uppercase"
              style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: 'rgba(245,240,232,0.65)' }}
            >
              {v.label}
            </span>
            {v.descricao && (
              <span
                className="font-subtitle italic min-w-0"
                style={{ fontSize: 11.5, color: 'rgba(245,240,232,0.38)' }}
              >
                {v.descricao}
              </span>
            )}
          </div>

          {/* Preço — sempre visível */}
          <span
            className="font-display font-bold whitespace-nowrap text-right"
            style={{ fontSize: 14, color: '#C8A04A' }}
          >
            {fmt(v.preco)}
          </span>
        </div>
      ))}
    </div>
  )
}

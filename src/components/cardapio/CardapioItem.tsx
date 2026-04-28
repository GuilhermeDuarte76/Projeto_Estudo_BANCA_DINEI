import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

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
  const [expanded, setExpanded] = useState(false)
  const pointerStartRef = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const isInteractive = !!descricao

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isInteractive) return
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      moved: false,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return

    const deltaX = Math.abs(event.clientX - pointerStartRef.current.x)
    const deltaY = Math.abs(event.clientY - pointerStartRef.current.y)

    if (deltaX > 10 || deltaY > 10) {
      pointerStartRef.current.moved = true
    }
  }

  const handlePointerUp = () => {
    if (!pointerStartRef.current) return

    const shouldToggle = !pointerStartRef.current.moved
    pointerStartRef.current = null

    if (shouldToggle) {
      setExpanded((current) => !current)
    }
  }

  const handlePointerCancel = () => {
    pointerStartRef.current = null
  }

  return (
    <div
      className={`group relative py-4 border-b transition-colors duration-200 ${isInteractive ? 'cursor-pointer select-none' : ''}`}
      style={{ borderColor: 'rgba(223,166,43,0.13)', WebkitTapHighlightColor: 'transparent' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
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
            style={{ fontSize: 16.5, color: '#F4EEE1', textShadow: '0 1px 1px rgba(0,0,0,0.10)' }}
          >
            {nome}
          </span>
        </div>

        {/* Price column — sempre visível */}
        <div className="flex flex-col items-end gap-0.5 pt-[2px]">
          {hasPromo && (
            <span
              className="font-display line-through leading-none"
              style={{ fontSize: 12, color: 'rgba(245,240,232,0.38)' }}
            >
              {fmt(precoOriginal!)}
            </span>
          )}
          <span
            className="font-display font-bold whitespace-nowrap leading-snug"
            style={{ fontSize: 16, color: hasPromo ? '#DFA62B' : '#CFA654', textShadow: '0 1px 1px rgba(0,0,0,0.10)' }}
          >
            {fmt(preco)}
          </span>
        </div>

        {/* Description — span full width */}
        {descricao && (
          <p
            className={`font-subtitle italic mt-1 leading-relaxed transition-all duration-200 ${expanded ? '' : 'line-clamp-2'}`}
            style={{ fontSize: 13.25, color: 'rgba(245,240,232,0.62)', gridColumn: '1 / -1' }}
          >
            {descricao}
          </p>
        )}
      </div>
    </div>
  )
}

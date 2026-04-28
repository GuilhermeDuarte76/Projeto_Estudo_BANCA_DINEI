import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

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
    <div className="py-4 border-b" style={{ borderColor: 'rgba(223,166,43,0.13)' }}>
      <div
        className={`${isInteractive ? 'cursor-pointer select-none' : ''} mb-3`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="flex items-center gap-2 min-w-0">
          {titlePrefix}
          <p
            className="font-display leading-snug min-w-0"
            style={{ fontSize: 16.5, color: '#F4EEE1', textShadow: '0 1px 1px rgba(0,0,0,0.10)' }}
          >
            {nome}
          </p>
        </div>
        {descricao && (
          <p
            className={`font-subtitle italic mt-1 leading-relaxed transition-all duration-200 ${expanded ? '' : 'line-clamp-2'}`}
            style={{ fontSize: 12.75, color: 'rgba(245,240,232,0.62)' }}
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
              className="flex-shrink-0 tracking-[0.15em] uppercase"
              style={{ fontFamily: "'Teko', sans-serif", fontSize: 11.25, color: 'rgba(245,240,232,0.72)' }}
            >
              {v.label}
            </span>
            {v.descricao && (
              <span
                className="font-subtitle italic min-w-0"
                style={{ fontSize: 11.75, color: 'rgba(245,240,232,0.50)' }}
              >
                {v.descricao}
              </span>
            )}
          </div>

          {/* Preço — sempre visível */}
          <span
            className="font-display font-bold whitespace-nowrap text-right"
            style={{ fontSize: 14.25, color: '#CFA654', textShadow: '0 1px 1px rgba(0,0,0,0.10)' }}
          >
            {fmt(v.preco)}
          </span>
        </div>
      ))}
    </div>
  )
}

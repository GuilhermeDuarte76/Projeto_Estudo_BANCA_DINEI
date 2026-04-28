const ROWS = [
  { nameW: '72%', priceW: '14%' },
  { nameW: '52%', priceW: '12%' },
  { nameW: '66%', priceW: '15%' },
  { nameW: '80%', priceW: '13%' },
  { nameW: '44%', priceW: '14%' },
  { nameW: '60%', priceW: '12%' },
]

export default function CardapioSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Section header skeleton */}
      <div className="mb-4">
        <div className="h-px mb-2.5" style={{ background: 'rgba(223,166,43,0.12)' }} />
        <div className="h-2.5 rounded mx-auto" style={{ width: '22%', background: 'rgba(255,255,255,0.07)' }} />
        <div className="h-px mt-2.5" style={{ background: 'rgba(223,166,43,0.08)' }} />
      </div>

      {ROWS.map((row, i) => (
        <div key={i} className="py-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(223,166,43,0.10)' }}>
          <div className="h-4 rounded flex-shrink-0" style={{ width: row.nameW, background: 'rgba(255,255,255,0.07)' }} />
          <div className="flex-1 border-b border-dashed" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
          <div className="h-4 rounded flex-shrink-0" style={{ width: row.priceW, background: 'rgba(223,166,43,0.10)' }} />
        </div>
      ))}
    </div>
  )
}

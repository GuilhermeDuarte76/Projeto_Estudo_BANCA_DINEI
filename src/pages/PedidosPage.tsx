import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardTextIcon, CaretDownIcon, WarningCircleIcon,
  PackageIcon, ArrowClockwiseIcon,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { getPedidos, type Pedido, type PedidoStatus } from '../services/pedidos'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PedidoStatus, { label: string; color: string; bg: string; border: string }> = {
  Pendente:    { label: 'Pendente',    color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30' },
  Confirmado:  { label: 'Confirmado',  color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/30' },
  EmPreparo:   { label: 'Em Preparo',  color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/30' },
  AEntregar:   { label: 'A Entregar',  color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/30' },
  Entregue:    { label: 'Entregue',    color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  Cancelado:   { label: 'Cancelado',   color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30' },
}

const ALL_STATUSES: PedidoStatus[] = ['Pendente', 'Confirmado', 'EmPreparo', 'AEntregar', 'Entregue', 'Cancelado']

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PedidoStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center type-overline text-[9px] tracking-widest px-2.5 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

// ── Order Card ────────────────────────────────────────────────────────────────

function PedidoCard({ pedido, index }: { pedido: Pedido; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: EASE }}
      className="bg-white/3 border border-gold-primary/12 rounded-2xl overflow-hidden"
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/2 transition-colors duration-200"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center flex-shrink-0">
            <ClipboardTextIcon size={16} weight="fill" className="text-gold-primary/70" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-body font-bold text-cream/90 text-sm">Pedido #{pedido.id}</p>
              <StatusBadge status={pedido.status} />
            </div>
            <p className="type-overline text-[9px] text-cream/35 tracking-widest mt-0.5">
              {formatDate(pedido.criadoEm)} · {pedido.itens.length} {pedido.itens.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <p className="font-display font-bold text-gold-light text-sm">{formatCurrency(pedido.total)}</p>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="text-cream/30 inline-flex"
          >
            <CaretDownIcon size={13} weight="bold" />
          </motion.span>
        </div>
      </button>

      {/* Expandable details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gold-primary/8">
              {/* Items */}
              <div className="space-y-2 mt-4">
                {pedido.itens.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="type-overline text-[9px] text-cream/30 w-5 text-right shrink-0">{item.quantidade}×</span>
                      <p className="text-cream/70 text-sm font-body truncate">{item.nomeProduto}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.descontoAplicado > 0 && (
                        <span className="type-overline text-[8px] text-emerald-400/80 tracking-widest">
                          -{formatCurrency(item.descontoAplicado)}
                        </span>
                      )}
                      <p className="text-cream/60 text-sm font-body">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-gold-primary/8 space-y-1.5">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-cream/40">Subtotal</span>
                  <span className="text-cream/60">{formatCurrency(pedido.subtotal)}</span>
                </div>
                {pedido.descontoTotal > 0 && (
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-cream/40">Desconto</span>
                    <span className="text-emerald-400">-{formatCurrency(pedido.descontoTotal)}</span>
                  </div>
                )}
                {pedido.valorFrete > 0 && (
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-cream/40">Frete</span>
                    <span className="text-cream/60">{formatCurrency(pedido.valorFrete)}</span>
                  </div>
                )}
                <div className="flex justify-between font-body font-bold pt-1 border-t border-gold-primary/8">
                  <span className="text-cream/70 text-sm">Total</span>
                  <span className="text-gold-light text-sm">{formatCurrency(pedido.total)}</span>
                </div>
              </div>

              {/* Extra info */}
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                {pedido.formaPagamento && (
                  <p className="type-overline text-[9px] text-cream/30 tracking-widest">
                    Pagamento: <span className="text-cream/50">{pedido.formaPagamento}</span>
                  </p>
                )}
                {pedido.observacoes && (
                  <p className="type-overline text-[9px] text-cream/30 tracking-widest">
                    Obs: <span className="text-cream/50">{pedido.observacoes}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PedidosPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<PedidoStatus | undefined>(undefined)

  const fetchPedidos = useCallback(async (status?: PedidoStatus) => {
    setLoading(true)
    setError('')
    const res = await getPedidos(status)
    if (res.success) {
      setPedidos(res.data?.items ?? [])
    } else {
      setError(res.message || 'Erro ao carregar pedidos.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchPedidos(filterStatus)
  }, [isAuthenticated, filterStatus, fetchPedidos])

  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/" replace />

  return (
    <section className="min-h-screen bg-dark-warm pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8"
        >
          <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">Conta</p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-display font-bold text-3xl text-cream">Meus Pedidos</h1>
            <button
              onClick={() => fetchPedidos(filterStatus)}
              title="Atualizar"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/40 hover:border-gold-primary/50 hover:text-gold-light transition-all duration-300"
            >
              <ArrowClockwiseIcon size={15} />
            </button>
          </div>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
          className="flex gap-2 mb-8 overflow-x-auto pb-1"
        >
          <button
            onClick={() => setFilterStatus(undefined)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full type-overline text-[9px] tracking-widest whitespace-nowrap transition-all duration-300 shrink-0 ${
              filterStatus === undefined
                ? 'bg-gradient-gold text-dark-warm font-bold shadow-gold'
                : 'border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80'
            }`}
          >
            Todos
          </button>
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s]
            const active = filterStatus === s
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full type-overline text-[9px] tracking-widest whitespace-nowrap transition-all duration-300 shrink-0 border ${
                  active
                    ? `${cfg.bg} ${cfg.border} ${cfg.color} font-bold`
                    : 'border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80'
                }`}
              >
                {cfg.label}
              </button>
            )
          })}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <ArrowClockwiseIcon size={24} className="text-gold-primary/50" />
            </motion.div>
            <p className="type-overline text-[10px] text-cream/30 tracking-widest">Carregando pedidos...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <WarningCircleIcon size={28} className="text-red-400/60" />
            <p className="text-cream/40 text-sm font-body">{error}</p>
            <button
              onClick={() => fetchPedidos(filterStatus)}
              className="type-overline text-[9px] tracking-widest text-gold-primary/60 hover:text-gold-light transition-colors duration-200"
            >
              Tentar novamente
            </button>
          </div>
        ) : pedidos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-3"
          >
            <PackageIcon size={36} className="text-cream/10" />
            <p className="text-cream/35 text-sm font-body">
              {filterStatus
                ? `Nenhum pedido com status "${STATUS_CONFIG[filterStatus].label}".`
                : 'Você ainda não fez nenhum pedido.'}
            </p>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus(undefined)}
                className="type-overline text-[9px] tracking-widest text-gold-primary/60 hover:text-gold-light transition-colors duration-200"
              >
                Ver todos os pedidos
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((p, i) => (
              <PedidoCard key={p.id} pedido={p} index={i} />
            ))}
            <p className="text-center type-overline text-[9px] text-cream/20 tracking-widest pt-2">
              {pedidos.length} {pedidos.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

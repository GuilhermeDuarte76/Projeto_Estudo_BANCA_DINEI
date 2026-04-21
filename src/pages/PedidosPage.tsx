import { Fragment, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardTextIcon, CaretDownIcon, WarningCircleIcon,
  PackageIcon, ArrowClockwiseIcon,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { getPedidos, type Pedido, type PedidoStatus } from '../services/pedidos'
import { EASE } from '../lib/motion'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PedidoStatus, {
  label: string
  color: string
  bg: string
  border: string
  accent: string
}> = {
  Pendente:   { label: 'Pendente',   color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   accent: 'bg-amber-400/70' },
  Confirmado: { label: 'Confirmado', color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/30',    accent: 'bg-blue-400/70' },
  EmPreparo:  { label: 'Em Preparo', color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/30',  accent: 'bg-purple-400/70' },
  AEntregar:  { label: 'A Entregar', color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/30',    accent: 'bg-cyan-400/70' },
  Entregue:   { label: 'Entregue',   color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', accent: 'bg-emerald-400/70' },
  Cancelado:  { label: 'Cancelado',  color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30',     accent: 'bg-red-400/70' },
}

const STATUS_FLOW: PedidoStatus[] = ['Pendente', 'Confirmado', 'EmPreparo', 'AEntregar', 'Entregue']
const ALL_STATUSES: PedidoStatus[] = ['Pendente', 'Confirmado', 'EmPreparo', 'AEntregar', 'Entregue', 'Cancelado']

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
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

// ── Status Timeline ───────────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: PedidoStatus }) {
  const isCanceled = status === 'Cancelado'
  const currentIndex = STATUS_FLOW.indexOf(status)

  return (
    <div className="flex items-start">
      {STATUS_FLOW.map((s, i) => {
        const done = !isCanceled && i <= currentIndex
        const current = !isCanceled && i === currentIndex

        return (
          <Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                w-2 h-2 rounded-full shrink-0 transition-all duration-300
                ${current
                  ? 'ring-2 ring-offset-1 ring-offset-dark-warm ring-gold-primary/50 bg-gold-primary'
                  : done
                  ? 'bg-gold-primary/50'
                  : isCanceled
                  ? 'bg-white/8'
                  : 'bg-white/8'}
              `} />
              <p className={`text-[8px] tracking-wide uppercase font-body text-center leading-tight w-11 ${
                current ? 'text-gold-primary' : done ? 'text-gold-primary/45' : 'text-cream/18'
              }`}>
                {STATUS_CONFIG[s].label}
              </p>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`h-px flex-1 mt-[3px] mx-1 ${
                !isCanceled && i < currentIndex ? 'bg-gold-primary/35' : 'bg-white/8'
              }`} />
            )}
          </Fragment>
        )
      })}

      {isCanceled && (
        <div className="flex flex-col items-center gap-1.5 ml-2">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <p className="text-[8px] tracking-wide uppercase font-body text-red-400/60">Cancelado</p>
        </div>
      )}
    </div>
  )
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function PedidoCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: EASE }}
      className="bg-white/3 border border-gold-primary/10 rounded-2xl overflow-hidden"
    >
      <div className="h-[2px] bg-white/5 animate-pulse" />
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3.5 bg-white/6 rounded-full w-24 animate-pulse" />
            <div className="h-3 bg-white/4 rounded-full w-16 animate-pulse" />
          </div>
          <div className="h-2.5 bg-white/4 rounded-full w-40 animate-pulse" />
        </div>
        <div className="space-y-1 items-end flex flex-col">
          <div className="h-4 bg-white/6 rounded-full w-16 animate-pulse" />
          <div className="h-2.5 bg-white/3 rounded-full w-10 animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

// ── Stats Strip ───────────────────────────────────────────────────────────────

function StatsStrip({ pedidos, totalCount }: { pedidos: Pedido[]; totalCount: number }) {
  const activeCount = pedidos.filter(p => p.status !== 'Entregue' && p.status !== 'Cancelado').length
  const lastDate = pedidos.length > 0 ? formatDate(pedidos[0].criadoEm) : '—'

  const stats = [
    { label: 'pedidos', value: String(totalCount) },
    { label: 'ativos', value: String(activeCount) },
    { label: 'recente', value: lastDate },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12, ease: EASE }}
      className="grid grid-cols-3 gap-2 mb-6"
    >
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="bg-white/3 border border-gold-primary/10 rounded-xl px-2 py-2.5 text-center"
        >
          <p className="font-display font-bold text-gold-light text-base leading-tight truncate">{value}</p>
          <p className="type-overline text-[8px] text-cream/25 tracking-wide mt-0.5">{label}</p>
        </div>
      ))}
    </motion.div>
  )
}

// ── Pedido Card ───────────────────────────────────────────────────────────────

function PedidoCard({ pedido, index }: { pedido: Pedido; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[pedido.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: EASE }}
      className="bg-white/3 border border-gold-primary/12 rounded-2xl overflow-hidden hover:border-gold-primary/25 transition-colors duration-300"
    >
      {/* Status accent bar */}
      <div className={`h-[2px] w-full ${cfg.accent}`} />

      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/2 transition-colors duration-200 group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border}`}>
            <ClipboardTextIcon size={16} weight="fill" className={cfg.color} />
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

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="font-display font-bold text-gold-light text-sm">{formatCurrency(pedido.total)}</p>
            {pedido.descontoTotal > 0 && (
              <p className="text-[9px] text-emerald-400/60 font-body -mt-0.5">-{formatCurrency(pedido.descontoTotal)}</p>
            )}
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`inline-flex transition-colors duration-200 ${expanded ? 'text-gold-primary/60' : 'text-cream/25 group-hover:text-cream/45'}`}
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
            <div className="px-5 pb-5 border-t border-gold-primary/8 space-y-5">

              {/* Items */}
              <div className="pt-4">
                <p className="type-overline text-[8px] text-cream/25 tracking-widest mb-3">Itens do pedido</p>
                <div className="space-y-2.5">
                  {pedido.itens.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="type-overline text-[9px] text-gold-primary/50 shrink-0 w-5 text-right">
                          {item.quantidade}×
                        </span>
                        <p className="text-cream/70 text-sm font-body truncate">{item.produtoNome}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.descontoAplicado > 0 && (
                          <span className="type-overline text-[8px] text-emerald-400/70 tracking-widest">
                            -{formatCurrency(item.descontoAplicado)}
                          </span>
                        )}
                        <p className="text-cream/60 text-sm font-body font-medium">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gold-primary/8 pt-4 space-y-1.5">
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
                <div className="flex justify-between font-body font-bold pt-2 border-t border-gold-primary/8">
                  <span className="text-cream/80 text-sm">Total</span>
                  <span className="text-gold-light text-sm font-display">{formatCurrency(pedido.total)}</span>
                </div>
              </div>

              {/* Status timeline */}
              <div className="border-t border-gold-primary/8 pt-4">
                <p className="type-overline text-[8px] text-cream/25 tracking-widest mb-3">Acompanhamento</p>
                <StatusTimeline status={pedido.status} />
              </div>

              {/* Status history */}
              {pedido.statusHistorico && pedido.statusHistorico.length > 0 && (
                <div className="border-t border-gold-primary/8 pt-4">
                  <p className="type-overline text-[8px] text-cream/25 tracking-widest mb-3">Histórico</p>
                  <div className="space-y-2.5">
                    {[...pedido.statusHistorico].reverse().map((h, i) => {
                      const hcfg = STATUS_CONFIG[h.statusNovo]
                      return (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full mt-[5px] shrink-0 ${hcfg.accent}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-body font-semibold ${hcfg.color}`}>
                                {hcfg.label}
                              </span>
                              <span className="text-[9px] text-cream/22 font-body">
                                {formatDateTime(h.alteradoEm)}
                              </span>
                            </div>
                            {h.observacao && (
                              <p className="text-[9px] text-cream/38 font-body mt-0.5 italic">{h.observacao}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Extra info */}
              {(pedido.formaPagamento || pedido.observacoes) && (
                <div className="border-t border-gold-primary/8 pt-4 space-y-1.5">
                  {pedido.formaPagamento && (
                    <div className="flex items-baseline gap-3">
                      <p className="type-overline text-[8px] text-cream/22 tracking-widest shrink-0 w-24">Pagamento</p>
                      <p className="text-cream/50 text-xs font-body">{pedido.formaPagamento}</p>
                    </div>
                  )}
                  {pedido.observacoes && (
                    <div className="flex items-baseline gap-3">
                      <p className="type-overline text-[8px] text-cream/22 tracking-widest shrink-0 w-24">Observações</p>
                      <p className="text-cream/50 text-xs font-body">{pedido.observacoes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PedidosPage() {
  const { isAuthenticated } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<PedidoStatus | undefined>(undefined)

  const fetchPedidos = useCallback(async (status?: PedidoStatus, pageNum = 1, append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setError('')
      if (pageNum === 1) setPedidos([])
    }

    const res = await getPedidos(status, pageNum, 10)

    if (res.success && res.data) {
      setPedidos(prev => append ? [...prev, ...res.data!.items] : res.data!.items)
      setTotalCount(res.data.totalCount)
      setTotalPages(res.data.totalPages)
      setPage(pageNum)
    } else if (!append) {
      setError(res.message || 'Erro ao carregar pedidos.')
    }

    if (append) setLoadingMore(false)
    else setLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchPedidos(filterStatus, 1, false)
  }, [isAuthenticated, filterStatus, fetchPedidos])

  return (
    <section className="min-h-screen bg-dark-warm pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-6"
        >
          <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">Conta</p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-display font-bold text-3xl text-cream">Meus Pedidos</h1>
            <button
              onClick={() => fetchPedidos(filterStatus, 1, false)}
              title="Atualizar lista"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/40 hover:border-gold-primary/50 hover:text-gold-light transition-all duration-300"
            >
              <ArrowClockwiseIcon size={15} />
            </button>
          </div>
        </motion.div>

        {/* Stats strip — visible after first load with results */}
        {!loading && pedidos.length > 0 && (
          <StatsStrip pedidos={pedidos} totalCount={totalCount} />
        )}

        {/* Filter select */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
          className="relative mb-6"
        >
          {filterStatus && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none z-10 ${STATUS_CONFIG[filterStatus].accent}`} />
          )}
          <select
            value={filterStatus ?? ''}
            onChange={e => setFilterStatus(e.target.value === '' ? undefined : e.target.value as PedidoStatus)}
            style={{ backgroundColor: '#160800' }}
            className={`w-full appearance-none border rounded-xl py-3 pr-10 font-body text-sm transition-colors duration-200 cursor-pointer focus:outline-none focus:border-gold-primary/50 ${
              filterStatus
                ? `${STATUS_CONFIG[filterStatus].border} ${STATUS_CONFIG[filterStatus].color} pl-9`
                : 'border-gold-primary/20 text-cream/55 pl-4'
            }`}
          >
            <option value="">Todos os pedidos</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gold-primary/40">
            <CaretDownIcon size={13} weight="bold" />
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => <PedidoCardSkeleton key={i} index={i} />)}
          </div>

        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <WarningCircleIcon size={28} className="text-red-400/60" />
            <p className="text-cream/40 text-sm font-body">{error}</p>
            <button
              onClick={() => fetchPedidos(filterStatus, 1, false)}
              className="type-overline text-[9px] tracking-widest text-gold-primary/60 hover:text-gold-light transition-colors duration-200 mt-1"
            >
              Tentar novamente
            </button>
          </div>

        ) : pedidos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/3 border border-gold-primary/15 flex items-center justify-center">
              <PackageIcon size={28} className="text-cream/18" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-cream/50 text-sm font-body">
                {filterStatus
                  ? `Nenhum pedido com status "${STATUS_CONFIG[filterStatus].label}".`
                  : 'Você ainda não fez nenhum pedido.'}
              </p>
              {!filterStatus && (
                <p className="text-cream/25 text-xs font-body">
                  Seus pedidos aparecerão aqui após a finalização via WhatsApp.
                </p>
              )}
            </div>
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

            {/* Load more */}
            {page < totalPages && (
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => fetchPedidos(filterStatus, page + 1, true)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gold-primary/30 text-gold-primary/70 hover:border-gold-primary/60 hover:text-gold-light transition-all duration-300 type-overline text-[9px] tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loadingMore && (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="inline-flex"
                    >
                      <ArrowClockwiseIcon size={12} />
                    </motion.span>
                  )}
                  {loadingMore ? 'Carregando...' : 'Carregar mais'}
                </button>
              </div>
            )}

            <p className="text-center type-overline text-[8px] text-cream/18 tracking-widest pt-1">
              {pedidos.length} de {totalCount} {totalCount === 1 ? 'pedido' : 'pedidos'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

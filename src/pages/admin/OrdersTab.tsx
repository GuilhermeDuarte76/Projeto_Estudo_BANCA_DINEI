import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XIcon, WarningCircleIcon, ArrowRightIcon, ClipboardTextIcon, ArrowsClockwiseIcon,
  CaretRightIcon, UserCircleIcon,
} from '@phosphor-icons/react'
import {
  type Pedido,
  type PedidoStatus,
  type PedidoStatusUpdateInput,
  getPedidos,
  updatePedidoStatus,
} from '../../services/pedidos'
import { AdminToast, useAdminToast } from '../../components/admin/AdminToast'
import { EASE } from '../../lib/motion'


type StatusFilter = PedidoStatus | 'Todos'

const ALL_FILTERS: StatusFilter[] = [
  'Todos', 'Pendente', 'Confirmado', 'EmPreparo', 'AEntregar', 'Entregue', 'Cancelado',
]

const STATUS_LABEL: Record<PedidoStatus, string> = {
  Pendente: 'Pendente',
  Confirmado: 'Confirmado',
  EmPreparo: 'Em Preparo',
  AEntregar: 'A Entregar',
  Entregue: 'Entregue',
  Cancelado: 'Cancelado',
}

const STATUS_COLOR: Record<PedidoStatus, string> = {
  Pendente:   'bg-yellow-500/15 text-yellow-300',
  Confirmado: 'bg-blue-500/15 text-blue-300',
  EmPreparo:  'bg-orange-500/15 text-orange-300',
  AEntregar:  'bg-purple-500/15 text-purple-300',
  Entregue:   'bg-emerald-500/15 text-emerald-300',
  Cancelado:  'bg-red-500/15 text-red-300',
}

const STATUS_DOT: Record<PedidoStatus, string> = {
  Pendente:   'bg-yellow-400',
  Confirmado: 'bg-blue-400',
  EmPreparo:  'bg-orange-400',
  AEntregar:  'bg-purple-400',
  Entregue:   'bg-emerald-400',
  Cancelado:  'bg-red-400',
}

const NEXT_STATUS: Record<PedidoStatus, PedidoStatus[]> = {
  Pendente:   ['Confirmado', 'Cancelado'],
  Confirmado: ['EmPreparo', 'Cancelado'],
  EmPreparo:  ['AEntregar', 'Cancelado'],
  AEntregar:  ['Entregue'],
  Entregue:   [],
  Cancelado:  [],
}

function StatusBadge({ status }: { status: PedidoStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full type-overline text-[9px] tracking-widest whitespace-nowrap ${STATUS_COLOR[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  )
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR')
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-white/4 border border-gold-primary/10 rounded-2xl px-4 py-3">
      <p className="type-overline text-[9px] text-cream/35 tracking-widest uppercase mb-1">{label}</p>
      <p className={`font-display font-bold text-xl leading-tight ${accent ?? 'text-cream'}`}>{value}</p>
    </div>
  )
}

const PAGE_SIZE = 20

export default function OrdersTab() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos')

  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const lastCountRef = useRef(0)
  const [hasNew, setHasNew] = useState(false)

  const { toast, showToast, clearToast } = useAdminToast()

  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [statusUpdateError, setStatusUpdateError] = useState('')
  const [novoStatus, setNovoStatus] = useState<PedidoStatus | ''>('')
  const [observacao, setObservacao] = useState('')

  const stateRef = useRef({ statusFilter: 'Todos' as StatusFilter, page: 1 })
  stateRef.current = { statusFilter, page }

  const fetchPedidos = useCallback(async (background = false, overrides: { status?: StatusFilter; pg?: number } = {}) => {
    const sf = overrides.status ?? stateRef.current.statusFilter
    const pg = overrides.pg ?? stateRef.current.page
    if (!background) {
      setLoading(true)
      setError('')
    }
    const res = await getPedidos(
      sf !== 'Todos' ? sf as PedidoStatus : undefined,
      pg,
      PAGE_SIZE,
    )
    if (res.success && res.data) {
      const newCount = res.data.totalCount
      if (background && newCount > lastCountRef.current) {
        setHasNew(true)
      }
      lastCountRef.current = newCount
      setPedidos(res.data.items ?? [])
      setTotalCount(newCount)
      setTotalPages(res.data.totalPages)
    } else if (!background) {
      setError(res.message || 'Erro ao carregar pedidos.')
    }
    if (!background) setLoading(false)
  }, [])

  // Initial load
  useEffect(() => { fetchPedidos() }, [fetchPedidos])

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => fetchPedidos(true), 60_000)
    return () => clearInterval(interval)
  }, [fetchPedidos])

  // ESC for detail modal
  useEffect(() => {
    if (!selectedPedido) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDetail() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedPedido]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusFilterChange = (f: StatusFilter) => {
    setStatusFilter(f)
    setPage(1)
    setHasNew(false)
    fetchPedidos(false, { status: f, pg: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchPedidos(false, { pg: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRefresh = () => {
    setHasNew(false)
    fetchPedidos()
  }

  const openDetail = (p: Pedido) => {
    setSelectedPedido(p)
    setNovoStatus('')
    setObservacao('')
    setStatusUpdateError('')
  }

  const closeDetail = () => {
    setSelectedPedido(null)
    setNovoStatus('')
    setObservacao('')
    setStatusUpdateError('')
  }

  const handleStatusUpdate = async () => {
    if (!selectedPedido || !novoStatus) return
    setStatusUpdateLoading(true)
    setStatusUpdateError('')
    const payload: PedidoStatusUpdateInput = {
      status: novoStatus,
      observacao: observacao.trim() || undefined,
    }
    const res = await updatePedidoStatus(selectedPedido.id, payload)
    setStatusUpdateLoading(false)
    if (res.success && res.data) {
      setSelectedPedido(res.data)
      setNovoStatus('')
      setObservacao('')
      showToast('success', `Status atualizado para ${STATUS_LABEL[novoStatus]}.`)
      fetchPedidos()
    } else {
      const msg = res.message || 'Erro ao atualizar status.'
      setStatusUpdateError(msg)
      showToast('error', msg)
    }
  }

  const proximosStatus = selectedPedido ? NEXT_STATUS[selectedPedido.status] : []
  const isTerminal = proximosStatus.length === 0

  // O5 — Stats from current page
  const hoje = new Date().toLocaleDateString('pt-BR')
  const pedidosHoje = pedidos.filter((p) => new Date(p.criadoEm).toLocaleDateString('pt-BR') === hoje)
  const pedidosNaoCancelados = pedidos.filter((p) => p.status !== 'Cancelado')
  const faturamentoTotal = pedidosNaoCancelados.reduce((acc, p) => acc + p.total, 0)
  const pendentesCount = pedidos.filter((p) => p.status === 'Pendente').length
  const ticketMedio = pedidosNaoCancelados.length > 0 ? faturamentoTotal / pedidosNaoCancelados.length : 0

  return (
    <div className="space-y-5">

      {/* ── O5: Stats block ───────────────────────────────────────── */}
      {!loading && pedidos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Hoje" value={String(pedidosHoje.length)} accent="text-emerald-400" />
          <StatCard label="Pendentes" value={String(pendentesCount)} accent="text-yellow-300" />
          <StatCard label="Faturamento" value={formatCurrency(faturamentoTotal)} accent="text-gold-light" />
          <StatCard label="Ticket médio" value={formatCurrency(ticketMedio)} />
        </div>
      )}

      {/* ── Status filter pills ────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ALL_FILTERS.map((f) => {
          const isActive = statusFilter === f
          return (
            <button
              key={f}
              onClick={() => handleStatusFilterChange(f)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full type-overline text-[9px] tracking-widest whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-gradient-gold text-dark-warm font-bold shadow-gold'
                  : 'border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80'
              }`}
            >
              {f === 'Todos' ? 'Todos' : STATUS_LABEL[f as PedidoStatus]}
              {isActive && totalCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-dark-warm/25 text-dark-warm">
                  {totalCount}
                </span>
              )}
            </button>
          )
        })}

        <div className="ml-auto relative shrink-0">
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Atualizar"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/40 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200 disabled:opacity-40"
          >
            <ArrowsClockwiseIcon size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          {hasNew && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse pointer-events-none" />
          )}
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"
          >
            <WarningCircleIcon size={16} weight="fill" className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading skeleton ──────────────────────────────────────── */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!loading && !error && pedidos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center">
            <ClipboardTextIcon size={28} weight="fill" className="text-gold-primary/50" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-cream mb-1">Nenhum pedido</h3>
            <p className="type-body text-cream/40 text-sm">
              {statusFilter !== 'Todos' ? `Nenhum pedido com status "${STATUS_LABEL[statusFilter as PedidoStatus]}".` : 'Os pedidos dos clientes aparecerão aqui.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Mobile: Card list ─────────────────────────────────────── */}
      {!loading && !error && pedidos.length > 0 && (
        <div className="md:hidden space-y-2">
          {pedidos.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.22, ease: EASE }}
              onClick={() => openDetail(p)}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl border border-gold-primary/12 bg-white/3 hover:bg-white/5 active:bg-white/7 cursor-pointer transition-colors duration-200"
            >
              <div className="shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[p.status]} mb-1`} />
                <p className="text-cream/30 text-xs font-body tabular-nums">#{p.id}</p>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-cream/45 text-xs font-body mt-0.5 truncate">
                  {p.usuarioNome || <span className="italic">Convidado</span>}
                </p>
                <p className="text-cream/30 text-xs font-body">
                  {formatDate(p.criadoEm)} · {p.itens.length} item{p.itens.length !== 1 ? 'ns' : ''}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-gold-light font-bold tabular-nums">{formatCurrency(p.total)}</p>
                <CaretRightIcon size={14} className="text-cream/25 ml-auto mt-1" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Desktop: Table ────────────────────────────────────────── */}
      {!loading && !error && pedidos.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-gold-primary/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-primary/15 bg-white/2">
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">#</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Status</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Cliente</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Total</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Data</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Itens</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Forma Pgto</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {pedidos.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.22, ease: EASE }}
                    onClick={() => openDetail(p)}
                    className="border-b border-gold-primary/8 last:border-0 hover:bg-white/3 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-cream/40 font-body tabular-nums text-xs">#{p.id}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3.5 text-cream/70 font-body text-xs">
                      {p.usuarioNome || <span className="text-cream/25 italic">Convidado</span>}
                    </td>
                    <td className="px-5 py-3.5 text-cream/90 font-body tabular-nums font-medium">
                      {formatCurrency(p.total)}
                    </td>
                    <td className="px-5 py-3.5 text-cream/50 font-body">
                      {formatDate(p.criadoEm)}
                    </td>
                    <td className="px-5 py-3.5 text-cream/50 font-body">
                      {p.itens.length} item{p.itens.length !== 1 ? 'ns' : ''}
                    </td>
                    <td className="px-5 py-3.5 text-cream/40 font-body text-xs">
                      {p.formaPagamento || <span className="text-cream/20">—</span>}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────── */}
      {!loading && pedidos.length > 0 && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="type-overline text-[9px] text-cream/25 tracking-widest">
            {totalCount} pedido{totalCount !== 1 ? 's' : ''} · pág. {page} de {totalPages}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gold-primary/15 text-cream/40 hover:text-gold-light hover:border-gold-primary/40 transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {(() => {
                const pages: (number | '…')[] = []
                const delta = 1
                const left = page - delta
                const right = page + delta
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                    pages.push(i)
                  } else if (pages[pages.length - 1] !== '…') {
                    pages.push('…')
                  }
                }
                return pages.map((p, idx) =>
                  p === '…' ? (
                    <span key={`e-${idx}`} className="w-8 h-8 flex items-center justify-center text-cream/25 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p as number)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-body transition-all duration-150 ${
                        page === p
                          ? 'bg-gold-primary/15 text-gold-light border border-gold-primary/35 font-bold'
                          : 'border border-gold-primary/10 text-cream/40 hover:border-gold-primary/30 hover:text-cream/70'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )
              })()}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gold-primary/15 text-cream/40 hover:text-gold-light hover:border-gold-primary/40 transition-all duration-150 disabled:opacity-25 disabled:pointer-events-none"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2L8 6l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Order detail modal ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPedido && (
          <>
            <motion.div
              key="order-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[70] bg-black/75"
              onClick={closeDetail}
            />
            <motion.div
              key="order-modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="fixed inset-0 z-[71] flex items-end md:items-center justify-center px-4 py-4 md:py-8 pointer-events-none"
            >
              <div
                className="relative w-full max-w-2xl bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold pointer-events-auto max-h-[90vh] md:max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0 border-b border-gold-primary/10">
                  <div>
                    <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">
                      Detalhes do pedido
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-display font-bold text-2xl text-cream">
                        Pedido #{selectedPedido.id}
                      </h2>
                      <StatusBadge status={selectedPedido.status} />
                    </div>
                    <p className="text-cream/40 text-xs font-body mt-1">
                      Criado em {formatDateTime(selectedPedido.criadoEm)}
                    </p>
                  </div>
                  <button
                    onClick={closeDetail}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300 shrink-0"
                  >
                    <XIcon size={14} />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

                  {/* O2 — Client info */}
                  {(selectedPedido.usuarioNome || selectedPedido.usuarioEmail) && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-gold-primary/10">
                      <UserCircleIcon size={18} className="text-gold-primary/50 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-cream/80 text-sm font-body truncate">
                          {selectedPedido.usuarioNome || 'Convidado'}
                        </p>
                        {selectedPedido.usuarioEmail && (
                          <p className="text-cream/40 text-xs font-body truncate">{selectedPedido.usuarioEmail}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest mb-3">
                      Itens do pedido
                    </p>
                    <div className="rounded-xl border border-gold-primary/10 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gold-primary/10 bg-white/2">
                            <th className="text-left px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Produto</th>
                            <th className="text-right px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Qtd</th>
                            <th className="text-right px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Unit.</th>
                            <th className="text-right px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Desc.</th>
                            <th className="text-right px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPedido.itens.map((item) => (
                            <tr key={item.id} className="border-b border-gold-primary/8 last:border-0">
                              <td className="px-4 py-2.5 text-cream/80 font-body">{item.produtoNome}</td>
                              <td className="px-4 py-2.5 text-cream/50 font-body tabular-nums text-right">{item.quantidade}</td>
                              <td className="px-4 py-2.5 text-cream/50 font-body tabular-nums text-right">{formatCurrency(item.precoUnitario)}</td>
                              <td className="px-4 py-2.5 text-red-300/70 font-body tabular-nums text-right">
                                {item.descontoAplicado > 0 ? `−${formatCurrency(item.descontoAplicado)}` : '—'}
                              </td>
                              <td className="px-4 py-2.5 text-cream/90 font-body tabular-nums text-right font-medium">{formatCurrency(item.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-3 space-y-1.5 px-1">
                      <div className="flex justify-between text-sm text-cream/50 font-body">
                        <span>Subtotal</span>
                        <span className="tabular-nums">{formatCurrency(selectedPedido.subtotal)}</span>
                      </div>
                      {selectedPedido.descontoTotal > 0 && (
                        <div className="flex justify-between text-sm text-red-300/70 font-body">
                          <span>Desconto</span>
                          <span className="tabular-nums">−{formatCurrency(selectedPedido.descontoTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-cream/50 font-body">
                        <span>Frete</span>
                        <span className="tabular-nums">
                          {selectedPedido.valorFrete === 0 ? 'Grátis' : formatCurrency(selectedPedido.valorFrete)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base text-gold-light font-body font-bold pt-2 border-t border-gold-primary/15">
                        <span>Total</span>
                        <span className="tabular-nums">{formatCurrency(selectedPedido.total)}</span>
                      </div>
                    </div>

                    {selectedPedido.observacoes && (
                      <p className="mt-3 text-cream/40 text-xs font-body italic">
                        Obs: {selectedPedido.observacoes}
                      </p>
                    )}
                  </div>

                  {/* Status history */}
                  {selectedPedido.statusHistorico.length > 0 && (
                    <div>
                      <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest mb-3">
                        Histórico de status
                      </p>
                      <div className="space-y-3">
                        {selectedPedido.statusHistorico.map((h, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-gold-primary/50 shrink-0 mt-1" />
                              {i < selectedPedido.statusHistorico.length - 1 && (
                                <div className="w-px flex-1 bg-gold-primary/10 mt-1" />
                              )}
                            </div>
                            <div className="pb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                {h.statusAnterior && (
                                  <>
                                    <StatusBadge status={h.statusAnterior} />
                                    <ArrowRightIcon size={10} className="text-cream/30" />
                                  </>
                                )}
                                <StatusBadge status={h.statusNovo} />
                              </div>
                              <p className="text-cream/30 text-xs font-body mt-1">
                                {formatDateTime(h.alteradoEm)}
                              </p>
                              {h.observacao && (
                                <p className="text-cream/40 text-xs font-body italic mt-0.5">
                                  {h.observacao}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status update form */}
                  {!isTerminal && (
                    <div className="border-t border-gold-primary/10 pt-5">
                      <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest mb-3">
                        Atualizar status
                      </p>

                      <div className="flex gap-2 flex-wrap mb-4">
                        {proximosStatus.map((s) => (
                          <button
                            key={s}
                            onClick={() => setNovoStatus(novoStatus === s ? '' : s)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full type-overline text-[9px] tracking-widest transition-all duration-200 ${
                              novoStatus === s
                                ? `${STATUS_COLOR[s]} border border-current/30 font-bold`
                                : 'border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
                            {STATUS_LABEL[s]}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <textarea
                          placeholder="Observação (opcional)..."
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          rows={2}
                          className="w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl px-4 py-2.5 text-cream placeholder-cream/20 text-sm outline-none transition-[border-color] duration-300 resize-none"
                        />

                        <AnimatePresence>
                          {statusUpdateError && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-body">
                                <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
                                {statusUpdateError}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.button
                          whileHover={!statusUpdateLoading ? { y: -1 } : {}}
                          whileTap={!statusUpdateLoading ? { scale: 0.98 } : {}}
                          onClick={handleStatusUpdate}
                          disabled={!novoStatus || statusUpdateLoading}
                          className="w-full py-2.5 px-6 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {statusUpdateLoading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-dark-warm/30 border-t-dark-warm rounded-full animate-spin" />
                              Atualizando...
                            </>
                          ) : novoStatus ? (
                            `Confirmar → ${STATUS_LABEL[novoStatus]}`
                          ) : (
                            'Selecione um novo status acima'
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {isTerminal && (
                    <div className="border-t border-gold-primary/10 pt-4">
                      <p className="text-cream/25 text-xs font-body italic text-center">
                        Este pedido está em um status final e não pode ser alterado.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AdminToast toast={toast} onDismiss={clearToast} />
    </div>
  )
}

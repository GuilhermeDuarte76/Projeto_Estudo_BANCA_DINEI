import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, WarningCircleIcon, ArrowRightIcon, ClipboardTextIcon } from '@phosphor-icons/react'
import {
  type Pedido,
  type PedidoStatus,
  type PedidoStatusUpdateInput,
  getPedidos,
  updatePedidoStatus,
} from '../../services/pedidos'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

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
  Pendente: 'bg-yellow-500/15 text-yellow-300',
  Confirmado: 'bg-blue-500/15 text-blue-300',
  EmPreparo: 'bg-orange-500/15 text-orange-300',
  AEntregar: 'bg-purple-500/15 text-purple-300',
  Entregue: 'bg-green-500/15 text-green-300',
  Cancelado: 'bg-red-500/15 text-red-300',
}

const NEXT_STATUS: Record<PedidoStatus, PedidoStatus[]> = {
  Pendente: ['Confirmado', 'Cancelado'],
  Confirmado: ['EmPreparo', 'Cancelado'],
  EmPreparo: ['AEntregar', 'Cancelado'],
  AEntregar: ['Entregue'],
  Entregue: [],
  Cancelado: [],
}

function StatusBadge({ status }: { status: PedidoStatus }) {
  return (
    <span className={`px-2.5 py-1 rounded-full type-overline text-[9px] tracking-widest whitespace-nowrap ${STATUS_COLOR[status]}`}>
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

export default function OrdersTab() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos')

  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [statusUpdateError, setStatusUpdateError] = useState('')
  const [novoStatus, setNovoStatus] = useState<PedidoStatus | ''>('')
  const [observacao, setObservacao] = useState('')

  const fetchPedidos = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await getPedidos()
    if (res.success) {
      setPedidos(Array.isArray(res.data) ? res.data : [])
    } else {
      setError(res.message || 'Erro ao carregar pedidos.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPedidos() }, [fetchPedidos])

  const filtered = pedidos.filter(
    (p) => statusFilter === 'Todos' || p.status === statusFilter,
  )

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
      fetchPedidos()
    } else {
      setStatusUpdateError(res.message || 'Erro ao atualizar status.')
    }
  }

  const proximosStatus = selectedPedido ? NEXT_STATUS[selectedPedido.status] : []
  const isTerminal = proximosStatus.length === 0

  return (
    <div className="space-y-6">
      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ALL_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-full type-overline text-[10px] tracking-widest whitespace-nowrap transition-all duration-300 shrink-0 ${
              statusFilter === f
                ? 'bg-gradient-gold text-dark-warm font-bold shadow-gold'
                : 'border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80'
            }`}
          >
            {f === 'Todos' ? 'Todos' : STATUS_LABEL[f as PedidoStatus]}
          </button>
        ))}
      </div>

      {/* Error */}
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

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && pedidos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center">
            <ClipboardTextIcon size={28} weight="fill" className="text-gold-primary/50" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-cream mb-1">Nenhum pedido encontrado</h3>
            <p className="type-body text-cream/40 text-sm">Os pedidos dos clientes aparecerão aqui.</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && pedidos.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gold-primary/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-primary/15">
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">#</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Status</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Total</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Data</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Itens</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-cream/30 text-sm font-body">
                      Nenhum pedido com o status selecionado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.25, ease: EASE }}
                      onClick={() => openDetail(p)}
                      className="border-b border-gold-primary/8 last:border-0 hover:bg-white/3 transition-colors duration-200 cursor-pointer"
                    >
                      <td className="px-5 py-3.5 text-cream/50 font-body tabular-nums">#{p.id}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 text-cream/90 font-body tabular-nums">
                        {formatCurrency(p.total)}
                      </td>
                      <td className="px-5 py-3.5 text-cream/50 font-body">
                        {formatDate(p.criadoEm)}
                      </td>
                      <td className="px-5 py-3.5 text-cream/50 font-body">
                        {p.itens.length} item{p.itens.length !== 1 ? 'ns' : ''}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {!loading && pedidos.length > 0 && (
        <p className="type-overline text-[9px] text-cream/25 tracking-widest text-right">
          {filtered.length} de {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Order detail modal */}
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
              className="fixed inset-0 z-[71] flex items-center justify-center px-4 py-8 pointer-events-none"
            >
              <div
                className="relative w-full max-w-2xl bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold pointer-events-auto max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex items-start justify-between px-7 pt-7 pb-5 shrink-0 border-b border-gold-primary/10">
                  <div>
                    <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">
                      Detalhes do pedido
                    </p>
                    <div className="flex items-center gap-3">
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
                <div className="overflow-y-auto flex-1 px-7 py-5 space-y-6">
                  {/* Items */}
                  <div>
                    <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest mb-3">
                      Itens do pedido
                    </p>
                    <div className="rounded-xl border border-gold-primary/10 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gold-primary/10">
                            <th className="text-left px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Produto</th>
                            <th className="text-right px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Qtd</th>
                            <th className="text-right px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Unitário</th>
                            <th className="text-right px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Desconto</th>
                            <th className="text-right px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPedido.itens.map((item) => (
                            <tr key={item.id} className="border-b border-gold-primary/8 last:border-0">
                              <td className="px-4 py-2.5 text-cream/80 font-body">{item.nomeProduto}</td>
                              <td className="px-4 py-2.5 text-cream/50 font-body tabular-nums text-right">{item.quantidade}</td>
                              <td className="px-4 py-2.5 text-cream/50 font-body tabular-nums text-right">{formatCurrency(item.precoUnitario)}</td>
                              <td className="px-4 py-2.5 text-red-300/70 font-body tabular-nums text-right">
                                {item.descontoAplicado > 0 ? `- ${formatCurrency(item.descontoAplicado)}` : '—'}
                              </td>
                              <td className="px-4 py-2.5 text-cream/90 font-body tabular-nums text-right">{formatCurrency(item.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-sm text-cream/50 font-body">
                        <span>Subtotal</span>
                        <span className="tabular-nums">{formatCurrency(selectedPedido.subtotal)}</span>
                      </div>
                      {selectedPedido.descontoTotal > 0 && (
                        <div className="flex justify-between text-sm text-red-300/70 font-body">
                          <span>Desconto</span>
                          <span className="tabular-nums">− {formatCurrency(selectedPedido.descontoTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-cream/50 font-body">
                        <span>Frete</span>
                        <span className="tabular-nums">{selectedPedido.valorFrete === 0 ? 'Grátis' : formatCurrency(selectedPedido.valorFrete)}</span>
                      </div>
                      <div className="flex justify-between text-base text-gold-light font-body font-bold pt-1 border-t border-gold-primary/15">
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
                  {selectedPedido.historicoStatus.length > 0 && (
                    <div>
                      <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest mb-3">
                        Histórico de status
                      </p>
                      <div className="space-y-3">
                        {selectedPedido.historicoStatus.map((h, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-gold-primary/50 shrink-0 mt-1" />
                              {i < selectedPedido.historicoStatus.length - 1 && (
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
                      <div className="space-y-3">
                        <select
                          value={novoStatus}
                          onChange={(e) => setNovoStatus(e.target.value as PedidoStatus | '')}
                          className="w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl px-4 py-2.5 text-cream text-sm outline-none transition-[border-color] duration-300 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-dark-warm text-cream/50">Selecionar novo status...</option>
                          {proximosStatus.map((s) => (
                            <option key={s} value={s} className="bg-dark-warm text-cream">
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>

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
                          ) : (
                            'Confirmar alteração'
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {isTerminal && (
                    <div className="border-t border-gold-primary/10 pt-5">
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
    </div>
  )
}

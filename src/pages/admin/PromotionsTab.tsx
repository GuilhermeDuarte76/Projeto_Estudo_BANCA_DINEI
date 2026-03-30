import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon, PencilSimpleIcon, TrashIcon, MagnifyingGlassIcon,
  WarningCircleIcon, TagIcon, XIcon, PackageIcon,
} from '@phosphor-icons/react'
import {
  type Promocao,
  type PromocaoCreateInput,
  type ProdutoPromocao,
  getAdminPromocoes,
  createPromocao,
  updatePromocao,
  deletePromocao,
  addProdutosToPromocao,
  removeProdutoFromPromocao,
  getPromocaoProdutos,
} from '../../services/promocoes'
import { getProducts, type Product } from '../../services/admin'
import PromotionForm from '../../components/admin/PromotionForm'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

function getStatus(p: Promocao): { label: string; cls: string } {
  const now = new Date()
  const start = new Date(p.dataInicio)
  const end = new Date(p.dataFim)
  if (p.isAtivo === false) return { label: 'Inativa', cls: 'bg-gray-500/15 text-gray-400' }
  if (now < start) return { label: 'Futura', cls: 'bg-blue-500/15 text-blue-300' }
  if (now > end) return { label: 'Vencida', cls: 'bg-red-500/15 text-red-300' }
  return { label: 'Ativa', cls: 'bg-green-500/15 text-green-300' }
}

function formatDesconto(p: Promocao) {
  if (p.tipoDesconto === 'Percentual') return `${p.valorDesconto}%`
  return p.valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function PromotionsTab() {
  const [promocoes, setPromocoes] = useState<Promocao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Promocao | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Promocao | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Products management modal
  const [produtosPromoOpen, setProdutosPromoOpen] = useState(false)
  const [produtosPromoTarget, setProdutosPromoTarget] = useState<Promocao | null>(null)
  const [produtosVinculados, setProdutosVinculados] = useState<ProdutoPromocao[]>([])
  const [todosOsProdutos, setTodosOsProdutos] = useState<Product[]>([])
  const [produtosLoading, setProdutosLoading] = useState(false)
  const [produtoSearch, setProdutoSearch] = useState('')
  const [addingId, setAddingId] = useState<number | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const fetchPromocoes = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await getAdminPromocoes()
    if (res.success) {
      setPromocoes(res.data ?? [])
    } else {
      setError(res.message || 'Erro ao carregar promoções.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPromocoes() }, [fetchPromocoes])

  const handleSave = async (data: PromocaoCreateInput) => {
    setFormLoading(true)
    const res = editTarget
      ? await updatePromocao(editTarget.id, data)
      : await createPromocao(data)
    setFormLoading(false)
    if (res.success) {
      setFormOpen(false)
      setEditTarget(null)
      fetchPromocoes()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    await deletePromocao(deleteTarget.id)
    setDeleteLoading(false)
    setDeleteTarget(null)
    fetchPromocoes()
  }

  const openCreate = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (p: Promocao) => { setEditTarget(p); setFormOpen(true) }

  const openProdutosModal = async (p: Promocao) => {
    setProdutosPromoTarget(p)
    setProdutosPromoOpen(true)
    setProdutosLoading(true)
    setProdutoSearch('')
    const [vinculadosRes, todosRes] = await Promise.all([
      getPromocaoProdutos(p.id),
      getProducts(1, 200),
    ])
    if (vinculadosRes.success) setProdutosVinculados(vinculadosRes.data ?? [])
    if (todosRes.success) setTodosOsProdutos(todosRes.data?.items ?? [])
    setProdutosLoading(false)
  }

  const handleAddProduto = async (produto: Product) => {
    if (!produtosPromoTarget) return
    setAddingId(produto.id)
    await addProdutosToPromocao(produtosPromoTarget.id, [produto.id])
    const res = await getPromocaoProdutos(produtosPromoTarget.id)
    if (res.success) setProdutosVinculados(res.data ?? [])
    setAddingId(null)
  }

  const handleRemoveProduto = async (produtoId: number) => {
    if (!produtosPromoTarget) return
    setRemovingId(produtoId)
    await removeProdutoFromPromocao(produtosPromoTarget.id, produtoId)
    setProdutosVinculados((prev) => prev.filter((p) => p.id !== produtoId))
    setRemovingId(null)
  }

  const vinculadosIds = new Set(produtosVinculados.map((p) => p.id))

  const produtosFiltrados = todosOsProdutos.filter((p) =>
    !vinculadosIds.has(p.id) &&
    (p.nome.toLowerCase().includes(produtoSearch.toLowerCase()) ||
      p.categoria.toLowerCase().includes(produtoSearch.toLowerCase())),
  )

  const filtered = promocoes.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-primary/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl pl-9 pr-4 py-2.5 text-cream placeholder-cream/25 text-sm outline-none transition-[border-color] duration-300"
          />
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest hover:shadow-gold transition-all duration-300 shrink-0"
        >
          <PlusIcon size={14} weight="bold" />
          Nova promoção
        </motion.button>
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-gold-primary/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-primary/15">
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Nome</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Desconto</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Período</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-cream/30 text-sm font-body">
                      {search ? 'Nenhuma promoção encontrada.' : 'Nenhuma promoção cadastrada ainda.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => {
                    const status = getStatus(p)
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.25, ease: EASE }}
                        className="border-b border-gold-primary/8 last:border-0 hover:bg-white/3 transition-colors duration-200 group"
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-cream/90 font-body truncate max-w-[180px]">{p.nome}</p>
                          {p.descricao && (
                            <p className="text-cream/30 text-xs truncate max-w-[180px] mt-0.5">{p.descricao}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-gold-primary/10 text-gold-light type-overline text-[9px] tracking-widest whitespace-nowrap">
                            {p.tipoDesconto === 'Percentual' ? '% ' : 'R$ '}
                            {formatDesconto(p)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-cream/60 font-body text-xs whitespace-nowrap">
                            {formatDate(p.dataInicio)}
                          </p>
                          <p className="text-cream/30 font-body text-xs whitespace-nowrap">
                            até {formatDate(p.dataFim)}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full type-overline text-[9px] tracking-widest ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => openProdutosModal(p)}
                              title="Gerenciar produtos"
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-200"
                            >
                              <TagIcon size={13} />
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              title="Editar"
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-200"
                            >
                              <PencilSimpleIcon size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              title="Desativar"
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-red-500/20 text-cream/40 hover:text-red-400 hover:border-red-500/50 transition-all duration-200"
                            >
                              <TrashIcon size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {!loading && promocoes.length > 0 && (
        <p className="type-overline text-[9px] text-cream/25 tracking-widest text-right">
          {filtered.length} de {promocoes.length} promoção{promocoes.length !== 1 ? 'ões' : ''}
        </p>
      )}

      <PromotionForm
        open={formOpen}
        initial={editTarget}
        loading={formLoading}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Desativar promoção"
        description={`Tem certeza que deseja desativar "${deleteTarget?.nome}"? Os produtos vinculados perderão o desconto.`}
        confirmLabel="Desativar promoção"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Products management modal */}
      <AnimatePresence>
        {produtosPromoOpen && produtosPromoTarget && (
          <>
            <motion.div
              key="promo-produtos-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[70] bg-black/75"
              onClick={() => setProdutosPromoOpen(false)}
            />
            <motion.div
              key="promo-produtos-modal"
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
                {/* Header */}
                <div className="flex items-start justify-between px-7 pt-7 pb-5 shrink-0 border-b border-gold-primary/10">
                  <div>
                    <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">Produtos da promoção</p>
                    <h2 className="font-display font-bold text-xl text-cream truncate max-w-[380px]">
                      {produtosPromoTarget.nome}
                    </h2>
                    <p className="text-cream/40 text-xs font-body mt-0.5">
                      {formatDesconto(produtosPromoTarget)} de desconto · {produtosVinculados.length} produto{produtosVinculados.length !== 1 ? 's' : ''} vinculado{produtosVinculados.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setProdutosPromoOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300 shrink-0"
                  >
                    <XIcon size={14} />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 px-7 py-5 space-y-6">
                  {produtosLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Vinculados */}
                      <div>
                        <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest mb-3">
                          Produtos vinculados ({produtosVinculados.length})
                        </p>
                        {produtosVinculados.length === 0 ? (
                          <p className="text-cream/25 text-xs font-body italic">
                            Nenhum produto vinculado a esta promoção.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {produtosVinculados.map((p) => (
                              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gold-primary/5 border border-gold-primary/15">
                                {p.imagemUrl ? (
                                  <img src={p.imagemUrl} alt={p.nome} className="w-8 h-8 rounded-lg object-cover border border-gold-primary/15 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-gold-primary/10 shrink-0 flex items-center justify-center">
                                    <PackageIcon size={12} className="text-cream/20" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-cream/80 text-sm font-body truncate">{p.nome}</p>
                                  <p className="text-cream/30 text-xs font-body">{p.categoria} · {formatCurrency(p.preco)}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveProduto(p.id)}
                                  disabled={removingId === p.id}
                                  title="Remover da promoção"
                                  className="w-7 h-7 flex items-center justify-center rounded-full border border-red-500/20 text-cream/30 hover:text-red-400 hover:border-red-500/40 transition-all duration-200 disabled:opacity-40 shrink-0"
                                >
                                  {removingId === p.id
                                    ? <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                                    : <XIcon size={11} />
                                  }
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Adicionar produtos */}
                      <div className="border-t border-gold-primary/10 pt-5">
                        <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest mb-3">
                          Adicionar produtos
                        </p>
                        <div className="relative mb-3">
                          <MagnifyingGlassIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-primary/40 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Buscar produto..."
                            value={produtoSearch}
                            onChange={(e) => setProdutoSearch(e.target.value)}
                            className="w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl pl-9 pr-4 py-2.5 text-cream placeholder-cream/25 text-sm outline-none transition-[border-color] duration-300"
                          />
                        </div>
                        {produtosFiltrados.length === 0 ? (
                          <p className="text-cream/25 text-xs font-body italic">
                            {produtoSearch ? 'Nenhum produto encontrado.' : 'Todos os produtos já estão vinculados.'}
                          </p>
                        ) : (
                          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                            {produtosFiltrados.map((p) => (
                              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/3 border border-white/5 hover:border-gold-primary/20 transition-colors duration-200">
                                {p.imagemUrl ? (
                                  <img src={p.imagemUrl} alt={p.nome} className="w-8 h-8 rounded-lg object-cover border border-gold-primary/15 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-gold-primary/10 shrink-0 flex items-center justify-center">
                                    <PackageIcon size={12} className="text-cream/20" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-cream/70 text-sm font-body truncate">{p.nome}</p>
                                  <p className="text-cream/30 text-xs font-body">{p.categoria} · {formatCurrency(p.preco)}</p>
                                </div>
                                <button
                                  onClick={() => handleAddProduto(p)}
                                  disabled={addingId === p.id}
                                  title="Adicionar à promoção"
                                  className="w-7 h-7 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/40 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-200 disabled:opacity-40 shrink-0"
                                >
                                  {addingId === p.id
                                    ? <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                                    : <PlusIcon size={11} weight="bold" />
                                  }
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
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

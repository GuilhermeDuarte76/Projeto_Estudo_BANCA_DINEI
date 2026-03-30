import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon, PencilSimpleIcon, TrashIcon, MagnifyingGlassIcon,
  WarningCircleIcon, EyeIcon, EyeSlashIcon, StarIcon, ClockIcon, XIcon,
} from '@phosphor-icons/react'
import {
  type Product,
  type ProductCreateInput,
  type PriceHistoryEntry,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
  getProductPriceHistory,
} from '../../services/admin'
import ProductForm from '../../components/admin/ProductForm'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR')
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Price history modal
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null)
  const [history, setHistory] = useState<PriceHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await getProducts()
    if (res.success) {
      setProducts(res.data?.items ?? [])
    } else {
      setError(res.message || 'Erro ao carregar produtos.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSave = async (data: ProductCreateInput) => {
    setFormLoading(true)
    const res = editTarget
      ? await updateProduct(editTarget.id, data)
      : await createProduct(data)
    setFormLoading(false)
    if (res.success) {
      setFormOpen(false)
      setEditTarget(null)
      fetchProducts()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    await deleteProduct(deleteTarget.id)
    setDeleteLoading(false)
    setDeleteTarget(null)
    fetchProducts()
  }

  const handleToggleVisibility = async (p: Product) => {
    setTogglingId(p.id)
    await toggleProductVisibility(p.id, !p.isVisivel)
    setTogglingId(null)
    fetchProducts()
  }

  const openCreate = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (p: Product) => { setEditTarget(p); setFormOpen(true) }

  const openHistory = async (p: Product) => {
    setHistoryProduct(p)
    setHistoryLoading(true)
    setHistory([])
    const res = await getProductPriceHistory(p.id)
    if (res.success) setHistory(res.data?.items ?? [])
    setHistoryLoading(false)
  }

  const filtered = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-primary/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
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
          Novo produto
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
          {Array.from({ length: 5 }).map((_, i) => (
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
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Marca</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Categoria</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Preço</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Un.</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Visível</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-cream/30 text-sm font-body">
                      {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25, ease: EASE }}
                      className="border-b border-gold-primary/8 last:border-0 hover:bg-white/3 transition-colors duration-200 group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.imagemUrl ? (
                            <img
                              src={p.imagemUrl}
                              alt={p.nome}
                              className="w-9 h-9 rounded-lg object-cover border border-gold-primary/15 shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/5 border border-gold-primary/10 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="text-cream/90 font-body truncate max-w-[160px] block">{p.nome}</span>
                            {p.destaque && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gold-primary/15 text-gold-light type-overline text-[8px] tracking-widest mt-0.5">
                                <StarIcon size={8} weight="fill" />
                                Destaque
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-cream/50 font-body text-sm">
                        {p.marca || <span className="text-cream/20">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-gold-primary/10 text-gold-light type-overline text-[9px] tracking-widest">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-cream/70 font-body tabular-nums">
                        {formatCurrency(p.preco)}
                      </td>
                      <td className="px-5 py-3.5 text-cream/40 font-body text-xs">
                        {p.unidadeMedida || 'UN'}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.isVisivel
                          ? <EyeIcon size={14} className="text-gold-light" title="Visível" />
                          : <EyeSlashIcon size={14} className="text-cream/25" title="Oculto" />
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => openHistory(p)}
                            title="Histórico de preço"
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-200"
                          >
                            <ClockIcon size={13} />
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(p)}
                            disabled={togglingId === p.id}
                            title={p.isVisivel ? 'Ocultar produto' : 'Tornar visível'}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-200 disabled:opacity-40"
                          >
                            {togglingId === p.id
                              ? <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                              : p.isVisivel
                                ? <EyeSlashIcon size={13} />
                                : <EyeIcon size={13} />
                            }
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
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Count */}
      {!loading && products.length > 0 && (
        <p className="type-overline text-[9px] text-cream/25 tracking-widest text-right">
          {filtered.length} de {products.length} produto{products.length !== 1 ? 's' : ''}
        </p>
      )}

      <ProductForm
        open={formOpen}
        initial={editTarget}
        loading={formLoading}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Desativar produto"
        description={`Tem certeza que deseja desativar "${deleteTarget?.nome}"? O produto ficará oculto no catálogo, mas pode ser reativado posteriormente.`}
        confirmLabel="Desativar produto"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Price history modal */}
      <AnimatePresence>
        {historyProduct && (
          <>
            <motion.div
              key="hist-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[70] bg-black/75"
              onClick={() => setHistoryProduct(null)}
            />
            <motion.div
              key="hist-modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="fixed inset-0 z-[71] flex items-center justify-center px-4 py-8 pointer-events-none"
            >
              <div
                className="relative w-full max-w-lg bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold pointer-events-auto max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between px-7 pt-7 pb-5 shrink-0 border-b border-gold-primary/10">
                  <div>
                    <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">Histórico de preço</p>
                    <h2 className="font-display font-bold text-xl text-cream leading-tight truncate max-w-[320px]">
                      {historyProduct.nome}
                    </h2>
                    <p className="text-cream/40 text-xs font-body mt-0.5">
                      Preço atual: {formatCurrency(historyProduct.preco)}
                    </p>
                  </div>
                  <button
                    onClick={() => setHistoryProduct(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300 shrink-0"
                  >
                    <XIcon size={14} />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 px-7 py-5">
                  {historyLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <p className="text-cream/30 text-sm font-body text-center py-8">
                      Nenhuma alteração de preço registrada.
                    </p>
                  ) : (
                    <div className="rounded-xl border border-gold-primary/10 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gold-primary/10">
                            <th className="text-left px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Anterior</th>
                            <th className="text-left px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Novo</th>
                            <th className="text-left px-4 py-2.5 type-overline text-[9px] text-cream/30 tracking-widest font-normal">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((h) => (
                            <tr key={h.id} className="border-b border-gold-primary/8 last:border-0">
                              <td className="px-4 py-2.5 text-cream/40 font-body tabular-nums line-through">
                                {formatCurrency(h.precoAnterior)}
                              </td>
                              <td className="px-4 py-2.5 text-gold-light font-body tabular-nums font-bold">
                                {formatCurrency(h.precoNovo)}
                              </td>
                              <td className="px-4 py-2.5 text-cream/30 font-body text-xs">
                                {formatDateTime(h.alteradoEm)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

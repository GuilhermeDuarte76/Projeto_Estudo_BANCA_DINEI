import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, PencilSimpleIcon, TrashIcon, MagnifyingGlassIcon, WarningCircleIcon } from '@phosphor-icons/react'
import {
  type Product,
  type ProductCreateInput,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/admin'
import ProductForm from '../../components/admin/ProductForm'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

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

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await getProducts()
    if (res.success) {
      setProducts(res.data ?? [])
    } else {
      setError(res.message || 'Erro ao carregar produtos.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSave = async (data: ProductCreateInput) => {
    setFormLoading(true)
    const res = editTarget
      ? await updateProduct(editTarget.id, { ...data, isAtivo: editTarget.isAtivo })
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

  const openCreate = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (p: Product) => { setEditTarget(p); setFormOpen(true) }

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
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Categoria</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Preço</th>
                <th className="text-left px-5 py-3.5 type-overline text-[9px] text-gold-primary/50 tracking-widest font-normal">Estoque</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-cream/30 text-sm font-body">
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
                          <span className="text-cream/90 font-body truncate max-w-[160px]">{p.nome}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-gold-primary/10 text-gold-light type-overline text-[9px] tracking-widest">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-cream/70 font-body tabular-nums">
                        {p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-body tabular-nums text-sm ${p.estoque === 0 ? 'text-red-400' : p.estoque <= 5 ? 'text-yellow-400' : 'text-cream/70'}`}>
                          {p.estoque}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
    </div>
  )
}

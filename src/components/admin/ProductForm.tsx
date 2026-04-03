import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, WarningCircleIcon, UploadSimpleIcon, ImageIcon } from '@phosphor-icons/react'
import { type Product, type ProductCreateInput, CATEGORIES, UNIDADES, uploadImage } from '../../services/admin'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

const EMPTY: ProductCreateInput = {
  nome: '',
  descricao: '',
  preco: 0,
  categoria: CATEGORIES[0],
  marca: '',
  unidadeMedida: 'UN',
  codigoBarras: '',
  pesoKg: null,
  destaque: false,
  isVisivel: true,
  imagemUrl: '',
}

interface Props {
  open: boolean
  initial?: Product | null
  loading?: boolean
  serverError?: string
  onSave: (data: ProductCreateInput) => void
  onClose: () => void
}

export default function ProductForm({ open, initial, loading = false, serverError, onSave, onClose }: Props) {
  const [form, setForm] = useState<ProductCreateInput>(EMPTY)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    const result = await uploadImage(file)
    setUploading(false)
    if (result.success && result.data?.url) {
      set('imagemUrl', result.data.url)
    } else {
      setUploadError(result.message || 'Falha no upload da imagem.')
    }
    e.target.value = ''
  }

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              nome: initial.nome,
              descricao: initial.descricao,
              preco: initial.preco,
              categoria: initial.categoria,
              marca: initial.marca ?? '',
              unidadeMedida: initial.unidadeMedida || 'UN',
              codigoBarras: initial.codigoBarras ?? '',
              pesoKg: initial.pesoKg ?? null,
              destaque: initial.destaque,
              isVisivel: initial.isVisivel,
              imagemUrl: initial.imagemUrl,
            }
          : EMPTY,
      )
      setError('')
      setUploadError('')
    }
  }, [open, initial])

  const set = <K extends keyof ProductCreateInput>(key: K, value: ProductCreateInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return }
    if (!form.categoria) { setError('Categoria é obrigatória.'); return }
    if (form.preco <= 0.01) { setError('Preço deve ser maior que R$ 0,01.'); return }

    onSave(form)
  }

  const isEdit = !!initial

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="form-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black/75"
            onClick={onClose}
          />

          <motion.div
            key="form-modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-0 z-[71] flex items-center justify-center px-4 py-8 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold overflow-hidden pointer-events-auto max-h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-7 pb-5 shrink-0">
                <div>
                  <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">
                    {isEdit ? 'Editar produto' : 'Novo produto'}
                  </p>
                  <h2 className="font-display font-bold text-2xl text-cream leading-tight">
                    {isEdit ? initial!.nome : 'Adicionar produto'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300"
                >
                  <XIcon size={14} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-7 pb-7 overflow-y-auto flex-1 space-y-4">
                {/* Nome */}
                <Field label="Nome do produto">
                  <input
                    type="text"
                    placeholder="Ex: Queijo Brie"
                    value={form.nome}
                    onChange={(e) => set('nome', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                {/* Descrição */}
                <Field label="Descrição">
                  <textarea
                    placeholder="Descreva o produto..."
                    value={form.descricao}
                    onChange={(e) => set('descricao', e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                {/* Categoria e Preço */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Categoria">
                    <select
                      value={form.categoria}
                      onChange={(e) => set('categoria', e.target.value)}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-dark-warm text-cream">
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Preço (R$)">
                    <input
                      type="number"
                      placeholder="0,00"
                      min={0.01}
                      step={0.01}
                      value={form.preco || ''}
                      onChange={(e) => set('preco', parseFloat(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* Marca e Unidade */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Marca">
                    <input
                      type="text"
                      placeholder="Ex: Tio João"
                      value={form.marca ?? ''}
                      onChange={(e) => set('marca', e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Unidade de medida">
                    <select
                      value={form.unidadeMedida}
                      onChange={(e) => set('unidadeMedida', e.target.value)}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      {UNIDADES.map((u) => (
                        <option key={u} value={u} className="bg-dark-warm text-cream">
                          {u}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Código de barras e Peso */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Código de barras">
                    <input
                      type="text"
                      placeholder="Ex: 7891234560001"
                      value={form.codigoBarras ?? ''}
                      onChange={(e) => set('codigoBarras', e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Peso (kg)">
                    <input
                      type="number"
                      placeholder="Ex: 0.5"
                      min={0}
                      step={0.001}
                      value={form.pesoKg ?? ''}
                      onChange={(e) => set('pesoKg', e.target.value ? parseFloat(e.target.value) : null)}
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* Checkboxes: Destaque e Visível */}
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => set('destaque', !form.destaque)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        form.destaque
                          ? 'bg-gradient-gold border-gold-primary'
                          : 'bg-white/5 border-gold-primary/25 hover:border-gold-primary/50'
                      }`}
                    >
                      {form.destaque && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#1A0A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="type-overline text-[10px] text-cream/60 tracking-widest uppercase">Destaque</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => set('isVisivel', !form.isVisivel)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        form.isVisivel
                          ? 'bg-gradient-gold border-gold-primary'
                          : 'bg-white/5 border-gold-primary/25 hover:border-gold-primary/50'
                      }`}
                    >
                      {form.isVisivel && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#1A0A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="type-overline text-[10px] text-cream/60 tracking-widest uppercase">Visível na vitrine</span>
                  </label>
                </div>

                {/* Imagem do produto */}
                <Field label="Imagem do produto">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {/* Preview */}
                      <div className="w-14 h-14 rounded-xl border border-gold-primary/15 bg-white/5 shrink-0 overflow-hidden flex items-center justify-center">
                        {form.imagemUrl ? (
                          <img
                            src={form.imagemUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : (
                          <ImageIcon size={20} className="text-cream/20" />
                        )}
                      </div>

                      {/* Botão de upload */}
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading || loading}
                          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gold-primary/30 hover:border-gold-primary/60 text-cream/50 hover:text-cream text-xs transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? (
                            <>
                              <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <UploadSimpleIcon size={13} />
                              {form.imagemUrl ? 'Trocar imagem' : 'Selecionar imagem'}
                            </>
                          )}
                        </button>
                        {uploadError && (
                          <p className="text-red-300 text-[11px] mt-1.5">{uploadError}</p>
                        )}
                      </div>
                    </div>
                    {/* URL manual */}
                    <input
                      type="text"
                      placeholder="Ou cole uma URL de imagem..."
                      value={form.imagemUrl}
                      onChange={(e) => set('imagemUrl', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </Field>

                {/* Erro */}
                <AnimatePresence>
                  {(error || serverError) && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-body">
                        <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
                        {error || serverError}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 rounded-full border border-gold-primary/30 text-cream/60 hover:border-gold-primary/60 hover:text-cream type-overline tracking-widest text-xs transition-all duration-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { y: -1 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-gold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-dark-warm/30 border-t-dark-warm rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : isEdit ? (
                      'Salvar alterações'
                    ) : (
                      'Adicionar produto'
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const inputClass =
  'w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl px-4 py-2.5 text-cream placeholder-cream/20 text-sm outline-none transition-[border-color,background-color] duration-300 focus:bg-white/8'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">
        {label}
      </label>
      {children}
    </div>
  )
}

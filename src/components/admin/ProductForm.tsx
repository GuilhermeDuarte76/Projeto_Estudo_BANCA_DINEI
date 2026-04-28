import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XIcon, WarningCircleIcon, ImageIcon,
  CheckCircleIcon, StarIcon, PencilSimpleIcon,
  PlusIcon, TrashIcon, InfoIcon,
} from '@phosphor-icons/react'
import {
  type Product,
  type ProductCreateInput,
  type NacionalidadeSimples,
  type VarianteInput,
  UNIDADES_OPTIONS,
  uploadImage,
  getCategorias,
  getMarcas,
  getSabores,
  getTipos,
  getNacionalidades,
} from '../../services/admin'
import ChipInput from './ChipInput'
import SearchableSelect from './SearchableSelect'
import { EASE } from '../../lib/motion'

// ── Constants ─────────────────────────────────────────────────────────────────


const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const EMPTY_FORM: ProductCreateInput = {
  nome: '',
  descricao: null,
  preco: 0,
  categoria: '',
  marca: '',
  unidadeMedida: 'UN',
  codigoBarras: null,
  pesoKg: null,
  imagemUrl: null,
  destaque: false,
  isVisivel: true,
  isCardapio: false,
  nacionalidadeId: null,
  sabores: null,
  tipos: null,
}

// ── Types ─────────────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<string, string>>

type VarianteRow = { label: string; descricao: string; precoCents: number }

interface Props {
  open: boolean
  initial?: Product | null
  duplicateSource?: Product
  loading?: boolean
  serverError?: string
  onSave: (data: ProductCreateInput) => void
  onClose: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMoney(cents: number): string {
  if (cents === 0) return ''
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseCSV(str?: string | null): string[] {
  if (!str) return []
  return str.split(',').map((s) => s.trim()).filter(Boolean)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, required, error, children }: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block type-overline text-[9px] text-cream/40 tracking-widest mb-1.5 uppercase">
        {label}{required && <span className="text-gold-primary ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-300 text-[11px] mt-1">{error}</p>}
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse rounded-xl ${className}`} />
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProductForm({ open, initial, duplicateSource, loading = false, serverError, onSave, onClose }: Props) {
  // Form state
  const [form, setForm] = useState<ProductCreateInput>(EMPTY_FORM)
  const [precoCents, setPrecoCents] = useState(0)
  const [saboresChips, setSaboresChips] = useState<string[]>([])
  const [tiposChips, setTiposChips] = useState<string[]>([])
  const [errors, setErrors] = useState<FieldErrors>({})
  const [variantesRows, setVariantesRows] = useState<VarianteRow[]>([])

  // Image upload
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadAttempted, setUploadAttempted] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Catalog options
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [categorias, setCategorias] = useState<string[]>([])
  const [marcasOptions, setMarcasOptions] = useState<string[]>([])
  const [saboresOptions, setSaboresOptions] = useState<string[]>([])
  const [tiposOptions, setTiposOptions] = useState<string[]>([])
  const [nacionalidades, setNacionalidades] = useState<NacionalidadeSimples[]>([])
  const [optionErrors, setOptionErrors] = useState<Record<string, string>>({})

  // Manual input mode for categoria/marca
  const [categoriaManual, setCategoriaManual] = useState(false)
  const [marcaManual, setMarcaManual] = useState(false)

  const isEdit = !!initial
  const isDuplicate = !initial && !!duplicateSource

  // ── ESC to close ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // ── Set field ───────────────────────────────────────────────────────────────

  const set = useCallback(<K extends keyof ProductCreateInput>(key: K, value: ProductCreateInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      if (e[key]) {
        const next = { ...e }
        delete next[key]
        return next
      }
      return e
    })
  }, [])

  // ── Load options on open ────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    setOptionsLoading(true)
    setOptionErrors({})

    const promises = [
      getCategorias().then((r) => {
        if (r.success && r.data) setCategorias(r.data)
        else setOptionErrors((e) => ({ ...e, categorias: 'Falha ao carregar opções' }))
      }),
      getMarcas().then((r) => {
        if (r.success && r.data) setMarcasOptions(r.data)
        else setOptionErrors((e) => ({ ...e, marcas: 'Falha ao carregar opções' }))
      }),
      getSabores().then((r) => {
        if (r.success && r.data) setSaboresOptions(r.data)
        else setOptionErrors((e) => ({ ...e, sabores: 'Falha ao carregar opções' }))
      }),
      getTipos().then((r) => {
        if (r.success && r.data) setTiposOptions(r.data)
        else setOptionErrors((e) => ({ ...e, tipos: 'Falha ao carregar opções' }))
      }),
      getNacionalidades().then((r) => {
        if (r.success && r.data) setNacionalidades(r.data)
        else setOptionErrors((e) => ({ ...e, nacionalidades: 'Falha ao carregar opções' }))
      }),
    ]

    Promise.all(promises).finally(() => setOptionsLoading(false))
  }, [open])

  // ── Initialize form when modal opens ────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    setErrors({})
    setUploadError('')
    setUploadAttempted(false)
    setCategoriaManual(false)
    setMarcaManual(false)

    if (initial) {
      const cents = Math.round((initial.preco ?? 0) * 100)
      setPrecoCents(cents)
      setSaboresChips(parseCSV(initial.sabores))
      setTiposChips(parseCSV(initial.tipos))
      setVariantesRows(
        (initial.variantes ?? []).map((v) => ({
          label: v.label,
          descricao: v.descricao ?? '',
          precoCents: Math.round(v.preco * 100),
        }))
      )
      setForm({
        nome: initial.nome ?? '',
        descricao: initial.descricao ?? null,
        preco: initial.preco ?? 0,
        categoria: initial.categoria ?? '',
        marca: initial.marca ?? '',
        unidadeMedida: initial.unidadeMedida || 'UN',
        codigoBarras: initial.codigoBarras ?? null,
        pesoKg: initial.pesoKg ?? null,
        imagemUrl: initial.imagemUrl ?? null,
        destaque: initial.destaque ?? false,
        isCardapio: initial.isCardapio ?? false,
        nacionalidadeId: initial.nacionalidade?.id ?? null,
        sabores: initial.sabores ?? null,
        tipos: initial.tipos ?? null,
        isVisivel: initial.isVisivel,
      })
    } else if (duplicateSource) {
      const cents = Math.round((duplicateSource.preco ?? 0) * 100)
      setPrecoCents(cents)
      setSaboresChips(parseCSV(duplicateSource.sabores))
      setTiposChips(parseCSV(duplicateSource.tipos))
      setVariantesRows(
        (duplicateSource.variantes ?? []).map((v) => ({
          label: v.label,
          descricao: v.descricao ?? '',
          precoCents: Math.round(v.preco * 100),
        }))
      )
      setForm({
        nome: duplicateSource.nome ?? '',
        descricao: duplicateSource.descricao ?? null,
        preco: duplicateSource.preco ?? 0,
        categoria: duplicateSource.categoria ?? '',
        marca: duplicateSource.marca ?? '',
        unidadeMedida: duplicateSource.unidadeMedida || 'UN',
        codigoBarras: duplicateSource.codigoBarras ?? null,
        pesoKg: duplicateSource.pesoKg ?? null,
        imagemUrl: null,
        destaque: duplicateSource.destaque ?? false,
        isCardapio: false,
        nacionalidadeId: duplicateSource.nacionalidade?.id ?? null,
        sabores: duplicateSource.sabores ?? null,
        tipos: duplicateSource.tipos ?? null,
        isVisivel: duplicateSource.isVisivel,
      })
    } else {
      setPrecoCents(0)
      setSaboresChips([])
      setTiposChips([])
      setVariantesRows([])
      setForm(EMPTY_FORM)
    }
  }, [open, initial, duplicateSource])

  // ── Check if categoria/marca exist in loaded options (edit mode) ────────────

  useEffect(() => {
    if (!open || optionsLoading || !initial) return

    if (form.categoria && categorias.length > 0 && !categorias.includes(form.categoria)) {
      setCategoriaManual(true)
    }
    if (form.marca && marcasOptions.length > 0 && !marcasOptions.includes(form.marca)) {
      setMarcaManual(true)
    }
  }, [open, optionsLoading, initial, form.categoria, form.marca, categorias, marcasOptions])

  // ── Image upload ────────────────────────────────────────────────────────────

  const processFile = async (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Formato não suportado. Use PNG, JPG ou WEBP.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError('Imagem muito grande. Máximo 5MB.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadAttempted(true)

    const result = await uploadImage(file)
    setUploading(false)

    if (result.success && result.data?.url) {
      set('imagemUrl', result.data.url)
      setUploadError('')
    } else {
      setUploadError(result.message || 'Falha ao enviar imagem')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
    e.target.value = ''
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  // ── Price mask ──────────────────────────────────────────────────────────────

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    const cents = parseInt(digits) || 0
    setPrecoCents(cents)
    set('preco', cents / 100)
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: FieldErrors = {}

    if (!form.nome || form.nome.trim().length < 3) {
      errs.nome = 'Nome deve ter pelo menos 3 caracteres'
    }
    const hasVariantes = variantesRows.some((r) => r.label.trim() && r.precoCents > 0)
    if (!hasVariantes && (!form.preco || form.preco <= 0)) {
      errs.preco = 'Preço deve ser maior que R$ 0,00'
    }
    if (!form.categoria || !form.categoria.trim()) {
      errs.categoria = 'Categoria é obrigatória'
    }
    if (!form.marca || !form.marca.trim()) {
      errs.marca = 'Marca é obrigatória'
    }
    if (!form.unidadeMedida) {
      errs.unidadeMedida = 'Unidade de medida é obrigatória'
    }
    if (uploadAttempted && uploadError) {
      errs.imagemUrl = 'Falha no upload da imagem'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const variantes: VarianteInput[] = variantesRows
      .filter((r) => r.label.trim() && r.precoCents > 0)
      .map((r, i) => ({
        label: r.label.trim(),
        descricao: r.descricao.trim() || null,
        preco: r.precoCents / 100,
        ordem: i,
      }))

    const precoFinal = variantes.length > 0
      ? Math.min(...variantes.map((v) => v.preco))
      : form.preco

    const payload: ProductCreateInput = {
      ...form,
      preco: precoFinal,
      sabores: saboresChips.length > 0 ? saboresChips.join(',') : null,
      tipos: tiposChips.length > 0 ? tiposChips.join(',') : null,
      variantes: variantes.length > 0 ? variantes : undefined,
    }

    onSave(payload)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="form-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black/75"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="form-modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-0 z-[71] flex items-end md:items-center justify-center md:px-4 md:py-8 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl bg-dark-warm border border-gold-primary/25 rounded-t-3xl md:rounded-3xl shadow-gold overflow-hidden pointer-events-auto max-h-[95vh] md:max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header ─────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 md:px-7 pt-6 md:pt-7 pb-4 md:pb-5 shrink-0 border-b border-gold-primary/10">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest">
                        {isEdit ? 'Editar produto' : isDuplicate ? 'Duplicar produto' : 'Novo produto'}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] tracking-widest type-overline ${
                        isEdit
                          ? 'bg-gold-primary/15 text-gold-light'
                          : isDuplicate
                            ? 'bg-blue-500/15 text-blue-300'
                            : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {isEdit ? (
                          <><PencilSimpleIcon size={8} weight="fill" /> Editando</>
                        ) : isDuplicate ? (
                          <><PencilSimpleIcon size={8} weight="fill" /> Duplicando</>
                        ) : (
                          <><StarIcon size={8} weight="fill" /> Novo</>
                        )}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-xl md:text-2xl text-cream leading-tight">
                      {isEdit ? initial!.nome : isDuplicate ? `Duplicar — ${duplicateSource!.nome}` : 'Novo produto'}
                    </h2>
                    <p className="text-cream/30 text-xs font-body mt-0.5">
                      {isDuplicate ? 'Imagem não copiada — adicione uma nova' : 'Preencha as informações do produto'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300 shrink-0"
                >
                  <XIcon size={14} />
                </button>
              </div>

              {/* ── Form body ──────────────────────────────────────── */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="px-6 md:px-7 py-5 md:py-6 space-y-5">

                  {/* LINHA 1 — Imagem */}
                  <Field label="Imagem do produto" error={errors.imagemUrl}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                        uploadError
                          ? 'border-red-500/50 bg-red-500/5'
                          : dragging
                            ? 'border-gold-primary/60 bg-gold-primary/10'
                            : form.imagemUrl
                              ? 'border-emerald-500/30 bg-emerald-500/5'
                              : 'border-gold-primary/20 hover:border-gold-primary/40 bg-white/3 hover:bg-white/5'
                      }`}
                    >
                      {/* Preview / Placeholder */}
                      <div className="w-16 h-16 rounded-xl border border-gold-primary/15 bg-white/5 shrink-0 overflow-hidden flex items-center justify-center">
                        {form.imagemUrl ? (
                          <img
                            src={form.imagemUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : (
                          <ImageIcon size={24} className="text-cream/20" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {uploading ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin shrink-0" />
                            <span className="text-cream/50 text-xs font-body">Enviando imagem...</span>
                          </div>
                        ) : form.imagemUrl ? (
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon size={16} weight="fill" className="text-emerald-400 shrink-0" />
                            <span className="text-cream/60 text-xs font-body">Imagem carregada — clique para trocar</span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-cream/60 text-xs font-body">
                              <span className="text-gold-light font-medium">Clique</span> ou arraste uma imagem
                            </p>
                            <p className="text-cream/25 text-[10px] font-body mt-0.5">
                              PNG, JPG, WEBP · Máx. 5MB
                            </p>
                          </div>
                        )}
                        {uploadError && (
                          <p className="text-red-300 text-[11px] mt-1">{uploadError}</p>
                        )}
                      </div>
                    </div>
                  </Field>

                  {/* LINHA 2 — Nome */}
                  <Field label="Nome do produto" required error={errors.nome}>
                    <input
                      type="text"
                      placeholder="Ex: Coca-Cola Zero Lata 350ml"
                      value={form.nome}
                      onChange={(e) => set('nome', e.target.value)}
                      className={`${inputClass} ${errors.nome ? errorBorder : ''}`}
                    />
                  </Field>

                  {/* LINHA 3 — Descrição */}
                  <Field label="Descrição">
                    <textarea
                      placeholder="Descreva o produto brevemente..."
                      value={form.descricao ?? ''}
                      onChange={(e) => set('descricao', e.target.value || null)}
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </Field>

                  {/* LINHA 4 — Preço + Peso */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Preço" required error={errors.preco}>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30 text-sm font-body pointer-events-none">R$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0,00"
                          value={formatMoney(precoCents)}
                          onChange={handlePrecoChange}
                          className={`${inputClass} pl-11 ${errors.preco ? errorBorder : ''}`}
                        />
                      </div>
                    </Field>

                    <Field label="Peso (kg)">
                      <input
                        type="number"
                        placeholder="0.350"
                        min={0}
                        step={0.001}
                        value={form.pesoKg ?? ''}
                        onChange={(e) => set('pesoKg', e.target.value ? parseFloat(e.target.value) : null)}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  {/* LINHA 4b — Variantes de preço */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="type-overline text-[9px] text-cream/40 tracking-widest uppercase">
                        Variantes de preço
                        <span className="text-cream/25 ml-1 normal-case tracking-normal not-uppercase font-body">(Baby, Média, Grande...)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setVariantesRows((v) => [...v, { label: '', descricao: '', precoCents: 0 }])}
                        className="flex items-center gap-1 text-[10px] type-overline text-gold-primary/70 hover:text-gold-primary transition-colors duration-200 border border-gold-primary/20 hover:border-gold-primary/50 px-2.5 py-1 rounded-full"
                      >
                        <PlusIcon size={9} weight="bold" />
                        Adicionar
                      </button>
                    </div>

                    {variantesRows.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {variantesRows.map((row, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Label (ex: Baby)"
                              value={row.label}
                              onChange={(e) => setVariantesRows((v) => v.map((r, i) => i === idx ? { ...r, label: e.target.value } : r))}
                              className={`${inputClass} flex-[2] text-xs`}
                            />
                            <input
                              type="text"
                              placeholder="Descrição (ex: 550g)"
                              value={row.descricao}
                              onChange={(e) => setVariantesRows((v) => v.map((r, i) => i === idx ? { ...r, descricao: e.target.value } : r))}
                              className={`${inputClass} flex-[2] text-xs`}
                            />
                            <div className="relative flex-[1.5]">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30 text-xs pointer-events-none">R$</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0,00"
                                value={formatMoney(row.precoCents)}
                                onChange={(e) => {
                                  const cents = parseInt(e.target.value.replace(/\D/g, '')) || 0
                                  setVariantesRows((v) => v.map((r, i) => i === idx ? { ...r, precoCents: cents } : r))
                                }}
                                className={`${inputClass} pl-9 text-xs`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setVariantesRows((v) => v.filter((_, i) => i !== idx))}
                              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-red-500/20 text-red-400/60 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
                            >
                              <TrashIcon size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {variantesRows.some((r) => r.precoCents > 0) && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-primary/8 border border-gold-primary/15">
                        <InfoIcon size={12} className="text-gold-primary/60 shrink-0" />
                        <p className="text-[10px] font-body text-cream/40">
                          Preço base será automaticamente o menor valor das variantes
                          {' '}(R$ {formatMoney(Math.min(...variantesRows.filter(r => r.precoCents > 0).map(r => r.precoCents)))})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* LINHA 5 — Categoria + Marca */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Categoria */}
                    <Field label="Categoria" required error={errors.categoria || optionErrors.categorias}>
                      {optionsLoading ? (
                        <Skeleton className="h-[42px]" />
                      ) : categoriaManual ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Digite a categoria..."
                            value={form.categoria}
                            onChange={(e) => set('categoria', e.target.value)}
                            className={`flex-1 ${inputClass} ${errors.categoria ? errorBorder : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => { setCategoriaManual(false); set('categoria', '') }}
                            className="shrink-0 px-3 rounded-xl border border-gold-primary/20 text-cream/40 hover:text-cream/70 hover:border-gold-primary/40 text-xs transition-all"
                            title="Voltar para lista"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <SearchableSelect
                          value={form.categoria}
                          onChange={(val) => {
                            if (val === '__manual__') {
                              setCategoriaManual(true)
                              set('categoria', '')
                            } else {
                              set('categoria', val)
                            }
                          }}
                          options={categorias.map((c) => ({ value: c, label: c }))}
                          placeholder="Selecionar..."
                          error={!!errors.categoria}
                          extraOption={{ value: '__manual__', label: '+ Digitar manualmente' }}
                        />
                      )}
                    </Field>

                    {/* Marca */}
                    <Field label="Marca" required error={errors.marca || optionErrors.marcas}>
                      {optionsLoading ? (
                        <Skeleton className="h-[42px]" />
                      ) : marcaManual ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Digite a marca..."
                            value={form.marca}
                            onChange={(e) => set('marca', e.target.value)}
                            className={`flex-1 ${inputClass} ${errors.marca ? errorBorder : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => { setMarcaManual(false); set('marca', '') }}
                            className="shrink-0 px-3 rounded-xl border border-gold-primary/20 text-cream/40 hover:text-cream/70 hover:border-gold-primary/40 text-xs transition-all"
                            title="Voltar para lista"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <SearchableSelect
                          value={form.marca}
                          onChange={(val) => {
                            if (val === '__manual__') {
                              setMarcaManual(true)
                              set('marca', '')
                            } else {
                              set('marca', val)
                            }
                          }}
                          options={marcasOptions.map((m) => ({ value: m, label: m }))}
                          placeholder="Selecionar..."
                          error={!!errors.marca}
                          extraOption={{ value: '__manual__', label: '+ Digitar manualmente' }}
                        />
                      )}
                    </Field>
                  </div>

                  {/* LINHA 6 — Unidade + Código de barras */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Unidade de medida" required error={errors.unidadeMedida}>
                      <SearchableSelect
                        value={form.unidadeMedida}
                        onChange={(val) => set('unidadeMedida', val)}
                        options={UNIDADES_OPTIONS.map((u) => ({ value: u.value, label: u.label }))}
                        placeholder="Selecionar..."
                        error={!!errors.unidadeMedida}
                      />
                    </Field>

                    <Field label="Código de barras">
                      <input
                        type="text"
                        placeholder="7891000100103"
                        value={form.codigoBarras ?? ''}
                        onChange={(e) => set('codigoBarras', e.target.value || null)}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  {/* LINHA 7 — Sabores + Tipos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Sabores" error={optionErrors.sabores}>
                      {optionsLoading ? (
                        <Skeleton className="h-[42px]" />
                      ) : (
                        <ChipInput
                          value={saboresChips}
                          onChange={setSaboresChips}
                          suggestions={saboresOptions}
                          placeholder="Digitar sabor..."
                        />
                      )}
                    </Field>

                    <Field label="Tipos" error={optionErrors.tipos}>
                      {optionsLoading ? (
                        <Skeleton className="h-[42px]" />
                      ) : (
                        <ChipInput
                          value={tiposChips}
                          onChange={setTiposChips}
                          suggestions={tiposOptions}
                          placeholder="Digitar tipo..."
                        />
                      )}
                    </Field>
                  </div>

                  {/* LINHA 8 — Nacionalidade + Destaque */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nacionalidade" error={optionErrors.nacionalidades}>
                      {optionsLoading ? (
                        <Skeleton className="h-[42px]" />
                      ) : (
                        <SearchableSelect
                          value={form.nacionalidadeId != null ? String(form.nacionalidadeId) : ''}
                          onChange={(val) => set('nacionalidadeId', val ? parseInt(val) : null)}
                          options={nacionalidades.map((n) => ({ value: String(n.id), label: n.nome }))}
                          placeholder="Selecionar..."
                        />
                      )}
                    </Field>

                    <Field label="Destaque">
                      <button
                        type="button"
                        onClick={() => set('destaque', !form.destaque)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 text-left ${
                          form.destaque
                            ? 'border-gold-primary/40 bg-gold-primary/10'
                            : 'border-gold-primary/15 bg-white/5 hover:border-gold-primary/30'
                        }`}
                      >
                        <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 shrink-0 ${
                          form.destaque ? 'bg-gradient-gold' : 'bg-white/10'
                        }`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-cream shadow transition-transform duration-300 ${
                            form.destaque ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`} />
                        </div>
                        <div>
                          <p className="text-cream/80 text-xs font-body font-medium leading-tight">
                            Produto em destaque
                          </p>
                          <p className="text-cream/30 text-[10px] font-body leading-tight">
                            Exibido com prioridade no catálogo
                          </p>
                        </div>
                      </button>
                    </Field>
                  </div>

                  {/* LINHA 9 — Loja online + Cardápio */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Loja online">
                      <button
                        type="button"
                        onClick={() => set('isVisivel', !form.isVisivel)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 text-left ${
                          form.isVisivel
                            ? 'border-gold-primary/40 bg-gold-primary/10'
                            : 'border-gold-primary/15 bg-white/5 hover:border-gold-primary/30'
                        }`}
                      >
                        <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 shrink-0 ${
                          form.isVisivel ? 'bg-gradient-gold' : 'bg-white/10'
                        }`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-cream shadow transition-transform duration-300 ${
                            form.isVisivel ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`} />
                        </div>
                        <div>
                          <p className="text-cream/80 text-xs font-body font-medium leading-tight">
                            Exibir na loja online
                          </p>
                          <p className="text-cream/30 text-[10px] font-body leading-tight">
                            Controla se aparece na vitrine e no catálogo do site
                          </p>
                        </div>
                      </button>
                    </Field>

                    <Field label="Cardápio presencial">
                      <button
                        type="button"
                        onClick={() => set('isCardapio', !form.isCardapio)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 text-left ${
                          form.isCardapio
                            ? 'border-gold-primary/40 bg-gold-primary/10'
                            : 'border-gold-primary/15 bg-white/5 hover:border-gold-primary/30'
                        }`}
                      >
                        <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 shrink-0 ${
                          form.isCardapio ? 'bg-gradient-gold' : 'bg-white/10'
                        }`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-cream shadow transition-transform duration-300 ${
                            form.isCardapio ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`} />
                        </div>
                        <div>
                          <p className="text-cream/80 text-xs font-body font-medium leading-tight">
                            Exibir no cardápio presencial
                          </p>
                          <p className="text-cream/30 text-[10px] font-body leading-tight">
                            Aparece na tela /cardapio da loja física
                          </p>
                        </div>
                      </button>
                    </Field>
                  </div>

                  {/* ── Server / Validation errors ───────── */}
                  <AnimatePresence>
                    {serverError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-body">
                          <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
                          {serverError}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Footer ───────────────────────────────────────── */}
                <div className="sticky bottom-0 px-6 md:px-7 py-4 md:py-5 border-t border-gold-primary/10 bg-dark-warm/95 backdrop-blur-sm flex gap-3 shrink-0">
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
                    disabled={loading || uploading}
                    whileHover={!(loading || uploading) ? { y: -1 } : {}}
                    whileTap={!(loading || uploading) ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-gold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-dark-warm/30 border-t-dark-warm rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar produto'
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

// ── Styles ─────────────────────────────────────────────────────────────────────

const inputClass =
  'w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl px-4 py-2.5 text-cream placeholder-cream/20 text-sm outline-none transition-[border-color,background-color] duration-300 focus:bg-white/8'

const errorBorder = '!border-red-500/50 !hover:border-red-500/60 !focus:border-red-500/70'

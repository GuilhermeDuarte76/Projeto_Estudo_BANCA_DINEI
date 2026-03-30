import { useState, useEffect, useCallback, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCircleIcon, MapPinIcon, PhoneIcon, PlusIcon,
  PencilSimpleIcon, TrashIcon, StarIcon, XIcon,
  WarningCircleIcon, CheckCircleIcon, ArrowClockwiseIcon,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import {
  type UserContato, type UserContatoInput,
  type UserEndereco, type UserEnderecoInput,
  type TipoContato,
  getContatos, createContato, updateContato, setContatoPrincipal, deleteContato,
  getEnderecos, createEndereco, updateEndereco, setEnderecoPrincipal, deleteEndereco,
} from '../services/usuarios'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

const TIPOS_CONTATO: TipoContato[] = ['Celular', 'Fixo', 'WhatsApp']

const inputClass =
  'w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl px-4 py-2.5 text-cream placeholder-cream/20 text-sm outline-none transition-[border-color,background-color] duration-300 focus:bg-white/8'

const selectClass =
  'w-full bg-dark-warm border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl px-4 py-2.5 text-cream text-sm outline-none transition-[border-color] duration-300'

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

// ── Modal base ────────────────────────────────────────────────────────────────

function Modal({ open, title, onClose, children }: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-dark-warm border border-gold-primary/20 rounded-2xl w-full max-w-md shadow-gold pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gold-primary/10">
                <p className="font-display font-bold text-cream text-lg">{title}</p>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/40 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200"
                >
                  <XIcon size={14} />
                </button>
              </div>
              <div className="px-6 py-5">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Contato Form ──────────────────────────────────────────────────────────────

function ContatoForm({ open, initial, loading, onSave, onClose }: {
  open: boolean
  initial?: UserContato | null
  loading?: boolean
  onSave: (data: UserContatoInput) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<UserContatoInput>({ tipo: 'Celular', valor: '', isPrincipal: false })
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { tipo: initial.tipo, valor: initial.valor, isPrincipal: initial.isPrincipal }
        : { tipo: 'Celular', valor: '', isPrincipal: false }
      )
      setError('')
    }
  }, [open, initial])

  const handleSave = () => {
    if (!form.valor.trim()) { setError('Informe o número de contato.'); return }
    onSave(form)
  }

  return (
    <Modal open={open} title={initial ? 'Editar Contato' : 'Novo Contato'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Tipo">
          <select
            value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoContato }))}
            className={selectClass}
          >
            {TIPOS_CONTATO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Número">
          <input
            type="text"
            value={form.valor}
            onChange={(e) => { setForm((f) => ({ ...f, valor: e.target.value })); setError('') }}
            placeholder="(34) 99999-9999"
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.isPrincipal}
            onChange={(e) => setForm((f) => ({ ...f, isPrincipal: e.target.checked }))}
            className="accent-amber-400 w-4 h-4"
          />
          <span className="type-overline text-[10px] text-cream/50 group-hover:text-cream/80 tracking-widest transition-colors duration-200">
            Contato principal
          </span>
        </label>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs">
            <WarningCircleIcon size={14} /> {error}
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80 rounded-xl py-2.5 text-sm transition-all duration-200">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-gold text-dark-warm font-bold rounded-xl py-2.5 text-sm hover:shadow-gold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Endereço Form ─────────────────────────────────────────────────────────────

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

function EnderecoForm({ open, initial, loading, onSave, onClose }: {
  open: boolean
  initial?: UserEndereco | null
  loading?: boolean
  onSave: (data: UserEnderecoInput) => void
  onClose: () => void
}) {
  const empty: UserEnderecoInput = {
    logradouro: '', numero: '', complemento: '', bairro: '',
    cidade: '', estado: 'MG', cep: '', isPrincipal: false,
  }
  const [form, setForm] = useState<UserEnderecoInput>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof UserEnderecoInput, string>>>({})
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const numeroRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { logradouro: initial.logradouro, numero: initial.numero, complemento: initial.complemento ?? '', bairro: initial.bairro, cidade: initial.cidade, estado: initial.estado, cep: initial.cep, isPrincipal: initial.isPrincipal }
        : empty
      )
      setErrors({})
      setCepError('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const set = (k: keyof UserEnderecoInput, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const fetchCep = async (rawCep: string) => {
    const digits = rawCep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    setCepError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) {
        setCepError('CEP não encontrado.')
      } else {
        setForm((f) => ({
          ...f,
          logradouro: data.logradouro || f.logradouro,
          bairro:     data.bairro     || f.bairro,
          cidade:     data.localidade || f.cidade,
          estado:     data.uf         || f.estado,
        }))
        setErrors((e) => ({ ...e, logradouro: undefined, bairro: undefined, cidade: undefined, cep: undefined }))
        setTimeout(() => numeroRef.current?.focus(), 50)
      }
    } catch {
      setCepError('Erro ao consultar CEP.')
    } finally {
      setCepLoading(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value)
    set('cep', formatted)
    setCepError('')
    if (formatted.replace(/\D/g, '').length === 8) {
      fetchCep(formatted)
    }
  }

  const validate = () => {
    const e: Partial<Record<keyof UserEnderecoInput, string>> = {}
    if (!form.logradouro.trim()) e.logradouro = 'Obrigatório'
    if (!form.numero.trim())     e.numero     = 'Obrigatório'
    if (!form.bairro.trim())     e.bairro     = 'Obrigatório'
    if (!form.cidade.trim())     e.cidade     = 'Obrigatório'
    if (!form.cep.trim())        e.cep        = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (validate()) onSave(form)
  }

  return (
    <Modal open={open} title={initial ? 'Editar Endereço' : 'Novo Endereço'} onClose={onClose}>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">

        {/* CEP — primeiro campo */}
        <Field label="CEP">
          <div className="relative">
            <input
              type="text"
              value={form.cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              maxLength={9}
              className={inputClass}
            />
            {cepLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="inline-flex"
                >
                  <ArrowClockwiseIcon size={14} className="text-gold-primary/60" />
                </motion.span>
              </span>
            )}
          </div>
          {cepError && (
            <p className="flex items-center gap-1 text-red-400 text-[10px] mt-1">
              <WarningCircleIcon size={11} /> {cepError}
            </p>
          )}
          {errors.cep && !cepError && <p className="text-red-400 text-[10px] mt-1">{errors.cep}</p>}
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="Logradouro">
              <input type="text" value={form.logradouro} onChange={(e) => set('logradouro', e.target.value)} placeholder="Rua / Av." className={inputClass} />
              {errors.logradouro && <p className="text-red-400 text-[10px] mt-1">{errors.logradouro}</p>}
            </Field>
          </div>
          <Field label="Número">
            <input ref={numeroRef} type="text" value={form.numero} onChange={(e) => set('numero', e.target.value)} placeholder="123" className={inputClass} />
            {errors.numero && <p className="text-red-400 text-[10px] mt-1">{errors.numero}</p>}
          </Field>
        </div>

        <Field label="Complemento">
          <input type="text" value={form.complemento} onChange={(e) => set('complemento', e.target.value)} placeholder="Apto, bloco… (opcional)" className={inputClass} />
        </Field>

        <Field label="Bairro">
          <input type="text" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} placeholder="Bairro" className={inputClass} />
          {errors.bairro && <p className="text-red-400 text-[10px] mt-1">{errors.bairro}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cidade">
            <input type="text" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} placeholder="Cidade" className={inputClass} />
            {errors.cidade && <p className="text-red-400 text-[10px] mt-1">{errors.cidade}</p>}
          </Field>
          <Field label="Estado">
            <select value={form.estado} onChange={(e) => set('estado', e.target.value)} className={selectClass}>
              {ESTADOS_BR.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer group pt-1">
          <input
            type="checkbox"
            checked={form.isPrincipal}
            onChange={(e) => set('isPrincipal', e.target.checked)}
            className="accent-amber-400 w-4 h-4"
          />
          <span className="type-overline text-[10px] text-cream/50 group-hover:text-cream/80 tracking-widest transition-colors duration-200">
            Endereço principal
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80 rounded-xl py-2.5 text-sm transition-all duration-200">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || cepLoading}
            className="flex-1 bg-gradient-gold text-dark-warm font-bold rounded-xl py-2.5 text-sm hover:shadow-gold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-full shadow-gold text-sm font-body font-bold whitespace-nowrap ${
        type === 'success'
          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
          : 'bg-red-500/20 border border-red-500/40 text-red-300'
      }`}
    >
      {type === 'success' ? <CheckCircleIcon size={16} /> : <WarningCircleIcon size={16} />}
      {message}
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Contatos state
  const [contatos, setContatos] = useState<UserContato[]>([])
  const [loadingContatos, setLoadingContatos] = useState(true)
  const [contatoModal, setContatoModal] = useState<{ open: boolean; item: UserContato | null }>({ open: false, item: null })
  const [savingContato, setSavingContato] = useState(false)

  // Endereços state
  const [enderecos, setEnderecos] = useState<UserEndereco[]>([])
  const [loadingEnderecos, setLoadingEnderecos] = useState(true)
  const [enderecoModal, setEnderecoModal] = useState<{ open: boolean; item: UserEndereco | null }>({ open: false, item: null })
  const [savingEndereco, setSavingEndereco] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  // Load data
  useEffect(() => {
    if (!user) return
    const uid = user.id
    setLoadingContatos(true)
    getContatos(uid).then((res) => {
      if (res.success) setContatos(res.data ?? [])
      setLoadingContatos(false)
    })
    setLoadingEnderecos(true)
    getEnderecos(uid).then((res) => {
      if (res.success) setEnderecos(res.data ?? [])
      setLoadingEnderecos(false)
    })
  }, [user])

  // ── Contato handlers ────────────────────────────────────────────────────────

  const handleSaveContato = async (data: UserContatoInput) => {
    if (!user) return
    setSavingContato(true)
    const uid = user.id
    let res
    if (contatoModal.item) {
      res = await updateContato(uid, contatoModal.item.id, data)
    } else {
      res = await createContato(uid, data)
    }
    setSavingContato(false)
    if (res.success) {
      const fresh = await getContatos(uid)
      if (fresh.success) setContatos(fresh.data ?? [])
      setContatoModal({ open: false, item: null })
      showToast('Contato salvo com sucesso!', 'success')
    } else {
      showToast(res.message || 'Erro ao salvar contato.', 'error')
    }
  }

  const handleDeleteContato = async (id: number) => {
    if (!user) return
    const res = await deleteContato(user.id, id)
    if (res.success) {
      setContatos((prev) => prev.filter((c) => c.id !== id))
      showToast('Contato removido.', 'success')
    } else {
      showToast('Erro ao remover contato.', 'error')
    }
  }

  const handleSetContatoPrincipal = async (id: number) => {
    if (!user) return
    const res = await setContatoPrincipal(user.id, id)
    if (res.success) {
      setContatos((prev) => prev.map((c) => ({ ...c, isPrincipal: c.id === id })))
    }
  }

  // ── Endereço handlers ───────────────────────────────────────────────────────

  const handleSaveEndereco = async (data: UserEnderecoInput) => {
    if (!user) return
    setSavingEndereco(true)
    const uid = user.id
    let res
    if (enderecoModal.item) {
      res = await updateEndereco(uid, enderecoModal.item.id, data)
    } else {
      res = await createEndereco(uid, data)
    }
    setSavingEndereco(false)
    if (res.success) {
      const fresh = await getEnderecos(uid)
      if (fresh.success) setEnderecos(fresh.data ?? [])
      setEnderecoModal({ open: false, item: null })
      showToast('Endereço salvo com sucesso!', 'success')
    } else {
      showToast(res.message || 'Erro ao salvar endereço.', 'error')
    }
  }

  const handleDeleteEndereco = async (id: number) => {
    if (!user) return
    const res = await deleteEndereco(user.id, id)
    if (res.success) {
      setEnderecos((prev) => prev.filter((e) => e.id !== id))
      showToast('Endereço removido.', 'success')
    } else {
      showToast('Erro ao remover endereço.', 'error')
    }
  }

  const handleSetEnderecoPrincipal = async (id: number) => {
    if (!user) return
    const res = await setEnderecoPrincipal(user.id, id)
    if (res.success) {
      setEnderecos((prev) => prev.map((e) => ({ ...e, isPrincipal: e.id === id })))
    }
  }

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
          className="mb-10"
        >
          <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">Conta</p>
          <h1 className="font-display font-bold text-3xl text-cream">Meu Perfil</h1>
        </motion.div>

        {/* User info card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
          className="bg-white/3 border border-gold-primary/15 rounded-2xl p-6 mb-8 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
            <UserCircleIcon size={32} weight="fill" className="text-dark-warm" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-cream text-xl leading-tight truncate">{user!.name}</p>
            <p className="text-cream/50 text-sm font-body mt-0.5 truncate">{user!.email}</p>
            <span className={`inline-block mt-1.5 type-overline text-[9px] tracking-widest px-2.5 py-0.5 rounded-full border ${
              user!.role === 'Admin'
                ? 'border-gold-primary/50 text-gold-light bg-gold-primary/10'
                : 'border-cream/20 text-cream/40 bg-white/5'
            }`}>
              {user!.role === 'Admin' ? 'Administrador' : 'Cliente'}
            </span>
          </div>
        </motion.div>

        {/* ── Endereços ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPinIcon size={16} weight="fill" className="text-gold-primary/60" />
              <h2 className="font-display font-bold text-cream text-lg">Endereços</h2>
            </div>
            <button
              onClick={() => setEnderecoModal({ open: true, item: null })}
              className="flex items-center gap-1.5 type-overline text-[9px] tracking-widest px-3.5 py-2 rounded-full border border-gold-primary/30 text-cream/60 hover:border-gold-primary/60 hover:text-gold-light transition-all duration-300"
            >
              <PlusIcon size={12} weight="bold" />
              Adicionar
            </button>
          </div>

          {loadingEnderecos ? (
            <div className="text-cream/30 text-sm font-body py-6 text-center">Carregando...</div>
          ) : enderecos.length === 0 ? (
            <div className="border border-dashed border-gold-primary/15 rounded-2xl py-10 text-center">
              <MapPinIcon size={28} className="text-cream/15 mx-auto mb-2" />
              <p className="text-cream/30 text-sm font-body">Nenhum endereço cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enderecos.map((end, i) => (
                <motion.div
                  key={end.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
                  className={`bg-white/3 border rounded-xl px-5 py-4 flex items-start justify-between gap-4 ${
                    end.isPrincipal ? 'border-gold-primary/30' : 'border-gold-primary/10'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {end.isPrincipal && (
                        <span className="type-overline text-[8px] tracking-widest text-gold-light bg-gold-primary/15 border border-gold-primary/25 px-2 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-cream/85 text-sm font-body">
                      {end.logradouro}, {end.numero}{end.complemento ? `, ${end.complemento}` : ''}
                    </p>
                    <p className="text-cream/45 text-xs font-body mt-0.5">
                      {end.bairro} · {end.cidade}/{end.estado} · CEP {end.cep}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!end.isPrincipal && (
                      <button
                        onClick={() => handleSetEnderecoPrincipal(end.id)}
                        title="Definir como principal"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-cream/30 hover:text-gold-light hover:bg-gold-primary/10 transition-all duration-200"
                      >
                        <StarIcon size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => setEnderecoModal({ open: true, item: end })}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-cream/30 hover:text-gold-light hover:bg-gold-primary/10 transition-all duration-200"
                    >
                      <PencilSimpleIcon size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteEndereco(end.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-cream/30 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Contatos ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PhoneIcon size={16} weight="fill" className="text-gold-primary/60" />
              <h2 className="font-display font-bold text-cream text-lg">Contatos</h2>
            </div>
            <button
              onClick={() => setContatoModal({ open: true, item: null })}
              className="flex items-center gap-1.5 type-overline text-[9px] tracking-widest px-3.5 py-2 rounded-full border border-gold-primary/30 text-cream/60 hover:border-gold-primary/60 hover:text-gold-light transition-all duration-300"
            >
              <PlusIcon size={12} weight="bold" />
              Adicionar
            </button>
          </div>

          {loadingContatos ? (
            <div className="text-cream/30 text-sm font-body py-6 text-center">Carregando...</div>
          ) : contatos.length === 0 ? (
            <div className="border border-dashed border-gold-primary/15 rounded-2xl py-10 text-center">
              <PhoneIcon size={28} className="text-cream/15 mx-auto mb-2" />
              <p className="text-cream/30 text-sm font-body">Nenhum contato cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contatos.map((cont, i) => (
                <motion.div
                  key={cont.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
                  className={`bg-white/3 border rounded-xl px-5 py-4 flex items-center justify-between gap-4 ${
                    cont.isPrincipal ? 'border-gold-primary/30' : 'border-gold-primary/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center flex-shrink-0">
                      <PhoneIcon size={13} weight="fill" className="text-gold-primary/70" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-cream/85 text-sm font-body">{cont.valor}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="type-overline text-[8px] tracking-widest text-cream/35">{cont.tipo}</span>
                        {cont.isPrincipal && (
                          <span className="type-overline text-[8px] tracking-widest text-gold-light bg-gold-primary/15 border border-gold-primary/25 px-1.5 py-px rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!cont.isPrincipal && (
                      <button
                        onClick={() => handleSetContatoPrincipal(cont.id)}
                        title="Definir como principal"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-cream/30 hover:text-gold-light hover:bg-gold-primary/10 transition-all duration-200"
                      >
                        <StarIcon size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => setContatoModal({ open: true, item: cont })}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-cream/30 hover:text-gold-light hover:bg-gold-primary/10 transition-all duration-200"
                    >
                      <PencilSimpleIcon size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteContato(cont.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-cream/30 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <ContatoForm
        open={contatoModal.open}
        initial={contatoModal.item}
        loading={savingContato}
        onSave={handleSaveContato}
        onClose={() => setContatoModal({ open: false, item: null })}
      />
      <EnderecoForm
        open={enderecoModal.open}
        initial={enderecoModal.item}
        loading={savingEndereco}
        onSave={handleSaveEndereco}
        onClose={() => setEnderecoModal({ open: false, item: null })}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key={toast.message} message={toast.message} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon, WarningCircleIcon, XIcon, PlusIcon,
  PencilSimpleIcon, TrashIcon, StarIcon, PhoneIcon, MapPinIcon,
} from '@phosphor-icons/react'
import {
  type UserContato, type UserContatoInput,
  type UserEndereco, type UserEnderecoInput,
  type TipoContato,
  getContatos, createContato, updateContato, setContatoPrincipal, deleteContato,
  getEnderecos, createEndereco, updateEndereco, setEnderecoPrincipal, deleteEndereco,
} from '../../services/usuarios'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

const TIPOS_CONTATO: TipoContato[] = ['Celular', 'Fixo', 'WhatsApp']

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

// ── Contato Form Modal ────────────────────────────────────────────────────────

interface ContatoFormProps {
  open: boolean
  initial?: UserContato | null
  loading?: boolean
  onSave: (data: UserContatoInput) => void
  onClose: () => void
}

function ContatoForm({ open, initial, loading = false, onSave, onClose }: ContatoFormProps) {
  const [form, setForm] = useState<UserContatoInput>({ tipo: 'Celular', valor: '', isPrincipal: false })
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initial ? { tipo: initial.tipo, valor: initial.valor, isPrincipal: initial.isPrincipal } : { tipo: 'Celular', valor: '', isPrincipal: false })
      setError('')
    }
  }, [open, initial])

  const set = <K extends keyof UserContatoInput>(k: K, v: UserContatoInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.valor.trim()) { setError('Número é obrigatório.'); return }
    onSave(form)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="cb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/75" onClick={onClose} />
          <motion.div key="cm" initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }} transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 z-[81] flex items-center justify-center px-4 pointer-events-none">
            <div className="w-full max-w-sm bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold pointer-events-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h3 className="font-display font-bold text-lg text-cream">
                  {initial ? 'Editar contato' : 'Novo contato'}
                </h3>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300">
                  <XIcon size={12} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo">
                    <select value={form.tipo} onChange={(e) => set('tipo', e.target.value as TipoContato)}
                      className={`${inputClass} appearance-none cursor-pointer`}>
                      {TIPOS_CONTATO.map((t) => (
                        <option key={t} value={t} className="bg-dark-warm text-cream">{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Número">
                    <input type="text" placeholder="(99) 99999-9999" value={form.valor}
                      onChange={(e) => set('valor', e.target.value)} className={inputClass} />
                  </Field>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div onClick={() => set('isPrincipal', !form.isPrincipal)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${form.isPrincipal ? 'bg-gradient-gold border-gold-primary' : 'bg-white/5 border-gold-primary/25 hover:border-gold-primary/50'}`}>
                    {form.isPrincipal && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#1A0A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="type-overline text-[10px] text-cream/60 tracking-widest uppercase">Contato principal</span>
                </label>
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-body overflow-hidden">
                      <WarningCircleIcon size={14} weight="fill" className="shrink-0" />{error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} disabled={loading}
                    className="flex-1 py-2.5 rounded-full border border-gold-primary/30 text-cream/60 hover:border-gold-primary/60 hover:text-cream type-overline tracking-widest text-xs transition-all duration-300 disabled:opacity-50">
                    Cancelar
                  </button>
                  <motion.button type="submit" disabled={loading} whileHover={!loading ? { y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                    className="flex-1 py-2.5 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest hover:shadow-gold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300">
                    {loading ? <><span className="w-3 h-3 border-2 border-dark-warm/30 border-t-dark-warm rounded-full animate-spin" />Salvando...</> : 'Salvar'}
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

// ── Endereço Form Modal ───────────────────────────────────────────────────────

interface EnderecoFormProps {
  open: boolean
  initial?: UserEndereco | null
  loading?: boolean
  onSave: (data: UserEnderecoInput) => void
  onClose: () => void
}

const EMPTY_ENDERECO: UserEnderecoInput = {
  logradouro: '', numero: '', complemento: '', bairro: '',
  cidade: '', estado: '', cep: '', isPrincipal: false,
}

function EnderecoForm({ open, initial, loading = false, onSave, onClose }: EnderecoFormProps) {
  const [form, setForm] = useState<UserEnderecoInput>(EMPTY_ENDERECO)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { logradouro: initial.logradouro, numero: initial.numero, complemento: initial.complemento ?? '', bairro: initial.bairro, cidade: initial.cidade, estado: initial.estado, cep: initial.cep, isPrincipal: initial.isPrincipal }
        : EMPTY_ENDERECO)
      setError('')
    }
  }, [open, initial])

  const set = <K extends keyof UserEnderecoInput>(k: K, v: UserEnderecoInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.logradouro.trim()) { setError('Logradouro é obrigatório.'); return }
    if (!form.numero.trim()) { setError('Número é obrigatório.'); return }
    if (!form.bairro.trim()) { setError('Bairro é obrigatório.'); return }
    if (!form.cidade.trim()) { setError('Cidade é obrigatória.'); return }
    if (!form.estado.trim() || form.estado.length !== 2) { setError('Estado deve ter 2 letras (UF).'); return }
    const cepDigits = form.cep.replace(/\D/g, '')
    if (cepDigits.length !== 8) { setError('CEP deve ter 8 dígitos.'); return }
    onSave({ ...form, cep: cepDigits.replace(/(\d{5})(\d{3})/, '$1-$2') })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="eb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/75" onClick={onClose} />
          <motion.div key="em" initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }} transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 z-[81] flex items-center justify-center px-4 py-8 pointer-events-none">
            <div className="w-full max-w-md bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold pointer-events-auto max-h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
                <h3 className="font-display font-bold text-lg text-cream">
                  {initial ? 'Editar endereço' : 'Novo endereço'}
                </h3>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300">
                  <XIcon size={12} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="px-6 pb-6 overflow-y-auto flex-1 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Field label="Logradouro">
                      <input type="text" placeholder="Rua, Av., etc." value={form.logradouro}
                        onChange={(e) => set('logradouro', e.target.value)} className={inputClass} />
                    </Field>
                  </div>
                  <Field label="Número">
                    <input type="text" placeholder="123" value={form.numero}
                      onChange={(e) => set('numero', e.target.value)} className={inputClass} />
                  </Field>
                </div>
                <Field label="Complemento">
                  <input type="text" placeholder="Apto, Sala, etc." value={form.complemento ?? ''}
                    onChange={(e) => set('complemento', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Bairro">
                  <input type="text" placeholder="Bairro" value={form.bairro}
                    onChange={(e) => set('bairro', e.target.value)} className={inputClass} />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Field label="Cidade">
                      <input type="text" placeholder="Cidade" value={form.cidade}
                        onChange={(e) => set('cidade', e.target.value)} className={inputClass} />
                    </Field>
                  </div>
                  <Field label="UF">
                    <input type="text" placeholder="SP" maxLength={2} value={form.estado}
                      onChange={(e) => set('estado', e.target.value.toUpperCase())} className={inputClass} />
                  </Field>
                </div>
                <Field label="CEP">
                  <input type="text" placeholder="00000-000" value={form.cep}
                    onChange={(e) => set('cep', e.target.value)} className={inputClass} />
                </Field>
                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <div onClick={() => set('isPrincipal', !form.isPrincipal)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${form.isPrincipal ? 'bg-gradient-gold border-gold-primary' : 'bg-white/5 border-gold-primary/25 hover:border-gold-primary/50'}`}>
                    {form.isPrincipal && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#1A0A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="type-overline text-[10px] text-cream/60 tracking-widest uppercase">Endereço principal</span>
                </label>
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-body overflow-hidden">
                      <WarningCircleIcon size={14} weight="fill" className="shrink-0" />{error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} disabled={loading}
                    className="flex-1 py-2.5 rounded-full border border-gold-primary/30 text-cream/60 hover:border-gold-primary/60 hover:text-cream type-overline tracking-widest text-xs transition-all duration-300 disabled:opacity-50">
                    Cancelar
                  </button>
                  <motion.button type="submit" disabled={loading} whileHover={!loading ? { y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                    className="flex-1 py-2.5 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest hover:shadow-gold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300">
                    {loading ? <><span className="w-3 h-3 border-2 border-dark-warm/30 border-t-dark-warm rounded-full animate-spin" />Salvando...</> : 'Salvar'}
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

// ── Main Tab ──────────────────────────────────────────────────────────────────

type ActiveSection = 'contatos' | 'enderecos'

export default function UsersTab() {
  const [userIdInput, setUserIdInput] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<ActiveSection>('contatos')
  const [globalLoading, setGlobalLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  // Contatos state
  const [contatos, setContatos] = useState<UserContato[]>([])
  const [contatoFormOpen, setContatoFormOpen] = useState(false)
  const [contatoEdit, setContatoEdit] = useState<UserContato | null>(null)
  const [contatoFormLoading, setContatoFormLoading] = useState(false)
  const [togglingContatoId, setTogglingContatoId] = useState<number | null>(null)
  const [deletingContatoId, setDeletingContatoId] = useState<number | null>(null)

  // Endereços state
  const [enderecos, setEnderecos] = useState<UserEndereco[]>([])
  const [enderecoFormOpen, setEnderecoFormOpen] = useState(false)
  const [enderecoEdit, setEnderecoEdit] = useState<UserEndereco | null>(null)
  const [enderecoFormLoading, setEnderecoFormLoading] = useState(false)
  const [togglingEnderecoId, setTogglingEnderecoId] = useState<number | null>(null)
  const [deletingEnderecoId, setDeletingEnderecoId] = useState<number | null>(null)

  const loadUserData = async (id: number) => {
    setGlobalLoading(true)
    setGlobalError('')
    const [cRes, eRes] = await Promise.all([getContatos(id), getEnderecos(id)])
    if (!cRes.success && !eRes.success) {
      setGlobalError(`Usuário #${id} não encontrado ou sem permissão.`)
      setUserId(null)
    } else {
      setUserId(id)
      setContatos(cRes.success ? (cRes.data ?? []) : [])
      setEnderecos(eRes.success ? (eRes.data ?? []) : [])
    }
    setGlobalLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const id = parseInt(userIdInput)
    if (!id || id <= 0) { setGlobalError('Informe um ID de usuário válido.'); return }
    loadUserData(id)
  }

  // ── Contatos handlers ──────────────────────────────────────────────────────

  const refreshContatos = async () => {
    if (!userId) return
    const res = await getContatos(userId)
    if (res.success) setContatos(res.data ?? [])
  }

  const handleSaveContato = async (data: UserContatoInput) => {
    if (!userId) return
    setContatoFormLoading(true)
    const res = contatoEdit
      ? await updateContato(userId, contatoEdit.id, data)
      : await createContato(userId, data)
    setContatoFormLoading(false)
    if (res.success) {
      setContatoFormOpen(false)
      setContatoEdit(null)
      refreshContatos()
    }
  }

  const handleSetContatoPrincipal = async (id: number) => {
    if (!userId) return
    setTogglingContatoId(id)
    await setContatoPrincipal(userId, id)
    setTogglingContatoId(null)
    refreshContatos()
  }

  const handleDeleteContato = async (id: number) => {
    if (!userId) return
    setDeletingContatoId(id)
    await deleteContato(userId, id)
    setDeletingContatoId(null)
    refreshContatos()
  }

  // ── Endereços handlers ─────────────────────────────────────────────────────

  const refreshEnderecos = async () => {
    if (!userId) return
    const res = await getEnderecos(userId)
    if (res.success) setEnderecos(res.data ?? [])
  }

  const handleSaveEndereco = async (data: UserEnderecoInput) => {
    if (!userId) return
    setEnderecoFormLoading(true)
    const res = enderecoEdit
      ? await updateEndereco(userId, enderecoEdit.id, data)
      : await createEndereco(userId, data)
    setEnderecoFormLoading(false)
    if (res.success) {
      setEnderecoFormOpen(false)
      setEnderecoEdit(null)
      refreshEnderecos()
    }
  }

  const handleSetEnderecoPrincipal = async (id: number) => {
    if (!userId) return
    setTogglingEnderecoId(id)
    await setEnderecoPrincipal(userId, id)
    setTogglingEnderecoId(null)
    refreshEnderecos()
  }

  const handleDeleteEndereco = async (id: number) => {
    if (!userId) return
    setDeletingEnderecoId(id)
    await deleteEndereco(userId, id)
    setDeletingEnderecoId(null)
    refreshEnderecos()
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-primary/40 pointer-events-none" />
          <input
            type="number"
            placeholder="ID do usuário..."
            value={userIdInput}
            onChange={(e) => { setUserIdInput(e.target.value); setGlobalError('') }}
            min={1}
            className="w-full bg-white/5 border border-gold-primary/15 hover:border-gold-primary/30 focus:border-gold-primary/60 rounded-xl pl-9 pr-4 py-2.5 text-cream placeholder-cream/25 text-sm outline-none transition-[border-color] duration-300"
          />
        </div>
        <motion.button
          type="submit"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          disabled={globalLoading}
          className="px-5 py-2.5 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest hover:shadow-gold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
        >
          {globalLoading
            ? <span className="w-3.5 h-3.5 border-2 border-dark-warm/30 border-t-dark-warm rounded-full animate-spin" />
            : <MagnifyingGlassIcon size={14} weight="bold" />
          }
          Buscar
        </motion.button>
      </form>

      {/* Error */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"
          >
            <WarningCircleIcon size={16} weight="fill" className="shrink-0" />
            {globalError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state (no search yet) */}
      {!userId && !globalLoading && !globalError && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center">
            <MagnifyingGlassIcon size={24} className="text-gold-primary/40" />
          </div>
          <p className="type-body text-cream/30 text-sm">
            Informe o ID de um usuário para gerenciar seus contatos e endereços.
          </p>
        </div>
      )}

      {/* User data */}
      <AnimatePresence>
        {userId && !globalLoading && (
          <motion.div
            key={userId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="space-y-5"
          >
            {/* User badge */}
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gold-primary/5 border border-gold-primary/15">
              <div className="w-9 h-9 rounded-full bg-gold-primary/20 border border-gold-primary/30 flex items-center justify-center shrink-0">
                <span className="font-display font-bold text-gold-light text-sm">{userId}</span>
              </div>
              <div>
                <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest">Usuário carregado</p>
                <p className="text-cream/80 text-sm font-body">ID #{userId} · {contatos.length} contato{contatos.length !== 1 ? 's' : ''} · {enderecos.length} endereço{enderecos.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => { setUserId(null); setUserIdInput(''); setContatos([]); setEnderecos([]) }}
                className="ml-auto w-7 h-7 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/40 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200"
              >
                <XIcon size={12} />
              </button>
            </div>

            {/* Section tabs */}
            <div className="flex gap-2">
              {(['contatos', 'enderecos'] as ActiveSection[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className={`px-4 py-2 rounded-full type-overline text-[10px] tracking-widest whitespace-nowrap transition-all duration-300 ${
                    activeSection === s
                      ? 'bg-gradient-gold text-dark-warm font-bold shadow-gold'
                      : 'border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80'
                  }`}
                >
                  {s === 'contatos' ? `Contatos (${contatos.length})` : `Endereços (${enderecos.length})`}
                </button>
              ))}
            </div>

            {/* ── Contatos ── */}
            {activeSection === 'contatos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest">
                    {contatos.length} contato{contatos.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => { setContatoEdit(null); setContatoFormOpen(true) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 text-[10px] type-overline tracking-widest transition-all duration-200"
                  >
                    <PlusIcon size={10} weight="bold" />
                    Adicionar
                  </button>
                </div>

                {contatos.length === 0 ? (
                  <p className="text-cream/25 text-xs font-body italic text-center py-6">Nenhum contato cadastrado.</p>
                ) : (
                  <div className="space-y-2">
                    {contatos.map((c) => (
                      <div key={c.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-200 ${c.isPrincipal ? 'bg-gold-primary/8 border-gold-primary/20' : 'bg-white/3 border-white/5'}`}>
                        <PhoneIcon size={14} className={c.isPrincipal ? 'text-gold-primary shrink-0' : 'text-cream/30 shrink-0'} />
                        <div className="flex-1 min-w-0">
                          <p className="text-cream/80 text-sm font-body">{c.valor}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-cream/40 type-overline text-[8px] tracking-widest">{c.tipo}</span>
                            {c.isPrincipal && (
                              <span className="px-1.5 py-0.5 rounded-full bg-gold-primary/10 text-gold-light type-overline text-[8px] tracking-widest">Principal</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!c.isPrincipal && (
                            <button
                              onClick={() => handleSetContatoPrincipal(c.id)}
                              disabled={togglingContatoId === c.id}
                              title="Definir como principal"
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/30 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200 disabled:opacity-40"
                            >
                              {togglingContatoId === c.id
                                ? <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                                : <StarIcon size={11} />
                              }
                            </button>
                          )}
                          <button
                            onClick={() => { setContatoEdit(c); setContatoFormOpen(true) }}
                            title="Editar"
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/30 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200"
                          >
                            <PencilSimpleIcon size={11} />
                          </button>
                          <button
                            onClick={() => handleDeleteContato(c.id)}
                            disabled={deletingContatoId === c.id}
                            title="Remover"
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-red-500/15 text-cream/25 hover:text-red-400 hover:border-red-500/40 transition-all duration-200 disabled:opacity-40"
                          >
                            {deletingContatoId === c.id
                              ? <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                              : <TrashIcon size={11} />
                            }
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Endereços ── */}
            {activeSection === 'enderecos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest">
                    {enderecos.length} endereço{enderecos.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => { setEnderecoEdit(null); setEnderecoFormOpen(true) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 text-[10px] type-overline tracking-widest transition-all duration-200"
                  >
                    <PlusIcon size={10} weight="bold" />
                    Adicionar
                  </button>
                </div>

                {enderecos.length === 0 ? (
                  <p className="text-cream/25 text-xs font-body italic text-center py-6">Nenhum endereço cadastrado.</p>
                ) : (
                  <div className="space-y-2">
                    {enderecos.map((end) => (
                      <div key={end.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors duration-200 ${end.isPrincipal ? 'bg-gold-primary/8 border-gold-primary/20' : 'bg-white/3 border-white/5'}`}>
                        <MapPinIcon size={14} weight={end.isPrincipal ? 'fill' : 'regular'}
                          className={`shrink-0 mt-0.5 ${end.isPrincipal ? 'text-gold-primary' : 'text-cream/30'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-cream/80 text-sm font-body leading-snug">
                            {end.logradouro}, {end.numero}
                            {end.complemento && ` — ${end.complemento}`}
                          </p>
                          <p className="text-cream/40 text-xs font-body mt-0.5">
                            {end.bairro}, {end.cidade}/{end.estado} · CEP {end.cep}
                          </p>
                          {end.isPrincipal && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gold-primary/10 text-gold-light type-overline text-[8px] tracking-widest">Principal</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!end.isPrincipal && (
                            <button
                              onClick={() => handleSetEnderecoPrincipal(end.id)}
                              disabled={togglingEnderecoId === end.id}
                              title="Definir como principal"
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/30 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200 disabled:opacity-40"
                            >
                              {togglingEnderecoId === end.id
                                ? <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                                : <StarIcon size={11} />
                              }
                            </button>
                          )}
                          <button
                            onClick={() => { setEnderecoEdit(end); setEnderecoFormOpen(true) }}
                            title="Editar"
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/30 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200"
                          >
                            <PencilSimpleIcon size={11} />
                          </button>
                          <button
                            onClick={() => handleDeleteEndereco(end.id)}
                            disabled={deletingEnderecoId === end.id}
                            title="Remover"
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-red-500/15 text-cream/25 hover:text-red-400 hover:border-red-500/40 transition-all duration-200 disabled:opacity-40"
                          >
                            {deletingEnderecoId === end.id
                              ? <span className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                              : <TrashIcon size={11} />
                            }
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ContatoForm
        open={contatoFormOpen}
        initial={contatoEdit}
        loading={contatoFormLoading}
        onSave={handleSaveContato}
        onClose={() => { setContatoFormOpen(false); setContatoEdit(null) }}
      />

      <EnderecoForm
        open={enderecoFormOpen}
        initial={enderecoEdit}
        loading={enderecoFormLoading}
        onSave={handleSaveEndereco}
        onClose={() => { setEnderecoFormOpen(false); setEnderecoEdit(null) }}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { type Loja, type LojaCreateInput } from '../../services/lojas'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

const EMPTY: LojaCreateInput = {
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
}

interface Props {
  open: boolean
  initial?: Loja | null
  loading?: boolean
  onSave: (data: LojaCreateInput) => void
  onClose: () => void
}

export default function StoreForm({ open, initial, loading = false, onSave, onClose }: Props) {
  const [form, setForm] = useState<LojaCreateInput>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              nome: initial.nome,
              cnpj: initial.cnpj,
              telefone: initial.telefone,
              email: initial.email,
            }
          : EMPTY,
      )
      setError('')
    }
  }, [open, initial])

  const set = <K extends keyof LojaCreateInput>(key: K, value: LojaCreateInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return }
    if (!form.cnpj.trim()) { setError('CNPJ é obrigatório.'); return }
    if (!form.telefone.trim()) { setError('Telefone é obrigatório.'); return }
    if (!form.email.trim()) { setError('E-mail é obrigatório.'); return }
    onSave(form)
  }

  const isEdit = !!initial

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="store-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black/75"
            onClick={onClose}
          />
          <motion.div
            key="store-modal"
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
              <div className="flex items-center justify-between px-7 pt-7 pb-5 shrink-0">
                <div>
                  <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">
                    {isEdit ? 'Editar loja' : 'Nova loja'}
                  </p>
                  <h2 className="font-display font-bold text-2xl text-cream leading-tight">
                    {isEdit ? initial!.nome : 'Adicionar loja'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300"
                >
                  <XIcon size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-7 pb-7 overflow-y-auto flex-1 space-y-4">
                <Field label="Nome da loja">
                  <input
                    type="text"
                    placeholder="Ex: Banca Dinei — Centro"
                    value={form.nome}
                    onChange={(e) => set('nome', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="CNPJ">
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={(e) => set('cnpj', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Telefone">
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={form.telefone}
                      onChange={(e) => set('telefone', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="E-mail">
                    <input
                      type="email"
                      placeholder="loja@bancadinei.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-body">
                        <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                      'Criar loja'
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

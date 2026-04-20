import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { type LojaEndereco, type LojaEnderecoInput } from '../../services/lojas'
import { EASE } from '../../lib/motion'


const EMPTY: LojaEnderecoInput = {
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  isPrincipal: false,
}

interface Props {
  open: boolean
  initial?: LojaEndereco | null
  loading?: boolean
  onSave: (data: LojaEnderecoInput) => void
  onClose: () => void
}

export default function AddressForm({ open, initial, loading = false, onSave, onClose }: Props) {
  const [form, setForm] = useState<LojaEnderecoInput>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              logradouro: initial.logradouro,
              numero: initial.numero,
              complemento: initial.complemento ?? '',
              bairro: initial.bairro,
              cidade: initial.cidade,
              estado: initial.estado,
              cep: initial.cep,
              isPrincipal: initial.isPrincipal,
            }
          : EMPTY,
      )
      setError('')
    }
  }, [open, initial])

  const set = <K extends keyof LojaEnderecoInput>(key: K, value: LojaEnderecoInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.logradouro.trim()) { setError('Logradouro é obrigatório.'); return }
    if (!form.numero.trim()) { setError('Número é obrigatório.'); return }
    if (!form.bairro.trim()) { setError('Bairro é obrigatório.'); return }
    if (!form.cidade.trim()) { setError('Cidade é obrigatória.'); return }
    if (!form.estado.trim() || form.estado.length !== 2) { setError('Estado deve ter 2 caracteres (UF).'); return }
    if (!form.cep.trim() || !/^\d{8}$/.test(form.cep.replace(/\D/g, ''))) {
      setError('CEP deve conter 8 dígitos numéricos.')
      return
    }
    onSave({ ...form, cep: form.cep.replace(/\D/g, '') })
  }

  const isEdit = !!initial

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="addr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] bg-black/75"
            onClick={onClose}
          />
          <motion.div
            key="addr-modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-0 z-[81] flex items-center justify-center px-4 py-8 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-7 pt-7 pb-5 shrink-0">
                <div>
                  <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">
                    {isEdit ? 'Editar endereço' : 'Novo endereço'}
                  </p>
                  <h2 className="font-display font-bold text-2xl text-cream leading-tight">
                    {isEdit ? 'Alterar endereço' : 'Adicionar endereço'}
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
                <Field label="Logradouro">
                  <input
                    type="text"
                    placeholder="Rua, Avenida, etc."
                    value={form.logradouro}
                    onChange={(e) => set('logradouro', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Número">
                    <input
                      type="text"
                      placeholder="123 ou S/N"
                      value={form.numero}
                      onChange={(e) => set('numero', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Complemento (opcional)">
                    <input
                      type="text"
                      placeholder="Loja, sala, etc."
                      value={form.complemento ?? ''}
                      onChange={(e) => set('complemento', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Bairro">
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={form.bairro}
                    onChange={(e) => set('bairro', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-[1fr_80px_100px] gap-3">
                  <Field label="Cidade">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={form.cidade}
                      onChange={(e) => set('cidade', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="UF">
                    <input
                      type="text"
                      placeholder="SP"
                      maxLength={2}
                      value={form.estado}
                      onChange={(e) => set('estado', e.target.value.toUpperCase())}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="CEP">
                    <input
                      type="text"
                      placeholder="00000000"
                      maxLength={9}
                      value={form.cep}
                      onChange={(e) => set('cep', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <button
                  type="button"
                  onClick={() => set('isPrincipal', !form.isPrincipal)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 text-sm ${
                    form.isPrincipal
                      ? 'border-gold-primary/40 bg-gold-primary/8 text-gold-light'
                      : 'border-gold-primary/15 bg-white/3 text-cream/50 hover:border-gold-primary/30'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      form.isPrincipal ? 'border-gold-light bg-gold-light' : 'border-cream/30'
                    }`}
                  >
                    {form.isPrincipal && (
                      <span className="w-2 h-2 rounded-sm bg-dark-warm block" />
                    )}
                  </span>
                  <span className="font-body">Endereço principal desta loja</span>
                </button>

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
                      'Adicionar endereço'
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

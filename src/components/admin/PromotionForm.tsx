import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { type Promocao, type PromocaoCreateInput } from '../../services/promocoes'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

const EMPTY: PromocaoCreateInput = {
  nome: '',
  descricao: '',
  tipoDesconto: 'Percentual',
  valorDesconto: 0,
  dataInicio: '',
  dataFim: '',
}

interface Props {
  open: boolean
  initial?: Promocao | null
  loading?: boolean
  onSave: (data: PromocaoCreateInput) => void
  onClose: () => void
}

export default function PromotionForm({ open, initial, loading = false, onSave, onClose }: Props) {
  const [form, setForm] = useState<PromocaoCreateInput>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              nome: initial.nome,
              descricao: initial.descricao ?? '',
              tipoDesconto: initial.tipoDesconto,
              valorDesconto: initial.valorDesconto,
              dataInicio: initial.dataInicio.slice(0, 10),
              dataFim: initial.dataFim.slice(0, 10),
            }
          : EMPTY,
      )
      setError('')
    }
  }, [open, initial])

  const set = <K extends keyof PromocaoCreateInput>(key: K, value: PromocaoCreateInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return }
    if (form.valorDesconto <= 0) { setError('Valor do desconto deve ser maior que zero.'); return }
    if (form.tipoDesconto === 'Percentual' && form.valorDesconto > 100) {
      setError('Desconto percentual não pode exceder 100%.')
      return
    }
    if (!form.dataInicio) { setError('Data de início é obrigatória.'); return }
    if (!form.dataFim) { setError('Data de fim é obrigatória.'); return }
    if (form.dataFim <= form.dataInicio) {
      setError('Data de fim deve ser posterior à data de início.')
      return
    }
    onSave({
      ...form,
      dataInicio: `${form.dataInicio}T00:00:00Z`,
      dataFim: `${form.dataFim}T23:59:59Z`,
    })
  }

  const isEdit = !!initial

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="promo-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black/75"
            onClick={onClose}
          />
          <motion.div
            key="promo-modal"
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
                    {isEdit ? 'Editar promoção' : 'Nova promoção'}
                  </p>
                  <h2 className="font-display font-bold text-2xl text-cream leading-tight">
                    {isEdit ? initial!.nome : 'Adicionar promoção'}
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
                <Field label="Nome da promoção">
                  <input
                    type="text"
                    placeholder="Ex: Semana do Arroz"
                    value={form.nome}
                    onChange={(e) => set('nome', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Descrição (opcional)">
                  <textarea
                    placeholder="Descreva a promoção..."
                    value={form.descricao}
                    onChange={(e) => set('descricao', e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                <Field label="Tipo de desconto">
                  <div className="flex gap-2">
                    {(['Percentual', 'ValorFixo'] as const).map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => set('tipoDesconto', tipo)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-body font-bold transition-all duration-300 ${
                          form.tipoDesconto === tipo
                            ? 'bg-gradient-gold text-dark-warm shadow-gold'
                            : 'border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/70'
                        }`}
                      >
                        {tipo === 'Percentual' ? 'Percentual (%)' : 'Valor Fixo (R$)'}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label={form.tipoDesconto === 'Percentual' ? 'Desconto (%)' : 'Desconto (R$)'}>
                  <input
                    type="number"
                    placeholder="0"
                    min={0.01}
                    max={form.tipoDesconto === 'Percentual' ? 100 : undefined}
                    step={form.tipoDesconto === 'Percentual' ? 0.1 : 0.01}
                    value={form.valorDesconto || ''}
                    onChange={(e) => set('valorDesconto', parseFloat(e.target.value) || 0)}
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Data de início">
                    <input
                      type="date"
                      value={form.dataInicio}
                      onChange={(e) => set('dataInicio', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Data de fim">
                    <input
                      type="date"
                      value={form.dataFim}
                      onChange={(e) => set('dataFim', e.target.value)}
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
                      'Criar promoção'
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

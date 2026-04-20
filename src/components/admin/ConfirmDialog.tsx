import { motion, AnimatePresence } from 'framer-motion'
import { WarningCircleIcon, XIcon } from '@phosphor-icons/react'
import { EASE } from '../../lib/motion'


interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Excluir',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black/75"
            onClick={onCancel}
          />

          <motion.div
            key="confirm-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 z-[71] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold p-7 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-300"
              >
                <XIcon size={14} />
              </button>

              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                  <WarningCircleIcon size={28} weight="fill" className="text-red-400" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl text-cream mb-1">{title}</h3>
                  <p className="type-body text-cream/50 text-sm">{description}</p>
                </div>

                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 py-3 rounded-full border border-gold-primary/30 text-cream/60 hover:border-gold-primary/60 hover:text-cream type-overline tracking-widest text-xs transition-all duration-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-500 text-cream font-body font-bold text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                        Aguarde...
                      </>
                    ) : (
                      confirmLabel
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react'
import { EASE } from '../../lib/motion'

export interface ToastState {
  type: 'success' | 'error'
  message: string
}

interface AdminToastProps {
  toast: ToastState | null
  onDismiss: () => void
}

export function AdminToast({ toast, onDismiss }: AdminToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.3, ease: EASE }}
          className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-body max-w-sm w-full pointer-events-auto ${
            toast.type === 'success'
              ? 'bg-dark-warm border-emerald-500/30'
              : 'bg-dark-warm border-red-500/30'
          }`}
          role="status"
        >
          <span className={`shrink-0 ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {toast.type === 'success'
              ? <CheckCircleIcon size={18} weight="fill" />
              : <WarningCircleIcon size={18} weight="fill" />
            }
          </span>
          <span className={toast.type === 'success' ? 'text-cream/90' : 'text-red-200'}>
            {toast.message}
          </span>
          <button
            onClick={onDismiss}
            className="ml-auto shrink-0 text-cream/30 hover:text-cream/70 transition-colors duration-200"
          >
            <XIcon size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function useAdminToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ type, message })
    timerRef.current = setTimeout(() => setToast(null), 4500)
  }

  const clearToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(null)
  }

  return { toast, showToast, clearToast }
}

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CrownIcon } from '@phosphor-icons/react'
import { EASE } from '../lib/motion'

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6, ease: EASE } }}
      className="min-h-screen bg-dark-warm flex flex-col items-center justify-center gap-6 px-4"
    >
      <CrownIcon size={48} className="text-gold-primary/30" />
      <p className="type-overline text-gold-primary/60">Erro 404</p>
      <h1 className="font-display text-cream text-3xl text-center">Página não encontrada</h1>
      <p className="text-cream/50 text-center max-w-sm text-sm">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="mt-2 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-gold"
      >
        Voltar ao início
      </Link>
    </motion.div>
  )
}

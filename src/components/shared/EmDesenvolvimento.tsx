import { motion } from 'framer-motion'
import { HammerIcon, ArrowLeftIcon } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

interface Props {
  titulo: string
  descricao?: string
}

export default function EmDesenvolvimento({ titulo, descricao }: Props) {
  const navigate = useNavigate()

  return (
    <section className="min-h-screen bg-dark-warm flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-10 shadow-gold"
        >
          <HammerIcon size={42} weight="fill" className="text-dark-warm" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
        >
          <p className="type-overline text-gold-primary tracking-widest mb-3">Em Breve</p>
          <h1 className="type-h1 text-cream mb-5">{titulo}</h1>
          <p className="type-body text-cream/50 leading-relaxed mb-12">
            {descricao ?? 'Estamos preparando algo especial para você. Esta seção estará disponível em breve.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full border border-gold-primary/40 text-cream/70 hover:border-gold-primary hover:text-gold-light transition-all duration-300 type-overline tracking-widest"
            >
              <ArrowLeftIcon size={14} />
              Voltar
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest transition-all duration-300 hover:shadow-gold hover:-translate-y-px"
            >
              Ir para o Início
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 flex items-center gap-4"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold-primary/20" />
          <span className="type-overline text-[9px] text-cream/20 tracking-widest">
            Banca do Dinei · Delicatessen
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold-primary/20" />
        </motion.div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'
import logo from '../../assets/logo.png'
import louvada from '../../assets/cervejaria-louvada.png'

export default function CardapioHeader() {
  return (
    <motion.header
      className="sticky top-0 z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Main header bar — h-16 (64px) */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-3xl mx-auto">

        {/* Cervejaria Louvada — left */}
        <motion.div
          className="flex items-center gap-2 flex-shrink-0"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
        >
          <img
            src={louvada}
            alt="Cervejaria Louvada"
            className="h-10 sm:h-11 w-auto object-contain"
          />
        </motion.div>

        {/* Centre — title */}
        <motion.div
          className="flex flex-col items-center mx-3 min-w-0"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25, ease: EASE }}
        >
          <span
            className="text-[10px] tracking-[5px] uppercase"
            style={{ fontFamily: "'Teko', sans-serif", color: 'rgba(223,166,43,0.60)', lineHeight: 1 }}
          >
            Cardápio
          </span>
          <span
            className="font-display text-[#F5F0E8] leading-none text-center"
            style={{ fontSize: 'clamp(13px, 3vw, 16px)', letterSpacing: '0.10em' }}
          >
            BANCA DO DINEI
          </span>
          <span
            className="text-[9px] tracking-[3px] uppercase mt-0.5 hidden sm:block"
            style={{ fontFamily: "'Teko', sans-serif", color: 'rgba(223,166,43,0.42)' }}
          >
            Delicatessen Premium
          </span>
        </motion.div>

        {/* Banca do Dinei — right */}
        <motion.div
          className="flex items-center gap-2 flex-shrink-0"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
        >
          <div className="rounded-lg p-1" style={{ background: 'rgba(223,166,43,0.08)', border: '1px solid rgba(223,166,43,0.14)' }}>
            <img
              src={logo}
              alt="Banca do Dinei"
              className="h-8 sm:h-9 w-auto object-contain block"
            />
          </div>
        </motion.div>
      </div>

      {/* Shimmer gold border bottom */}
      <div className="relative h-px overflow-hidden" style={{ background: 'rgba(223,166,43,0.12)' }}>
        <motion.div
          className="absolute inset-y-0 w-1/2"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(223,166,43,0.70), transparent)' }}
          initial={{ left: '-50%' }}
          animate={{ left: '150%' }}
          transition={{ duration: 1.8, delay: 0.7, ease: 'easeInOut' }}
        />
        {/* Persistent subtle glow line */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(223,166,43,0.28) 50%, transparent 100%)' }}
        />
      </div>
    </motion.header>
  )
}

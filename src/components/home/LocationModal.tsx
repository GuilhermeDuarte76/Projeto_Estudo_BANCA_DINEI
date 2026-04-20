import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XIcon,
  MapPinIcon,
  NavigationArrowIcon,
  ArrowSquareOutIcon,
  CrownIcon,
  StorefrontIcon,
} from '@phosphor-icons/react'
import { EASE } from '../../lib/motion'


const LOCATIONS = [
  {
    id: 'principal',
    tab: 'Unidade Principal',
    subtitle: 'Centro · Uberlândia, MG',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.615675851807!2d-48.272444513794895!3d-18.904123561442542!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94a445a59430bb93%3A0x54d77024b2e67312!2sBanca%20do%20Dinei%20Uberl%C3%A2ndia!5e0!3m2!1spt-BR!2sbr!4v1776312419824!5m2!1spt-BR!2sbr',
    openUrl: 'https://maps.google.com/maps?q=Banca+do+Dinei+Uberl%C3%A2ndia',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Banca+do+Dinei+Uberl%C3%A2ndia',
    description: 'Nossa loja principal com curadoria completa de frios, tábuas artesanais, vinhos e doces selecionados.',
  },
  {
    id: 'santa-monica',
    tab: 'Santa Mônica',
    subtitle: 'Santa Mônica · Uberlândia, MG',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.2054002298187!2d-48.25162622388065!3d-18.922300407723828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94a44584a54d64db%3A0x70bca42e1a5f5640!2sBanca%20do%20Dinei%20Uberl%C3%A2ndia%20-%20Unidade%20Santa%20M%C3%B4nica!5e0!3m2!1spt-BR!2sbr!4v1776312437551!5m2!1spt-BR!2sbr',
    openUrl: 'https://maps.google.com/maps?q=Banca+do+Dinei+Uberl%C3%A2ndia+Unidade+Santa+Monica',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Banca+do+Dinei+Uberl%C3%A2ndia+Unidade+Santa+Monica',
    description: 'Unidade do bairro Santa Mônica, com a mesma qualidade e experiência premium da Banca do Dinei.',
  },
]

interface LocationModalProps {
  open: boolean
  onClose: () => void
}

export default function LocationModal({ open, onClose }: LocationModalProps) {
  const [activeTab, setActiveTab] = useState(0)
  // Track loaded state per map index — never resets, so no skeleton flash on revisit
  const [loadedMaps, setLoadedMaps] = useState<Record<number, boolean>>({})

  const markLoaded = useCallback((i: number) => {
    setLoadedMaps(prev => (prev[i] ? prev : { ...prev, [i]: true }))
  }, [])

  // Reset tab after close animation completes
  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => {
        setActiveTab(0)
        setLoadedMaps({})
      }, 350)
      return () => clearTimeout(id)
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const loc = LOCATIONS[activeTab]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="loc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[85] bg-black/75"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="loc-modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{ willChange: 'transform, opacity' }}
            className="fixed inset-0 z-[86] flex items-center justify-center px-4 py-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto bg-dark-warm border border-gold-primary/25 rounded-3xl shadow-gold pointer-events-auto"
              style={{ scrollbarWidth: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Top glow line */}
              <div
                className="absolute inset-x-0 top-0 h-px rounded-t-3xl pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(184,134,11,0.55) 50%, transparent 90%)' }}
              />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 transition-[color,border-color] duration-200 z-10"
                aria-label="Fechar"
              >
                <XIcon size={14} />
              </button>

              {/* Header */}
              <div className="px-6 sm:px-7 pt-7 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <CrownIcon size={11} weight="fill" className="text-gold-primary/50" />
                  <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest uppercase">
                    Banca do Dinei · Uberlândia
                  </p>
                </div>
                <h2 className="font-display font-bold text-2xl text-cream leading-tight">
                  Nossas Unidades
                </h2>
                <p className="font-body text-cream/40 text-xs mt-1 leading-relaxed">
                  Encontre a loja mais próxima de você.
                </p>
              </div>

              {/* Tabs — indicador animado com layoutId (spring) */}
              <div className="flex px-6 sm:px-7 gap-1.5 mb-5">
                {LOCATIONS.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => setActiveTab(i)}
                    className="relative flex-1 py-2.5 rounded-xl overflow-hidden"
                  >
                    {activeTab === i && (
                      <motion.span
                        layoutId="loc-tab-pill"
                        className="absolute inset-0 bg-gradient-gold rounded-xl"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                    {activeTab !== i && (
                      <span className="absolute inset-0 rounded-xl border border-gold-primary/15 transition-[border-color] duration-200 hover:border-gold-primary/35" />
                    )}
                    <span
                      className={`relative z-10 type-overline text-[10px] tracking-widest transition-colors duration-200 ${
                        activeTab === i ? 'text-dark-warm font-bold' : 'text-cream/40 hover:text-cream/70'
                      }`}
                    >
                      {l.tab}
                    </span>
                  </button>
                ))}
              </div>

              {/* Maps — ambos sempre montados; troca via opacidade CSS (sem reload) */}
              <div className="mx-6 sm:mx-7 rounded-2xl overflow-hidden border border-gold-primary/20 relative bg-dark-warm/60" style={{ height: 240 }}>
                {LOCATIONS.map((l, i) => (
                  <div
                    key={l.id}
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{ opacity: activeTab === i ? 1 : 0, pointerEvents: activeTab === i ? 'auto' : 'none' }}
                  >
                    {/* Skeleton — só aparece antes do primeiro load deste mapa */}
                    {!loadedMaps[i] && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-dark-warm/85">
                        <div className="w-7 h-7 border-2 border-gold-primary/30 border-t-gold-primary rounded-full animate-spin" />
                        <span className="type-overline text-cream/30 text-[10px] tracking-widest">
                          Carregando mapa…
                        </span>
                      </div>
                    )}
                    <iframe
                      src={l.mapSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Mapa — ${l.tab}`}
                      onLoad={() => markLoaded(i)}
                    />
                  </div>
                ))}
              </div>

              {/* Detalhes da unidade — popLayout: sai do fluxo imediatamente, entrada sem esperar */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="px-6 sm:px-7 pt-5 pb-6"
                >
                  {/* Info card */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-gold-primary/10 mb-4">
                    <div className="w-9 h-9 rounded-full bg-gold-primary/10 border border-gold-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                      <StorefrontIcon size={16} weight="fill" className="text-gold-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-cream text-base leading-snug">
                        {loc.tab}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 mb-2">
                        <MapPinIcon size={11} weight="fill" className="text-gold-primary/60 shrink-0" />
                        <p className="type-overline text-gold-light/60 text-[10px] tracking-widest">
                          {loc.subtitle}
                        </p>
                      </div>
                      <p className="font-body text-cream/45 text-xs leading-relaxed">
                        {loc.description}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gold-primary/10 mb-4" />

                  {/* Ações */}
                  <div className="flex gap-2.5">
                    <a
                      href={loc.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest px-4 py-3 rounded-full transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-gold active:scale-[0.98] text-[11px]"
                    >
                      <NavigationArrowIcon size={13} weight="fill" />
                      Como Chegar
                    </a>
                    <a
                      href={loc.openUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 border border-gold-primary/40 text-gold-light font-body font-bold uppercase tracking-widest px-4 py-3 rounded-full transition-[transform,border-color,color] duration-200 hover:border-gold-light hover:-translate-y-0.5 active:scale-[0.98] text-[11px]"
                    >
                      <ArrowSquareOutIcon size={13} weight="fill" />
                      Ver no Maps
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

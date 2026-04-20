import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, WineIcon, CheeseIcon, LeafIcon } from '@phosphor-icons/react';
import { HARMONIZACOES } from '../../data/tabuas';
import { EASE } from '../../lib/motion'


const WINE_ICONS: Record<string, React.ElementType> = {
  rose: WineIcon,
  branco: LeafIcon,
  tinto: CheeseIcon,
};

const WINE_COLORS: Record<string, { bg: string; icon: string; border: string; badge: string }> = {
  rose: {
    bg: 'from-[#C8627A]/20 to-[#C8627A]/5',
    icon: 'text-[#C8627A]',
    border: 'border-[#C8627A]/30',
    badge: 'bg-[#C8627A]/15 text-[#C8627A] border-[#C8627A]/30',
  },
  branco: {
    bg: 'from-gold-light/20 to-gold-light/5',
    icon: 'text-gold-light',
    border: 'border-gold-light/30',
    badge: 'bg-gold-primary/15 text-gold-light border-gold-light/30',
  },
  tinto: {
    bg: 'from-bordeaux/30 to-bordeaux/10',
    icon: 'text-bordeaux',
    border: 'border-bordeaux/30',
    badge: 'bg-bordeaux/15 text-bordeaux border-bordeaux/30',
  },
};

interface HarmonizacoesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HarmonizacoesModal({ isOpen, onClose }: HarmonizacoesModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — sem backdrop-blur para evitar custo de GPU */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-x-4 top-[6%] bottom-[6%] z-50 mx-auto max-w-3xl rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #1A0606 0%, #0F0404 100%)',
              willChange: 'transform, opacity',
            }}
          >
            {/* Gold accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.6) 40%, rgba(184,134,11,0.3) 70%, transparent 100%)' }}
            />

            {/* Fixed header */}
            <div className="flex-shrink-0 px-7 pt-8 pb-5 lg:px-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="type-overline text-gold-primary text-[10px] mb-2.5">Guia de sabores</p>
                  <h2 className="type-h2 text-cream leading-tight">
                    Harmonizações{' '}
                    <span className="font-subtitle italic font-normal text-gold-light">perfeitas</span>
                  </h2>
                  <p className="type-body text-cream/40 mt-2 text-sm leading-relaxed max-w-[44ch]">
                    Combinações ideais entre nossos vinhos e as tábuas artesanais.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-cream/50 hover:text-cream hover:bg-white/10 transition-all duration-200"
                  aria-label="Fechar"
                >
                  <XIcon size={14} weight="bold" />
                </button>
              </div>

              <div
                className="mt-6 h-px"
                style={{ background: 'linear-gradient(90deg, rgba(184,134,11,0.25), transparent)' }}
              />
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-7 pb-8 lg:px-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {HARMONIZACOES.map((item, i) => {
                  const Icon = WINE_ICONS[item.icon] || WineIcon;
                  const colors = WINE_COLORS[item.icon];

                  return (
                    <div
                      key={item.vinho}
                      className={`p-px rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} animate-fade-in-up`}
                      style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                    >
                      <div className="rounded-[calc(1rem-1px)] bg-black/25 p-5 flex flex-col gap-4 h-full">
                        {/* Icon + title */}
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border ${colors.border} flex items-center justify-center bg-white/5 flex-shrink-0`}>
                            <Icon size={20} weight="light" className={colors.icon} />
                          </div>
                          <div>
                            <p className="type-overline text-[9px] text-cream/35 mb-0.5">Harmoniza com</p>
                            <h3 className="type-h3 text-cream text-sm">{item.vinho}</h3>
                          </div>
                        </div>

                        {/* Pairings */}
                        <div className="flex flex-col gap-1.5">
                          {item.harmoniza.map((h) => (
                            <div
                              key={h}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${colors.badge}`}
                            >
                              <div className="w-1 h-1 rounded-full bg-current flex-shrink-0 opacity-60" />
                              <span className="type-body text-[12px] font-body">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/8" />
                <p className="type-caption not-italic text-[11px] text-cream/30 text-center flex-shrink-0">
                  Informe o estilo desejado — sugerimos a tábua ideal.
                </p>
                <div className="flex-1 h-px bg-white/8" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

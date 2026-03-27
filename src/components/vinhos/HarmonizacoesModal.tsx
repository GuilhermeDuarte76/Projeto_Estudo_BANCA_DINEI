import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, WineIcon, CheeseIcon, LeafIcon } from '@phosphor-icons/react';
import { HARMONIZACOES } from '../../data/tabuas';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] z-50 mx-auto max-w-4xl overflow-y-auto rounded-3xl"
            style={{ background: 'linear-gradient(180deg, #1E0808 0%, #0F0404 100%)' }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="sticky top-4 left-full -translate-x-10 z-10 w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-cream/70 hover:text-cream hover:bg-white/20 transition-all duration-200"
              aria-label="Fechar"
            >
              <XIcon size={16} weight="bold" />
            </button>

            <div className="px-6 pt-2 pb-10 lg:px-10">
              {/* Header */}
              <div className="text-center mb-10">
                <p className="type-overline text-gold-primary text-[11px] mb-4">Guia de sabores</p>
                <h2 className="type-h1 text-cream">
                  Harmonizações<br />
                  <span className="font-subtitle italic font-normal text-gold-light">perfeitas</span>
                </h2>
                <p className="type-body text-cream/50 mt-4 mx-auto max-w-[52ch] leading-relaxed text-sm">
                  Descubra as combinações ideais entre nossos vinhos e as tábuas artesanais para elevar sua experiência à mesa.
                </p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {HARMONIZACOES.map((item, i) => {
                  const Icon = WINE_ICONS[item.icon] || WineIcon;
                  const colors = WINE_COLORS[item.icon];

                  return (
                    <motion.div
                      key={item.vinho}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                    >
                      <div className={`p-1.5 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-[2rem] h-full`}>
                        <div className="rounded-[calc(2rem-0.375rem)] bg-white/5 p-7 flex flex-col gap-5 h-full">
                          <div className={`w-12 h-12 rounded-2xl border ${colors.border} flex items-center justify-center bg-white/10`}>
                            <Icon size={24} weight="light" className={colors.icon} />
                          </div>

                          <div>
                            <p className="type-overline text-gold-primary text-[10px] mb-1.5">Harmoniza com</p>
                            <h3 className="type-h3 text-cream">{item.vinho}</h3>
                          </div>

                          <div className="flex flex-col gap-2">
                            {item.harmoniza.map((h) => (
                              <div
                                key={h}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${colors.badge}`}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                                <span className="type-body text-sm font-body">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <p className="type-caption text-cream/40 not-italic text-sm text-center mt-10">
                Dica: ao fazer seu pedido, informe o estilo de vinho desejado e sugerimos a tábua ideal para você.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

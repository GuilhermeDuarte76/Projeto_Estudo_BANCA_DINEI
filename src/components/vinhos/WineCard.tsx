import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, CheckIcon } from '@phosphor-icons/react';
import { type Wine } from '../../data/wines';
import { useCart } from '../../context/CartContext';
import { EASE } from '../../lib/motion'

const WINE_TYPE_DOTS: Record<string, string> = {
  Tinto:     'bg-bordeaux',
  Branco:    'bg-cream/70',
  Rosé:      'bg-rose-300',
  Espumante: 'bg-gold-light',
  Porto:     'bg-purple-700',
};

function getTypeDot(type: string): string {
  for (const [keyword, dot] of Object.entries(WINE_TYPE_DOTS)) {
    if (type.includes(keyword)) return dot;
  }
  return 'bg-cream/30';
}

export function FlagImg({ code, country }: { code: string; country: string }) {
  return (
    <img
      src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/40x30/${code.toLowerCase()}.png 2x`}
      width={20}
      height={15}
      alt={country}
      title={country}
      className="rounded-[2px] object-cover flex-shrink-0"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}

interface WineCardProps {
  wine: Wine;
  index: number;
}

export default function WineCard({ wine, index }: WineCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const isEspecial = wine.tier === 'especial';
  const dotClass = getTypeDot(wine.type);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: `vinho-${wine.name}`,
      name: wine.name,
      subtitle: wine.type,
      price: wine.price,
      category: 'vinho',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: EASE }}
      className="group relative"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl z-[1] pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${isEspecial ? 'rgba(200,160,74,0.55)' : 'rgba(200,160,74,0.3)'}, transparent)`,
        }}
      />
      <div
        className={`flex flex-col rounded-xl border overflow-hidden transition-all duration-300 ${
          isEspecial
            ? 'border-gold-light/25 bg-gold-primary/[0.07] hover:border-gold-light/45'
            : 'border-gold-light/20 bg-white/[0.04] hover:border-gold-light/45'
        }`}
      >
        {/* Image or dark header */}
        {wine.imagemUrl ? (
          <div className="relative overflow-hidden h-[180px] flex-shrink-0">
            <img
              src={wine.imagemUrl}
              alt={wine.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(15,4,4,0.92) 0%, rgba(15,4,4,0.4) 45%, transparent 75%)',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
              <p className="font-body text-gold-light/60 text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
                {wine.type}
              </p>
              <p className="font-display font-bold text-cream/90 text-base leading-tight line-clamp-2">
                {wine.name}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="relative px-4 pt-6 pb-5 flex-shrink-0"
            style={{
              background: isEspecial
                ? 'linear-gradient(135deg, rgba(184,134,11,0.10) 0%, rgba(184,134,11,0.03) 60%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(184,134,11,0.05) 0%, transparent 60%)',
            }}
          >
            <p className="font-body text-gold-light/50 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
              {wine.type}
            </p>
            <p className="font-display font-bold text-cream/90 text-base leading-snug line-clamp-2">
              {wine.name}
            </p>
          </div>
        )}

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Country */}
          <div className="flex items-center gap-2">
            <FlagImg code={wine.countryCode} country={wine.country} />
            <span className="font-body text-cream/50 text-xs">{wine.country}</span>
          </div>

          <div className="h-px bg-white/[0.07] mt-auto" />

          {/* Pricing + button */}
          <div className="flex items-center justify-between gap-3">
            <p className="font-display font-bold text-gold-light text-xl leading-none">
              R$ {wine.price.toFixed(2).replace('.', ',')}
            </p>

            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 font-body text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap ${
                added
                  ? 'border-gold-light/50 bg-gold-primary/20 text-gold-light'
                  : 'border-gold-light/25 text-gold-light/60 hover:border-gold-light/55 hover:bg-gold-primary/10 hover:text-gold-light'
              }`}
              aria-label={`Adicionar ${wine.name} ao carrinho`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1"
                  >
                    <CheckIcon size={11} weight="bold" />
                    Adicionado
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1"
                  >
                    <ShoppingCartIcon size={11} weight="fill" />
                    Adicionar
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Tier badge */}
          <span
            className={`type-overline text-[9px] px-2 py-0.5 rounded-full border self-start ${
              isEspecial
                ? 'border-gold-light/30 text-gold-light/75'
                : 'border-white/10 text-cream/30'
            }`}
          >
            {isEspecial ? '★ Especial' : 'Dia a dia'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

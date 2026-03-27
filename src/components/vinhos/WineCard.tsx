import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { StarIcon, ShoppingCartIcon, CheckIcon } from '@phosphor-icons/react';
import { type Wine } from '../../data/wines';
import { useCart } from '../../context/CartContext';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

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
      <div className={`rounded-xl border transition-all duration-300 ${
        isEspecial
          ? 'border-gold-light/25 bg-gold-primary/[0.07] hover:border-gold-light/50'
          : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.16]'
      }`}>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            {isEspecial && (
              <StarIcon size={9} weight="fill" className="text-gold-light flex-shrink-0 mt-0.5" />
            )}
            <p className="font-display font-bold text-cream/90 text-[13px] leading-snug line-clamp-2 flex-1">
              {wine.name}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
            <p className="text-cream/45 text-[11px] leading-snug line-clamp-1 font-body">
              {wine.type}
            </p>
          </div>

          <div className="h-px bg-white/[0.07]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FlagImg code={wine.countryCode} country={wine.country} />
              <span className="font-body text-[10px] text-cream/35 tracking-widest uppercase">
                {wine.countryCode}
              </span>
            </div>
            <p className="font-display font-bold text-gold-light text-sm">
              R$ {wine.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className={`type-overline text-[9px] px-2 py-0.5 rounded-full border ${
              isEspecial
                ? 'border-gold-light/30 text-gold-light/75'
                : 'border-white/10 text-cream/30'
            }`}>
              {isEspecial ? '★ Especial' : 'Dia a dia'}
            </span>

            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-1 type-overline text-[9px] px-2.5 py-1.5 rounded-full border transition-all duration-300 ${
                added
                  ? 'border-gold-light/50 bg-gold-primary/20 text-gold-light'
                  : 'border-white/10 text-cream/40 hover:border-gold-primary/40 hover:text-gold-light hover:bg-gold-primary/10'
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
                    <CheckIcon size={9} weight="bold" />
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
                    <ShoppingCartIcon size={9} weight="fill" />
                    Adicionar
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { CrownIcon, PlusIcon, ShoppingCartIcon, CheckIcon } from '@phosphor-icons/react';
import { type Tabua } from '../../data/tabuas';
import { useCart } from '../../context/CartContext';
import { EASE } from '../../lib/motion'


interface TabuaCardProps {
  tabua: Tabua;
  index: number;
  scrollImages?: string[];
}

export default function TabuaCard({ tabua, index, scrollImages }: TabuaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [addedSizeId, setAddedSizeId] = useState<string | null>(null);
  const prevImgIndex = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { scrollY } = useScroll();
  const { addItem } = useCart();

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (!scrollImages) return;
    const next = Math.floor(y / 400) % scrollImages.length;
    if (next !== prevImgIndex.current) {
      prevImgIndex.current = next;
      setImgIndex(next);
    }
  });

  const currentImage = scrollImages ? scrollImages[imgIndex] : tabua.image;
  const firstSize = tabua.sizes[0];
  const hasMultipleSizes = tabua.sizes.length > 1;

  const handleAddSize = (sizeLabel: string, sizeWeight: string, price: number) => {
    const sizeId = `${sizeLabel}-${sizeWeight}`;
    addItem({
      id: `tabua-${tabua.name}-${sizeLabel}`,
      name: tabua.name,
      subtitle: `${sizeLabel} · ${sizeWeight}`,
      price,
      category: 'tabua',
    });
    setAddedSizeId(sizeId);
    setTimeout(() => setAddedSizeId(null), 1500);
  };

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: EASE }}
      className="group relative h-full"
    >
      <div className="h-full p-1 bg-cream border border-gold-primary/30 rounded-2xl transition-all duration-500 group-hover:border-gold-primary/60 group-hover:shadow-gold-hover">
        <div
          className="h-full flex flex-col rounded-[calc(1rem-0.25rem)] overflow-hidden bg-cream"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)' }}
        >
          {/* Image */}
          <div className="relative overflow-hidden h-40">
            <AnimatePresence mode="sync">
              <motion.img
                key={currentImage}
                src={currentImage}
                alt={tabua.name}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                loading="lazy"
              />
            </AnimatePresence>
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(26,10,0,0.6) 0%, transparent 60%)' }}
            />
            {tabua.featured && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gradient-gold text-dark-warm px-3 py-1.5 rounded-full">
                <CrownIcon size={10} weight="fill" />
                <span className="type-overline text-[9px]">Destaque</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <p className="font-display font-bold text-cream text-xl leading-tight">{tabua.name}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col gap-3 flex-1">
            <p className="type-body text-graphite/70 text-sm leading-snug">{tabua.description}</p>

            <div>
              <p className="type-overline text-gold-primary text-[10px] mb-2">Ingredientes</p>
              <div className="flex flex-wrap gap-1">
                {tabua.ingredients.slice(0, expanded ? undefined : 4).map((ing) => (
                  <span
                    key={ing}
                    className="text-[11px] font-body bg-beige border border-gold-primary/20 text-graphite px-2 py-0.5 rounded-full"
                  >
                    {ing}
                  </span>
                ))}
                {!expanded && tabua.ingredients.length > 4 && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="text-[11px] font-body font-bold text-gold-primary flex items-center gap-1 hover:gap-1.5 transition-all duration-200"
                  >
                    <PlusIcon size={10} weight="bold" />
                    {tabua.ingredients.length - 4} mais
                  </button>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-gold-primary/20 pt-3">
              {hasMultipleSizes ? (
                <div>
                  <p className="type-overline text-gold-primary text-[10px] mb-2">Tamanhos & preços</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {tabua.sizes.map((size) => {
                      const sizeId = `${size.label}-${size.weight}`;
                      const isAdded = addedSizeId === sizeId;
                      return (
                        <div
                          key={size.label}
                          className="bg-dark-warm/5 rounded-xl p-2.5 border border-gold-primary/10 flex flex-col gap-1"
                        >
                          <p className="type-overline text-graphite text-[10px]">{size.serves || size.label}</p>
                          <p className="font-subtitle text-graphite/60 text-[11px]">{size.weight}</p>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="font-display font-bold text-gold-primary text-sm">
                              R$ {size.price.toFixed(2)}
                            </p>
                            <button
                              onClick={() => handleAddSize(size.label, size.weight, size.price)}
                              className={`flex items-center gap-1 type-overline text-[9px] px-2 py-1 rounded-full border transition-all duration-300 ${
                                isAdded
                                  ? 'border-gold-primary/50 bg-gold-primary/15 text-gold-primary'
                                  : 'border-gold-primary/20 text-graphite/40 hover:border-gold-primary/60 hover:text-gold-primary hover:bg-gold-primary/10'
                              }`}
                              aria-label={`Adicionar ${tabua.name} tamanho ${size.label}`}
                            >
                              <AnimatePresence mode="wait">
                                {isAdded ? (
                                  <motion.span
                                    key="check"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.18 }}
                                  >
                                    <CheckIcon size={9} weight="bold" />
                                  </motion.span>
                                ) : (
                                  <motion.span
                                    key="plus"
                                    initial={{ scale: 0.7 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.7 }}
                                    transition={{ duration: 0.18 }}
                                  >
                                    <PlusIcon size={9} weight="bold" />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="type-overline text-gold-primary text-[10px]">{firstSize.label}</p>
                    <p className="type-caption text-graphite/50 not-italic">{firstSize.weight}</p>
                  </div>
                  <p className="font-display font-bold text-gold-primary text-2xl">
                    R$ {firstSize.price.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* CTA — para tábua de tamanho único */}
            {!hasMultipleSizes && (() => {
              const sizeId = `${firstSize.label}-${firstSize.weight}`;
              const isAdded = addedSizeId === sizeId;
              return (
                <button
                  onClick={() => handleAddSize(firstSize.label, firstSize.weight, firstSize.price)}
                  className={`mt-auto flex items-center justify-center gap-2 font-body font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-full transition-all duration-300 active:scale-[0.98] ${
                    isAdded
                      ? 'bg-gold-primary/15 border border-gold-primary/40 text-gold-primary'
                      : 'bg-gradient-gold text-dark-warm hover:-translate-y-px hover:shadow-gold'
                  }`}
                  aria-label={`Adicionar ${tabua.name} ao carrinho`}
                >
                  <AnimatePresence mode="wait">
                    {isAdded ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                      >
                        <CheckIcon size={14} weight="bold" />
                        Adicionado ao carrinho
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCartIcon size={14} weight="fill" />
                        Adicionar ao carrinho
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
import { CrownIcon, UsersIcon, WhatsappLogoIcon, PackageIcon, PlusIcon } from '@phosphor-icons/react';
import { TABUAS, EMBALAGENS, type Tabua } from '../data/tabuas';
import mantaBufalaAberta from '../assets/mantaBufalaAberta.png';
import caprese from '../assets/caprese.png';
import mantaBufalaFechada from '../assets/mantaBufalaFechada.png';
import taboaFrios from '../assets/taboaFrios.jpg';
import frios from '../assets/frios.jpg';
import SectionDivider from './SectionDivider';

function TabuaCard({ tabua, index, scrollImages }: { tabua: Tabua; index: number; scrollImages?: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const prevImgIndex = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { scrollY } = useScroll();

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

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: EASE }}
      className="group relative h-full"
    >
      {/* Outer shell */}
      <div className="h-full p-1 bg-cream border border-gold-primary/30 rounded-2xl transition-all duration-500 group-hover:border-gold-primary/60 group-hover:shadow-gold-hover">
        {/* Inner core */}
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

            {/* Ingredients preview */}
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
                    {tabua.sizes.map((size) => (
                      <div
                        key={size.label}
                        className="bg-dark-warm/5 rounded-xl p-2.5 border border-gold-primary/10"
                      >
                        <p className="type-overline text-graphite text-[10px]">{size.serves || size.label}</p>
                        <p className="font-subtitle text-graphite/60 text-[11px]">{size.weight}</p>
                        <p className="font-display font-bold text-gold-primary text-sm mt-1">
                          R$ {size.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
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

            {/* CTA */}
            <a
              href={`https://wa.me/5534321220099?text=Ol%C3%A1!%20Gostaria%20de%20pedir%20a%20${encodeURIComponent(tabua.name)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-gold active:scale-[0.98]"
            >
              <WhatsappLogoIcon size={14} weight="fill" />
              Pedir agora
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function TabuasDestaque() {
  const [showEmbalagens, setShowEmbalagens] = useState(false);

  return (
    <section id="tabuas" className="bg-beige py-16 px-6 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 mb-10"
        >
          <div>
            <p className="type-overline text-gold-primary mb-4">Nosso cardápio</p>
            <h2 className="type-h1 text-graphite">
              Tábuas em<br />
              <span className="font-subtitle italic font-normal text-bordeaux">destaque</span>
            </h2>
          </div>
          <button
            onClick={() => setShowEmbalagens(!showEmbalagens)}
            className="flex items-center gap-2 border border-gold-primary/40 text-gold-primary font-body font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-full transition-all duration-300 hover:border-gold-primary hover:shadow-gold self-start"
          >
            <PackageIcon size={14} />
            Embalagens
          </button>
        </motion.div>

        {/* Embalagens panel */}
        <AnimatePresence>
          {showEmbalagens && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden mb-10"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-cream border border-gold-primary/20 rounded-2xl">
                {EMBALAGENS.map((emb) => (
                  <div key={emb.tipo} className="text-center p-4">
                    <PackageIcon size={20} weight="light" className="text-gold-primary mx-auto mb-2" />
                    <p className="font-body font-bold text-graphite text-sm">{emb.tipo}</p>
                    <p className="type-caption text-graphite/60 not-italic text-xs mt-1">{emb.detalhe}</p>
                    <p className="font-display font-bold text-gold-primary text-sm mt-2">
                      {emb.adicional === 0 ? 'Incluso' : `+R$ ${emb.adicional},00`}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SectionDivider className="mb-10 -mt-2" />

        {/* Tábuas grid — asymmetric DESIGN_VARIANCE: 8 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr] gap-4">
          {/* Wide featured card */}
          <div className="md:col-span-2 lg:col-span-2 h-full">
            <TabuaCard tabua={TABUAS[0]} index={0} scrollImages={[taboaFrios, frios]} />
          </div>
          <div className="lg:col-span-1 h-full">
            <TabuaCard tabua={{ ...TABUAS[1], image: caprese }} index={1} />
          </div>
          <div className="lg:col-span-1 h-full">
            <TabuaCard tabua={{ ...TABUAS[2], image: mantaBufalaAberta }} index={2} />
          </div>
          <div className="md:col-span-2 lg:col-span-2 h-full">
            <TabuaCard tabua={{ ...TABUAS[3], image: mantaBufalaFechada }} index={3} />
          </div>

          {/* Monte sua tábua card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            className="md:col-span-2 lg:col-span-2"
          >
            <div className="h-full p-1 bg-gradient-wine border border-gold-light/30 rounded-2xl">
              <div
                className="h-full rounded-[calc(1rem-0.25rem)] bg-bordeaux-deep p-5 lg:p-7 flex flex-col justify-between min-h-[200px]"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <UsersIcon size={24} weight="light" className="text-gold-light" />
                    <span className="type-overline text-gold-light/70 text-[11px]">Personalizado</span>
                  </div>
                  <h3 className="type-h2 text-cream mb-3">Monte sua Tábua</h3>
                  <p className="type-body text-cream/60 text-sm leading-relaxed max-w-[40ch]">
                    Escolha a quantidade de pessoas, o tipo de bandeja e os produtos do catálogo. Sob orçamento.
                  </p>
                </div>
                <a
                  href="https://wa.me/5534321220099?text=Ol%C3%A1!%20Gostaria%20de%20montar%20uma%20t%C3%A1bua%20personalizada."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start flex items-center gap-2 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-gold mt-4"
                >
                  <WhatsappLogoIcon size={14} weight="fill" />
                  Solicitar orçamento
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

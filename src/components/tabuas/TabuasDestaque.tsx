import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UsersIcon, WhatsappLogoIcon, PackageIcon } from '@phosphor-icons/react';
import { TABUAS, EMBALAGENS } from '../../data/tabuas';
import mantaBufalaAberta from '../../assets/mantaBufalaAberta.png';
import caprese from '../../assets/caprese.png';
import mantaBufalaFechada from '../../assets/mantaBufalaFechada.png';
import taboaFrios from '../../assets/taboaFrios.jpg';
import frios from '../../assets/frios.jpg';
import SectionDivider from '../layout/SectionDivider';
import TabuaCard from './TabuaCard';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export default function TabuasDestaque() {
  const [showEmbalagens, setShowEmbalagens] = useState(false);

  return (
    <section id="tabuas" className="bg-beige pt-28 pb-16 px-6 lg:px-16">
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

        {/* Tábuas grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr] gap-4">
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
                  href="https://wa.me/5534321220099?text=Ol%C3%A1!%20Vi%20as%20t%C3%A1buas%20no%20site%20da%20Banca%20do%20Dinei%20e%20gostaria%20de%20montar%20uma%20t%C3%A1bua%20personalizada."
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

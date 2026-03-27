import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CheeseIcon } from '@phosphor-icons/react';
import { TABUAS } from '../../data/tabuas';
import caprese from '../../assets/caprese.png';
import taboaFrios from '../../assets/taboaFrios.jpg';
import frios from '../../assets/frios.jpg';
import SectionDivider from '../layout/SectionDivider';
import TabuaCard from '../tabuas/TabuaCard';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export default function TabuasPreview() {
  const navigate = useNavigate();

  return (
    <section className="bg-beige py-20 px-6 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheeseIcon size={18} weight="light" className="text-gold-primary" />
              <p className="type-overline text-gold-primary text-[11px]">Nosso cardápio</p>
            </div>
            <h2 className="type-h1 text-graphite">
              Tábuas em<br />
              <span className="font-subtitle italic font-normal text-bordeaux">destaque</span>
            </h2>
          </div>

          <button
            onClick={() => { navigate('/tabuas'); window.scrollTo({ top: 0 }); }}
            className="group self-start sm:self-end flex items-center gap-3 border border-gold-primary/50 text-gold-primary font-body font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-full transition-all duration-300 hover:bg-gold-primary hover:text-dark-warm hover:border-gold-primary"
          >
            Ver cardápio completo
            <ArrowRightIcon
              size={13}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </motion.div>

        <SectionDivider className="mb-10 -mt-2" />

        {/* Grid — 2 tábuas em destaque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <TabuaCard tabua={TABUAS[0]} index={0} scrollImages={[taboaFrios, frios]} />
          <TabuaCard tabua={{ ...TABUAS[1], image: caprese }} index={1} />
        </div>

        {/* CTA bottom */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="flex justify-center"
        >
          <button
            onClick={() => { navigate('/tabuas'); window.scrollTo({ top: 0 }); }}
            className="group flex items-center gap-3 bg-graphite text-cream font-body font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full transition-all duration-300 hover:bg-dark-warm hover:-translate-y-px"
          >
            Ver todas as tábuas
            <ArrowRightIcon
              size={13}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

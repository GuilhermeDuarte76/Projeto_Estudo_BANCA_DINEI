import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WineIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { WINES } from '../../data/wines';
import SectionDivider from '../layout/SectionDivider';
import WineCard from '../vinhos/WineCard';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

// Seleciona 8 vinhos variados: mix de países e tipos
const PREVIEW_WINES = [
  ...WINES.filter(w => w.tier === 'especial').slice(0, 4),
  ...WINES.filter(w => w.tier === 'dia').slice(0, 4),
];

export default function VinhosPreview() {
  const navigate = useNavigate();

  return (
    <section
      className="py-20 px-6 lg:px-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1E0808 0%, #0F0404 100%)' }}
    >
      {/* Decorative orb */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
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
              <WineIcon size={18} weight="light" className="text-gold-light" />
              <p className="type-overline text-gold-light/70 text-[11px]">Curadoria de terroir</p>
            </div>
            <h2 className="type-h1 text-cream">
              Carta de<br />
              <span className="font-subtitle italic font-normal text-gold-light">Vinhos</span>
            </h2>
          </div>

          <button
            onClick={() => { navigate('/bebidas/vinhos'); window.scrollTo({ top: 0 }); }}
            className="group self-start sm:self-end flex items-center gap-3 border border-gold-light/40 text-gold-light font-body font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-full transition-all duration-300 hover:bg-gold-primary/20 hover:border-gold-light/70"
          >
            Ver carta completa
            <ArrowRightIcon
              size={13}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </motion.div>

        <SectionDivider dark className="mb-10" />

        {/* Wine grid — 8 cards sem filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {PREVIEW_WINES.map((wine, i) => (
            <WineCard key={`${wine.name}-${wine.countryCode}`} wine={wine} index={i} />
          ))}
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
            onClick={() => { navigate('/bebidas/vinhos'); window.scrollTo({ top: 0 }); }}
            className="group flex items-center gap-3 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-gold"
          >
            Ver os 70+ rótulos
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

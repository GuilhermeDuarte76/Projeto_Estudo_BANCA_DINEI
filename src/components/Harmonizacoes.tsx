import { motion } from 'framer-motion';
import { WineIcon, CheeseIcon, LeafIcon } from '@phosphor-icons/react';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
import { HARMONIZACOES } from '../data/tabuas';
import SectionDivider from './SectionDivider';

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

export default function Harmonizacoes() {
  return (
    <section id="harmonizacoes" className="bg-cream py-24 px-6 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center mb-16"
        >
          <p className="type-overline text-gold-primary mb-4">Guia de sabores</p>
          <h2 className="type-h1 text-graphite">
            Harmonizações<br />
            <span className="font-subtitle italic font-normal text-bordeaux">perfeitas</span>
          </h2>
          <p className="type-body text-graphite/60 mt-6 mx-auto max-w-[52ch] leading-relaxed">
            Descubra as combinações ideais entre nossos vinhos e as tábuas artesanais para elevar sua experiência à mesa.
          </p>
        </motion.div>

        <SectionDivider className="mb-16 -mt-4" />

        {/* Harmonizações — Z-axis cascade layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HARMONIZACOES.map((item, i) => {
            const Icon = WINE_ICONS[item.icon] || WineIcon;
            const colors = WINE_COLORS[item.icon];

            return (
              <motion.div
                key={item.vinho}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.12,
                  ease: EASE,
                }}
                whileHover={{ y: -8, rotate: i === 1 ? 0 : i === 0 ? 0.5 : -0.5 }}
                style={{
                  rotate: i === 0 ? '-0.5deg' : i === 2 ? '0.5deg' : '0deg',
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Outer shell */}
                <div className={`p-1.5 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-[2rem]`}>
                  {/* Inner */}
                  <div
                    className="rounded-[calc(2rem-0.375rem)] bg-cream/80 p-8 flex flex-col gap-6"
                    style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)' }}
                  >
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl border ${colors.border} flex items-center justify-center bg-white/50`}>
                      <Icon size={28} weight="light" className={colors.icon} />
                    </div>

                    {/* Title */}
                    <div>
                      <p className="type-overline text-gold-primary text-[10px] mb-2">Harmoniza com</p>
                      <h3 className="type-h3 text-graphite">{item.vinho}</h3>
                    </div>

                    {/* Pairings */}
                    <div className="flex flex-col gap-2">
                      {item.harmoniza.map((h, idx) => (
                        <motion.div
                          key={h}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12 + idx * 0.07, duration: 0.4 }}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${colors.badge}`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                          <span className="type-body text-sm font-body">{h}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="type-caption text-graphite/50 not-italic text-sm">
            Dica: ao fazer seu pedido, informe o estilo de vinho desejado e sugerimos a tábua ideal para você.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

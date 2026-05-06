import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CrownIcon, StarIcon, MapPinIcon } from '@phosphor-icons/react';
import taboaFrios from '../../assets/taboaFrios.jpg';
import LogoReveal from './LogoReveal';
import LocationModal from './LocationModal';
import { EASE } from '../../lib/motion'


const MARQUEE_ITEMS = [
  'Frios Selecionados',
  'Tábuas Artesanais',
  'Vinhos Curados',
  'Doces Especiais',
  'Curadoria Premium',
  'Delicatessen',
  'Frios Selecionados',
  'Tábuas Artesanais',
  'Vinhos Curados',
  'Doces Especiais',
  'Curadoria Premium',
  'Delicatessen',
];

const CATEGORIES = [
  { label: 'Queijos & Frios', path: '/frios' },
  { label: 'Tábuas', path: '/tabuas' },
  { label: 'Doces', path: '/doces' },
  { label: 'Grãos & Castanhas', path: '/graos-castanhas' },
  { label: 'Vinhos', path: '/bebidas/vinhos' },
  { label: 'Cervejas', path: '/bebidas/cerveja' },
  { label: 'Cachaças', path: '/bebidas/cachaca' },
  { label: 'Não Alcoólicos', path: '/bebidas/nao-alcoolicos' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: EASE } },
});

export default function Hero() {
  const navigate = useNavigate();
  const [locationOpen, setLocationOpen] = useState(false);

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] bg-dark-warm overflow-x-hidden flex flex-col"
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Radial warm glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(184,134,11,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(139,26,26,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Main content grid */}
      <div className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_480px] max-w-[1400px] mx-auto w-full px-6 lg:px-16 pt-10 lg:pt-32 pb-4 lg:pb-24 gap-12 items-center">
        {/* Left: Content */}
        <div className="flex flex-col justify-between lg:justify-start gap-3 lg:gap-8">
          {/* Badge — apenas desktop */}
          <motion.div {...fadeUp(0.1)} className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full px-4 py-2">
              <CrownIcon size={14} weight="fill" className="text-gold-primary" />
              <span className="type-overline text-gold-light">Delicatessen Premium · Uberlândia</span>
            </div>
          </motion.div>

          {/* Logo Reveal — mobile */}
          <motion.div {...fadeUp(0.2)} className="flex lg:hidden justify-center">
            <LogoReveal className="w-56 h-56" />
          </motion.div>

          {/* Logo Reveal — desktop */}
          <motion.div {...fadeUp(0.1)} className="hidden lg:flex lg:justify-center">
            <LogoReveal className="w-80 h-80" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            {...fadeUp(0.35)}
            className="type-body text-cream/60 max-w-[52ch] leading-relaxed text-sm lg:text-lg"
          >
            Curadoria de frios, tábuas artesanais, doces e vinhos selecionados.
            Sofisticação e prazer à mesa para momentos que merecem o melhor.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.5)} className="flex flex-col gap-3">
            {/* Mobile: carousel auto-scroll com fade nas bordas */}
            <div
              className="lg:hidden overflow-hidden group"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              }}
            >
              <div
                className="flex gap-2 w-max group-hover:[animation-play-state:paused]"
                style={{ animation: 'marquee 45s linear infinite' }}
              >
                {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
                  <button
                    key={`${cat.path}-${i}`}
                    onClick={() => navigate(cat.path)}
                    className="flex-shrink-0 border border-gold-primary/40 text-gold-light/80 font-body font-bold uppercase tracking-widest px-3 py-2 rounded-full transition-colors duration-300 hover:border-gold-light hover:text-gold-light hover:bg-gold-primary/10 active:scale-[0.97] text-[10px] whitespace-nowrap"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: pills estáticos em flex-wrap */}
            <div className="hidden lg:flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.path}
                  onClick={() => navigate(cat.path)}
                  className="border border-gold-primary/40 text-gold-light/80 font-body font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-colors duration-300 hover:border-gold-light hover:text-gold-light hover:bg-gold-primary/10 active:scale-[0.97] text-[11px] whitespace-nowrap"
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setLocationOpen(true)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 border border-cream/20 text-cream/50 font-body font-bold uppercase tracking-widest px-4 lg:px-8 py-3 rounded-full transition-all duration-300 hover:border-gold-primary/40 hover:text-gold-light text-xs lg:text-sm"
            >
              <MapPinIcon size={13} weight="fill" />
              Onde nos Encontrar
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            {...fadeUp(0.6)}
            className="flex flex-wrap items-center gap-5 lg:gap-8 pt-4 lg:pt-4 border-t border-cream/10"
          >
            {[
              { label: 'Qualidade', sub: 'Curada' },
              { label: 'Entrega', sub: 'Uberlândia' },
              { label: 'Pedido', sub: 'Via WhatsApp' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <StarIcon size={14} weight="fill" className="text-gold-primary" />
                <div>
                  <p className="type-overline text-cream text-xs">{item.label}</p>
                  <p className="type-caption text-cream/40 text-[11px] not-italic">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="hidden lg:block"
        >
          <div className="relative p-2 bg-gold-primary/5 border border-gold-primary/20 rounded-[2rem] animate-float">
            <div
              className="relative overflow-hidden rounded-[calc(2rem-0.5rem)]"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)' }}
            >
              <img
                src={taboaFrios}
                alt="Tábua de frios premium da Banca do Dinei"
                className="w-full h-[560px] object-cover object-top"
                loading="eager"
                style={{ filter: 'brightness(1.05) contrast(1.05) saturate(1.1)' }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(26,10,0,0.7) 0%, transparent 50%), linear-gradient(to right, rgba(26,10,0,0.4) 0%, transparent 60%)',
                }}
              />

              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-dark-warm/80 backdrop-blur-sm border border-gold-primary/30 rounded-xl p-4 flex items-end justify-between">
                  <div>
                    <p className="type-overline text-gold-light text-[10px]">Tábua Trivial</p>
                    <p className="font-display font-bold text-cream text-lg">a partir de</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-gold-light text-2xl">R$ 49,99</p>
                    <p className="type-caption text-cream/50 text-[10px] not-italic">baby 550g</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Kinetic Marquee */}
      <div className="relative z-10 border-t border-gold-primary/20 py-4 overflow-hidden bg-dark-warm/50">
        <div
          className="flex gap-8 whitespace-nowrap"
          style={{ animation: 'marquee 30s linear infinite' }}
        >
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="flex items-center gap-4 text-gold-primary/60 type-overline text-xs flex-shrink-0">
              <CrownIcon size={10} weight="fill" className="text-gold-primary/40" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-24 left-8 hidden lg:flex flex-col items-center gap-2 z-10"
      >
        <div className="h-12 w-px bg-gradient-to-b from-gold-primary/50 to-transparent" />
        <span className="type-overline text-cream/30 text-[9px] [writing-mode:vertical-rl]">
          Role para descobrir
        </span>
      </motion.div>

      {/* Location Modal */}
      <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} />
    </section>
  );
}

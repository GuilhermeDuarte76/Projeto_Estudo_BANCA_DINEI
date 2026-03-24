import { motion } from 'framer-motion';
import { CrownIcon, ArrowDownIcon, WhatsappLogoIcon, StarIcon, MapPinIcon } from '@phosphor-icons/react';
import taboaFrios from '../assets/taboaFrios.jpg';
import logo from '../assets/logo.png';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: EASE } },
});

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] bg-dark-warm overflow-x-hidden flex flex-col"
    >
      {/* Grain overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.04]"
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

          {/* Logo — apenas mobile */}
          <motion.div {...fadeUp(0.2)} className="flex lg:hidden justify-center">
            <img
              src={logo}
              alt="Banca do Dinei"
              className="h-52 w-auto object-contain drop-shadow-lg"
            />
          </motion.div>

          {/* Main title — apenas desktop */}
          <motion.div {...fadeUp(0.2)} className="hidden lg:flex flex-col gap-0">
            <span className="font-display font-bold text-cream/50 text-xl lg:text-2xl tracking-[0.3em] uppercase">
              Banca do
            </span>
            <h1
              className="font-display font-black text-cream leading-none tracking-tight"
              style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}
            >
              DINEI
            </h1>
            <span className="font-subtitle italic text-gold-light text-lg lg:text-xl tracking-widest mt-1">
              Delicatessen
            </span>
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
          <motion.div {...fadeUp(0.5)} className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:gap-4">
            {/* Linha 1: 75/25 */}
            <div className="flex gap-2 lg:contents">
              <a
                href="https://wa.me/5534321220099?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-[3] lg:flex-none flex items-center justify-center gap-2 bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest px-4 lg:px-8 py-3 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-gold active:scale-[0.98] text-xs lg:text-sm"
              >
                <WhatsappLogoIcon size={14} weight="fill" />
                <span>Fazer Pedido</span>
                <span className="hidden lg:flex w-7 h-7 rounded-full bg-dark-warm/10 items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-px">
                  <ArrowDownIcon size={13} weight="bold" className="rotate-[-90deg]" />
                </span>
              </a>

              <button
                onClick={() => document.querySelector('#tabuas')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-[1] lg:flex-none flex items-center justify-center gap-2 border border-gold-primary/50 text-gold-light font-body font-bold uppercase tracking-widest px-4 lg:px-8 py-3 rounded-full transition-all duration-300 hover:border-gold-light hover:-translate-y-1 text-xs lg:text-sm"
              >
                Tábuas
              </button>
            </div>

            {/* Linha 2: Onde nos Encontrar */}
            <button
              onClick={() => document.querySelector('#locais')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full lg:w-auto flex items-center justify-center gap-2 border border-cream/20 text-cream/50 font-body font-bold uppercase tracking-widest px-4 lg:px-8 py-3 rounded-full transition-all duration-300 hover:border-gold-primary/40 hover:text-gold-light text-xs lg:text-sm"
            >
              <MapPinIcon size={13} weight="fill" />
              Onde nos Encontrar
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            {...fadeUp(0.6)}
            className="flex flex-wrap items-center gap-4 lg:gap-6 pt-4 lg:pt-4 border-t border-cream/10"
          >
            {[
              { label: 'Qualidade', sub: 'Curada' },
              { label: 'Entrega', sub: 'Uberlândia' },
              { label: 'Pedido', sub: 'Via WhatsApp' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <StarIcon size={12} weight="fill" className="text-gold-primary" />
                <div>
                  <p className="type-overline text-cream text-[10px]">{item.label}</p>
                  <p className="type-caption text-cream/40 text-[10px] not-italic">{item.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Image with double-bezel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="hidden lg:block"
        >
          {/* Outer shell */}
          <div className="relative p-2 bg-gold-primary/5 border border-gold-primary/20 rounded-[2rem] animate-float">
            {/* Inner core */}
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
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(26,10,0,0.7) 0%, transparent 50%), linear-gradient(to right, rgba(26,10,0,0.4) 0%, transparent 60%)',
                }}
              />

              {/* Price badge floating */}
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
    </section>
  );
}

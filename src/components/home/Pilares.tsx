import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, type Variants } from 'framer-motion';
import videoDoce from '../../assets/doce.mp4';
import videoVinho from '../../assets/vinho.mp4';
import imgFrios from '../../assets/frios.jpg';
import imgQueijo from '../../assets/queijo.jpg';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
import { CheeseIcon, CakeIcon, WineIcon, ArrowRightIcon } from '@phosphor-icons/react';
import SectionDivider from '../layout/SectionDivider';

const PILARES = [
  {
    icon: CheeseIcon,
    title: 'Frios & Tábuas',
    subtitle: 'Charcutaria artesanal',
    description:
      'Embutidos importados, queijos de múltiplas origens e tábuas montadas com atenção visual única. Do baby ao banquete.',
    cta: 'Ver tábuas',
    href: '/tabuas',
    cta2: 'Ver frios',
    href2: '/frios',
    bg: 'bg-cream',
    border: 'border-gold-primary/30',
    accent: 'text-gold-primary',
    textColor: 'text-graphite',
    subtextColor: 'text-graphite/60',
    ctaClass: 'bg-gradient-gold text-dark-warm',
    imageSeed: 'frios-tabuas',
    isWide: true,
    tag: '+40 itens',
    index: '01',
    fadeColor: 'rgba(245,240,232,',
  },
  {
    icon: CakeIcon,
    title: 'Doces',
    subtitle: 'Indulgência & celebração',
    description:
      'Chocolates artesanais, geleias de frutas e kits presenteáveis para momentos especiais.',
    cta: 'Conferir doces',
    href: '/doces',
    bg: 'bg-beige',
    border: 'border-gold-primary/20',
    accent: 'text-bordeaux',
    textColor: 'text-graphite',
    subtextColor: 'text-graphite/60',
    ctaClass: 'border border-bordeaux/60 text-bordeaux',
    imageSeed: 'doces-delicatessen',
    videoSrc: videoDoce,
    isWide: false,
    tag: 'Kits gift',
    index: '02',
    fadeColor: 'rgba(232,217,181,',
  },
  {
    icon: WineIcon,
    title: 'Vinhos',
    subtitle: 'Curadoria de terroir',
    description:
      'Carta com mais de 70 rótulos de Portugal, Argentina, Chile, Itália, França e mais. Do cotidiano ao especial.',
    cta: 'Ver carta completa',
    href: '/bebidas/vinhos',
    bg: 'bg-gradient-wine',
    border: 'border-gold-light/30',
    accent: 'text-gold-light',
    textColor: 'text-cream',
    subtextColor: 'text-cream/60',
    ctaClass: 'border border-gold-light/60 text-gold-light',
    imageSeed: 'vinhos-curados',
    videoSrc: videoVinho,
    isWide: false,
    tag: '70+ rótulos',
    index: '03',
    fadeColor: 'rgba(107,15,15,',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

function ScrollImageCrossfade({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const friosOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
    [1,   1,   0,    0,   1,   1,   0,    0]
  );
  const queijoOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
    [0,   0,   1,    1,   0,   0,   1,    1]
  );

  return (
    <div ref={ref} className={`relative w-full h-full ${className ?? ''}`}>
      <motion.img
        src={imgFrios}
        alt="Frios e tábuas"
        style={{ opacity: friosOpacity }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <motion.img
        src={imgQueijo}
        alt="Queijos"
        style={{ opacity: queijoOpacity }}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

export default function Pilares() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const navigate = useNavigate();

  const handleNav = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
      window.scrollTo({ top: 0 });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-cream py-24 px-4 sm:px-6 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center mb-16"
        >
          <p className="type-overline text-gold-primary mb-4">Nossa curadoria</p>
          <h2 className="type-h1 text-graphite">
            Três pilares,<br />
            <span className="font-subtitle italic font-normal text-gold-primary">uma experiência</span>
          </h2>
        </motion.div>

        <SectionDivider className="mb-16 -mt-4" />

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-5"
        >
          {PILARES.map((pilar, idx) => {
            const Icon = pilar.icon;
            const positionClass = pilar.isWide
              ? 'lg:col-span-2 lg:row-span-2'
              : idx === 1
              ? 'lg:col-start-3 lg:row-start-1'
              : 'lg:col-start-3 lg:row-start-2';

            return (
              <motion.article
                key={pilar.title}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                className={`${positionClass} relative group cursor-pointer`}
                onClick={() => handleNav(pilar.href)}
              >
                <div
                  className={`p-1.5 border ${pilar.border} rounded-[2rem] ${pilar.bg} h-full`}
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  {pilar.isWide ? (
                    <div
                      className={`relative overflow-hidden rounded-[calc(2rem-0.375rem)] ${pilar.bg} flex flex-col lg:flex-row h-full`}
                      style={{ minHeight: 'clamp(300px, 28vw, 420px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}
                    >
                      <div className="absolute inset-0 lg:hidden opacity-[0.12] transition-opacity duration-500 group-hover:opacity-[0.2]">
                        <ScrollImageCrossfade className="w-full h-full" />
                      </div>

                      <div className="relative z-10 flex flex-col justify-between gap-6 p-8 lg:p-12 flex-1">
                        <span
                          className="lg:hidden absolute bottom-4 right-6 font-display font-black leading-none select-none pointer-events-none"
                          style={{ fontSize: 'clamp(5rem, 20vw, 7rem)', color: 'rgba(184,134,11,0.07)' }}
                        >
                          {pilar.index}
                        </span>

                        <div className="flex items-start justify-between">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${pilar.border}`}
                            style={{ background: 'rgba(255,255,255,0.15)' }}
                          >
                            <Icon size={24} weight="light" className={pilar.accent} />
                          </div>
                          <span className={`type-overline text-[10px] ${pilar.subtextColor}`}>{pilar.subtitle}</span>
                        </div>

                        <div>
                          <h3 className={`type-h2 ${pilar.textColor} mb-3`}>{pilar.title}</h3>
                          <div className={`w-10 h-px mb-4 ${pilar.accent} opacity-40`} style={{ background: 'currentColor' }} />
                          <p className={`type-body ${pilar.subtextColor} text-sm leading-relaxed max-w-[40ch]`}>
                            {pilar.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                          <button
                            className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-body font-bold uppercase tracking-wider transition-all duration-300 group-hover:gap-4 ${pilar.ctaClass}`}
                          >
                            {pilar.cta}
                            <span className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                              <ArrowRightIcon size={12} weight="bold" />
                            </span>
                          </button>
                          {'cta2' in pilar && pilar.cta2 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleNav((pilar as typeof pilar & { href2: string }).href2); }}
                              className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-body font-bold uppercase tracking-wider border border-gold-primary/50 text-gold-primary transition-all duration-300 hover:gap-4`}
                            >
                              {pilar.cta2}
                              <span className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 hover:translate-x-1">
                                <ArrowRightIcon size={12} weight="bold" />
                              </span>
                            </button>
                          )}
                          <span className={`type-overline text-[11px] ${pilar.subtextColor}`}>{pilar.tag}</span>
                        </div>
                      </div>

                      <div className="hidden lg:block relative w-[42%] flex-shrink-0 overflow-hidden">
                        <span
                          className="absolute bottom-5 right-5 z-20 font-display font-black leading-none select-none pointer-events-none"
                          style={{ fontSize: '9rem', color: 'rgba(255,255,255,0.09)' }}
                        >
                          {pilar.index}
                        </span>
                        <ScrollImageCrossfade className="transition-transform duration-700 group-hover:scale-105" />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(to right, ${pilar.fadeColor}1) 0%, ${pilar.fadeColor}0) 45%)`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`relative overflow-hidden rounded-[calc(2rem-0.375rem)] ${pilar.bg} flex flex-col`}
                      style={{ minHeight: 'clamp(360px, 32vw, 460px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}
                    >
                      {'videoSrc' in pilar && pilar.videoSrc && (
                        <>
                          <video
                            src={pilar.videoSrc as string}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div
                            className="absolute inset-0 pointer-events-none z-10"
                            style={{ background: `linear-gradient(to bottom, ${pilar.fadeColor}0.3) 0%, ${pilar.fadeColor}0.85) 70%)` }}
                          />
                        </>
                      )}

                      {!('videoSrc' in pilar && pilar.videoSrc) && (
                        <div className="relative h-44 sm:h-48 flex-shrink-0 overflow-hidden">
                          <img
                            src={`https://picsum.photos/seed/${pilar.imageSeed}/600/400`}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <span
                            className="absolute top-2 right-4 z-10 font-display font-black leading-none select-none pointer-events-none"
                            style={{ fontSize: '5.5rem', color: 'rgba(255,255,255,0.13)' }}
                          >
                            {pilar.index}
                          </span>
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: `linear-gradient(to bottom, ${pilar.fadeColor}0) 40%, ${pilar.fadeColor}1) 100%)`,
                            }}
                          />
                        </div>
                      )}

                      <div className="relative z-20 flex flex-col justify-between gap-5 p-6 sm:p-7 flex-1">
                        <div className="flex items-start justify-between">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${pilar.border}`}
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                          >
                            <Icon size={20} weight="light" className={pilar.accent} />
                          </div>
                          <span className={`type-overline text-[10px] ${pilar.subtextColor}`}>{pilar.subtitle}</span>
                        </div>

                        <div>
                          <h3 className={`type-h2 ${pilar.textColor} mb-2`}>{pilar.title}</h3>
                          <div className="w-8 h-px mb-3 opacity-30" style={{ background: 'currentColor' }} />
                          <p className={`type-body ${pilar.subtextColor} text-sm leading-relaxed`}>
                            {pilar.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <button
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-body font-bold uppercase tracking-wider transition-all duration-300 group-hover:gap-3 ${pilar.ctaClass}`}
                          >
                            {pilar.cta}
                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                              <ArrowRightIcon size={11} weight="bold" />
                            </span>
                          </button>
                          <span className={`type-overline text-[11px] ${pilar.subtextColor}`}>{pilar.tag}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

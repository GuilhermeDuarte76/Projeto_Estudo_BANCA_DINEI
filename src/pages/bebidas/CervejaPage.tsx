import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CervejariaLouvada from '../../components/louvada/CervejariaLouvada';

const novaVideo = 'https://pub-2a319a86ab4845a088e34b4b2a6027be.r2.dev/uploads/videos/Video_Generation_Complete1-ezgif.com-reverse-video.mp4';

const apaVideo = 'https://pub-2a319a86ab4845a088e34b4b2a6027be.r2.dev/uploads/videos/ezgif-3f66b04213e14bc8.mp4';

const BG      = '#000000';
const GOLD    = '#DFA62B';
const HDR_BG  = '#6B5C4E';
const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/* ── helpers ──────────────────────────────────────────────── */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: HDR_BG, borderRadius: 3, padding: '3px 10px 1px', marginBottom: 10, display: 'inline-block' }}>
      <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#E8E0D0' }}>
        {children}
      </span>
    </div>
  );
}

function ShieldItem({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
      <svg width="14" height="16" viewBox="0 0 14 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <path d="M7 1.5L1.5 4v4.5c0 3.5 2.3 6.5 5.5 7 3.2-.5 5.5-3.5 5.5-7V4L7 1.5Z"
          stroke={GOLD} strokeWidth="1.2" fill={`${GOLD}22`} />
      </svg>
      <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: '#E0E0E0', lineHeight: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {text}
      </span>
    </div>
  );
}

function HopIcon({ active }: { active: boolean }) {
  const fill = active ? GOLD : `${GOLD}35`;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <ellipse cx="13" cy="14" rx="7" ry="9" fill={fill} />
      <ellipse cx="13" cy="11" rx="3.5" ry="2.5" fill={active ? 'rgba(0,0,0,0.25)' : `${GOLD}10`} />
      <ellipse cx="13" cy="17" rx="3.5" ry="2.5" fill={active ? 'rgba(0,0,0,0.25)' : `${GOLD}10`} />
      <line x1="13" y1="5" x2="13" y2="8" stroke={active ? GOLD : `${GOLD}40`} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GlassIcon({ type }: { type: 'caldereta' | 'pint' | 'pilsen' | 'lager' }) {
  const path =
    type === 'caldereta' ? 'M8 5 H28 L25 44 H11 Z' :
    type === 'pint'      ? 'M6 5 H30 L28 44 H8 Z'  :
    type === 'pilsen'    ? 'M12 5 H24 L22 44 H14 Z' :
    /* lager */            'M9 5 H27 L24 44 H12 Z';
  return (
    <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
      <path d={path} stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" fill="rgba(255,255,255,0.07)" />
      <line x1="8" y1="44" x2="28" y2="44" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
    </svg>
  );
}

function WaterIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
      <path d="M14 3 C14 3 4 14 4 21 C4 27 8.5 31 14 31 C19.5 31 24 27 24 21 C24 14 14 3 14 3Z"
        stroke={GOLD} strokeWidth="1.5" fill={`${GOLD}25`} />
    </svg>
  );
}

function HopIngIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
      <ellipse cx="14" cy="18" rx="9" ry="11" stroke={GOLD} strokeWidth="1.5" fill={`${GOLD}25`} />
      <ellipse cx="14" cy="15" rx="4" ry="3" fill={`${GOLD}40`} />
      <ellipse cx="14" cy="21" rx="4" ry="3" fill={`${GOLD}40`} />
      <line x1="14" y1="7" x2="14" y2="11" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function YeastIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      {[{ cx: 8, cy: 8 }, { cx: 20, cy: 8 }, { cx: 14, cy: 16 }, { cx: 8, cy: 22 }, { cx: 20, cy: 22 }].map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r="4" stroke={GOLD} strokeWidth="1.2" fill={`${GOLD}25`} />
      ))}
    </svg>
  );
}

function MaltIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
      <rect x="7" y="10" width="14" height="18" rx="3" stroke={GOLD} strokeWidth="1.5" fill={`${GOLD}25`} />
      <line x1="11" y1="10" x2="11" y2="6" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="10" x2="17" y2="6" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="10" x2="14" y2="5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── carousel slides ────────────────────────────────────────── */

interface BeerSlide {
  id: string;
  video: string;
  brewery: string;
  name: string;
  style: string;
  aboutStyle: string[];
  sensory: string[];
  ibu: { label: string; filled: number };
  abv: string;
  temp: string;
  glasses: { type: 'caldereta' | 'pint' | 'pilsen' | 'lager'; label: string }[];
  harmonization: string[];
  harmonizationShort: string[];
  ingredients: { label: string; Icon: React.FC }[];
  packaging: string;
  blushColor: string; // RGB triplet, e.g. '40,90,255'
}

const SLIDES: BeerSlide[] = [
  {
    id: 'apa',
    video: apaVideo,
    brewery: 'Louvada',
    name: 'APA',
    style: 'American Pale Ale',
    aboutStyle: [
      'Surgiu nos anos 80, em meio à revolução cervejeira dos EUA',
      'Apesar de serem lupuladas, não chegam a ser muito amargas',
      'O estilo está próximo de uma India Pale Ale (IPA), porém a IPA é mais forte e possui lúpulo mais assertivo',
    ],
    sensory: [
      'Aromática, marcante e acobreada',
      'Aromas que remetem a frutas tropicais',
      'Cor acobreada',
    ],
    ibu: { label: '45 IBU – Médio', filled: 4 },
    abv: '5,1% vol',
    temp: '4–8 °C',
    glasses: [
      { type: 'caldereta', label: 'Caldereta' },
      { type: 'pint', label: 'Pint' },
    ],
    harmonization: ['Queijos Maturados', 'Embutidos', 'Hambúrgueres com Queijos Fortes'],
    harmonizationShort: ['Queijos Maturados', 'Embutidos', 'Hambúrgueres c/ Queijos Fortes'],
    ingredients: [
      { label: 'Água', Icon: WaterIcon },
      { label: 'Lúpulo', Icon: HopIngIcon },
      { label: 'Levedura', Icon: YeastIcon },
      { label: 'Malte de Cevada', Icon: MaltIcon },
    ],
    packaging: 'Garrafa 500 ml e Chopp',
    blushColor: '40,90,255',
  },
  {
    id: 'vienna',
    video: novaVideo,
    brewery: 'Louvada',
    name: 'Vienna',
    style: 'Vienna',
    aboutStyle: [
      'Criado em Vienna, na Áustria, se tornou muito popular no México, EUA e na América do Sul',
      'Muito similar aos estilos Oktoberfest e Märzen, apesar de menos intensa',
      'Possui carbonatação moderada e teor alcoólico que varia entre 4,7% e 5,5%',
    ],
    sensory: [
      'Equilíbrio entre o malte e o lúpulo',
      'Suave dulçor de biscoito ao final',
      'Cor âmbar',
    ],
    ibu: { label: '25 IBU – Médio', filled: 3 },
    abv: '5,4% vol',
    temp: '4–8 °C',
    glasses: [
      { type: 'pilsen', label: 'Pilsen' },
      { type: 'lager', label: 'Lager' },
    ],
    harmonization: ['Queijos Fortes', 'Carnes Vermelhas', 'Hambúrgueres'],
    harmonizationShort: ['Queijos Fortes', 'Carnes Vermelhas', 'Hambúrgueres'],
    ingredients: [
      { label: 'Água', Icon: WaterIcon },
      { label: 'Lúpulo', Icon: HopIngIcon },
      { label: 'Levedura', Icon: YeastIcon },
      { label: 'Malte de Cevada', Icon: MaltIcon },
    ],
    packaging: 'Garrafa 500 ml e Chopp',
    blushColor: '200,18,18',
  },
];

function CarouselArrow({ dir, onClick, isMobile }: { dir: -1 | 1; onClick: () => void; isMobile: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === -1 ? 'Anterior' : 'Próximo'}
      style={{
        position: 'absolute',
        top: '50%',
        ...(dir === -1
          ? { left: isMobile ? 12 : 24 }
          : { right: isMobile ? 12 : 24 }),
        transform: 'translateY(-50%)',
        background: `${GOLD}12`,
        border: `1px solid ${GOLD}50`,
        borderRadius: '50%',
        width: isMobile ? 36 : 42,
        height: isMobile ? 36 : 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: GOLD,
        fontSize: isMobile ? 18 : 22,
        fontFamily: 'sans-serif',
        transition: 'background 0.2s, border-color 0.2s',
        zIndex: 10,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onPointerEnter={(e) => { e.currentTarget.style.background = `${GOLD}30`; e.currentTarget.style.borderColor = GOLD; }}
      onPointerLeave={(e) => { e.currentTarget.style.background = `${GOLD}12`; e.currentTarget.style.borderColor = `${GOLD}50`; }}
    >
      {dir === -1 ? '‹' : '›'}
    </button>
  );
}

/* ── slide variants ─────────────────────────────────────────── */

const slideLeft = {
  hidden: { opacity: 0, x: -28 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.15, duration: 0.55, ease: EASE } }),
};
const slideRight = {
  hidden: { opacity: 0, x: 28 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.15, duration: 0.55, ease: EASE } }),
};

/* ── page ───────────────────────────────────────────────────── */

export default function CervejaPage() {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 900);
  const [showModal, setShowModal] = useState(false);

  /* progress driven by rAF — no React re-renders */
  const progressRef   = useRef(0);
  const amberKeyRef   = useRef<HTMLDivElement>(null);
  const amberHazeRef  = useRef<HTMLDivElement>(null);
  const floorGlowRef  = useRef<HTMLDivElement>(null);
  const centreLiftRef = useRef<HTMLDivElement>(null);
  const rafId         = useRef(0);

  /* carousel */
  const [slideIdx, setSlideIdx] = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const [fading, setFading] = useState(false);
  const beer = SLIDES[slideIdx];

  const goToSlide = (dir: -1 | 1) => {
    setFading(true);
    setTimeout(() => {
      const next = (slideIdx + dir + SLIDES.length) % SLIDES.length;
      setSlideIdx(next);
      setSlideKey(k => k + 1);
      setEnded(false);
      progressRef.current = 0;
      applyProgress(0);
      setShowModal(false);
      setFading(false);
    }, 250);
  };

  /* apply progress to lighting layers via DOM (no re-render) */
  const applyProgress = (p: number) => {
    if (amberKeyRef.current)   amberKeyRef.current.style.opacity   = String(0.10 + p * 0.90);
    if (amberHazeRef.current)  amberHazeRef.current.style.opacity  = String(p);
    if (floorGlowRef.current)  floorGlowRef.current.style.opacity  = String(0.3 + p * 0.70);
    if (centreLiftRef.current) centreLiftRef.current.style.opacity = String(p);
  };

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* force muted + autoplay for every browser (Safari needs muted set via JS) */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.currentTime = 0;
    v.play().catch(() => {
      /* autoplay blocked — show content immediately */
      setEnded(true);
    });

    /* rAF loop for smooth progress — avoids onTimeUpdate jank */
    const tick = () => {
      if (v.duration) {
        const p = v.currentTime / v.duration;
        if (Math.abs(p - progressRef.current) > 0.002) {
          progressRef.current = p;
          applyProgress(p);
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideKey]);

  return (
    <>
      {/* ── APA section ───────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        {/* ── atmospheric lighting layers ── */}

        {/* Blue fill – adapts position: bottom-left desktop / bottom-center mobile */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? `radial-gradient(ellipse 100% 35% at 50% 48%, rgba(${beer.blushColor},0.14), transparent 70%)`
            : `radial-gradient(ellipse 70% 60% at -5% 110%, rgba(${beer.blushColor},0.18), transparent 65%)`,
        }} />

        {/* Amber key/rim – top-right desktop / top-center mobile */}
        <div ref={amberKeyRef} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? 'radial-gradient(ellipse 110% 50% at 50% -2%, rgba(255,160,40,0.28), transparent 65%)'
            : 'radial-gradient(ellipse 65% 55% at 105% -5%, rgba(255,160,40,0.30), transparent 60%)',
          opacity: 0.10,
          transition: 'opacity 0.35s ease',
        }} />

        {/* Amber haze bloom */}
        <div ref={amberHazeRef} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? 'radial-gradient(ellipse 120% 55% at 50% 5%, rgba(255,130,20,0.18), transparent 68%)'
            : 'radial-gradient(ellipse 80% 60% at 90% 5%, rgba(255,130,20,0.20), transparent 65%)',
          opacity: 0,
          transition: 'opacity 0.55s ease',
        }} />

        {/* Floor glow – base reflection: 88% desktop / 46% mobile (vídeo fica no topo da seção) */}
        <div ref={floorGlowRef} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? 'radial-gradient(ellipse 80% 8% at 50% 46%, rgba(180,120,40,0.28), transparent 70%)'
            : 'radial-gradient(ellipse 38% 14% at 50% 88%, rgba(180,120,40,0.22), transparent 70%)',
          opacity: 0.3,
          transition: 'opacity 0.5s ease',
        }} />

        {/* Centre lift */}
        <div ref={centreLiftRef} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? 'radial-gradient(ellipse 90% 45% at 50% 25%, rgba(255,155,50,0.05), transparent 70%)'
            : 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(255,155,50,0.04), transparent 70%)',
          opacity: 0,
          transition: 'opacity 0.5s ease',
        }} />

        {/* Grain texture – identical to what the video renders, unifies the surface */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '180px',
          opacity: 0.035,
        }} />

        {/* 3-column grid */}
        <div style={{
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.25s ease',
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr auto 1fr',
          alignItems: 'center',
          gap: mobile ? 28 : 32,
          padding: mobile ? '100px 0 48px' : '100px 48px 48px',
          maxWidth: 1440,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}>

          {/* ── LEFT ───────────────────────────────────────────── */}
          <div style={{ display: mobile ? 'none' : 'flex', flexDirection: 'column', gap: 18 }}>

            {/* estilo */}
            <motion.div custom={0} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideLeft}>
              <Tag>Estilo</Tag>
              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#E0E0E0', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                {beer.style}
              </p>
            </motion.div>

            {/* sobre o estilo */}
            <motion.div custom={1} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideLeft}>
              <Tag>Sobre o Estilo</Tag>
              {beer.aboutStyle.map((t, i) => <ShieldItem key={i} text={t} />)}
            </motion.div>

            {/* copo ideal */}
            <motion.div custom={2} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideLeft}
              style={{ border: `1px solid ${GOLD}30`, borderRadius: 6, padding: '14px 18px', backgroundColor: `${GOLD}08` }}>
              <Tag>Copo Ideal</Tag>
              <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end' }}>
                {beer.glasses.map(g => (
                  <div key={g.type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <GlassIcon type={g.type} />
                    <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: '#E0E0E0', letterSpacing: '2px', textTransform: 'uppercase' }}>{g.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* harmonização */}
            <motion.div custom={3} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideLeft}>
              <Tag>Harmonização</Tag>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {beer.harmonization.map(item => (
                  <div key={item} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, maxWidth: 80 }}>
                    <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: '#E0E0E0', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', lineHeight: 1.3 }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── CENTER: VIDEO ───────────────────────────────────── */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            order: mobile ? -1 : 0,
            position: 'relative',
            /* breakout trick: escapa de qualquer container/padding pai */
            width: mobile ? '100vw' : 'clamp(220px, 28vw, 400px)',
            marginLeft: mobile ? 'calc(-50vw + 50%)' : 0,
            marginRight: mobile ? 'calc(-50vw + 50%)' : 0,
          }}>

            {/* ── título overlay sobre o vídeo ── */}
            <div style={{
              position: 'absolute',
              top: '-6%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 6,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              <div style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, letterSpacing: '5px', textTransform: 'uppercase', color: `${GOLD}70` }}>
                Cervejaria
              </div>
              <div style={{ fontFamily: "'Teko', sans-serif", fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 600, letterSpacing: '8px', textTransform: 'uppercase', color: '#FFFFFF', lineHeight: 1 }}>
                {beer.brewery}
              </div>
              <div style={{ fontFamily: "'Teko', sans-serif", fontSize: 'clamp(40px, 8vw, 90px)', fontWeight: 700, color: GOLD, lineHeight: 0.85, letterSpacing: '2px' }}>
                {beer.name}
              </div>
            </div>
            <video
              ref={videoRef}
              src={beer.video}
              muted
              playsInline
              preload="auto"
              onEnded={() => setEnded(true)}
              style={{
                width: '100%',
                maxHeight: mobile ? '70vh' : '82vh',
                objectFit: 'contain',
                display: 'block',
                willChange: 'opacity',
                transform: 'translateZ(0)',  /* force GPU layer */
                /* screen: preto do vídeo = transparente, só os pixels iluminados sobrevivem */
                mixBlendMode: 'screen',
                filter: mobile ? 'blur(0.5px)' : 'blur(0.6px)',
                /* mobile: opacidade reduzida para integrar ao fundo escuro */
                opacity: mobile ? 0.92 : 0.93,
                maskImage: mobile
                  ? 'radial-gradient(ellipse 64% 72% at 50% 57%, black 5%, rgba(0,0,0,0.80) 20%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.05) 54%, transparent 62%)'
                  : 'radial-gradient(ellipse 56% 78% at 50% 50%, black 8%, rgba(0,0,0,0.85) 28%, rgba(0,0,0,0.45) 52%, rgba(0,0,0,0.10) 66%, transparent 76%)',
                WebkitMaskImage: mobile
                  ? 'radial-gradient(ellipse 64% 72% at 50% 57%, black 5%, rgba(0,0,0,0.80) 20%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.05) 54%, transparent 62%)'
                  : 'radial-gradient(ellipse 56% 78% at 50% 50%, black 8%, rgba(0,0,0,0.85) 28%, rgba(0,0,0,0.45) 52%, rgba(0,0,0,0.10) 66%, transparent 76%)',
              }}
            />

            {/* ── mobile footer overlay ── */}
            {mobile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={ended ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
                style={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 8,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: `${GOLD}90` }}>
                    Estilo
                  </div>
                  <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: '#E0E0E0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    {beer.style}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: `${GOLD}15`,
                    border: `1px solid ${GOLD}70`,
                    borderRadius: 20,
                    padding: '8px 28px',
                    color: GOLD,
                    fontFamily: "'Teko', sans-serif",
                    fontSize: 13,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  Mais Informações
                </button>
              </motion.div>
            )}
            {/* slide indicator dots */}
            <div style={{
              position: 'absolute',
              bottom: mobile ? '4%' : -28,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 8,
              zIndex: 10,
            }}>
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === slideIdx ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === slideIdx ? GOLD : `${GOLD}40`,
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>          </div>

          {/* ── RIGHT ──────────────────────────────────────────── */}
          <div style={{ display: mobile ? 'none' : 'flex', flexDirection: 'column', gap: 18 }}>

            {/* características sensoriais */}
            <motion.div custom={0} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideRight}>
              <Tag>Características Sensoriais</Tag>
              {beer.sensory.map((t, i) => <ShieldItem key={i} text={t} />)}
            </motion.div>

            {/* características vitais */}
            <motion.div custom={1} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideRight}>
              <Tag>Características Vitais</Tag>
              <div style={{
                border: `1px solid ${GOLD}40`,
                borderRadius: 6,
                overflow: 'hidden',
                backgroundColor: `${GOLD}06`,
              }}>
                {/* row: amargor */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  borderBottom: `1px solid ${GOLD}25`,
                }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRight: `1px solid ${GOLD}25`,
                    backgroundColor: `${GOLD}0A`,
                    display: 'flex', alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}CC`, letterSpacing: '2px', textTransform: 'uppercase' }}>
                      Amargor
                    </span>
                  </div>
                  <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: '#E0E0E0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {beer.ibu.label}
                    </span>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: 5 }, (_, i) => <HopIcon key={i} active={i < beer.ibu.filled} />)}
                    </div>
                  </div>
                </div>

                {/* row: teor alcoólico */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  borderBottom: `1px solid ${GOLD}25`,
                }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRight: `1px solid ${GOLD}25`,
                    backgroundColor: `${GOLD}0A`,
                    display: 'flex', alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}CC`, letterSpacing: '2px', textTransform: 'uppercase' }}>
                      Teor Alc.
                    </span>
                  </div>
                  <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: '#E0E0E0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {beer.abv}
                    </span>
                  </div>
                </div>

                {/* row: temperatura */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRight: `1px solid ${GOLD}25`,
                    backgroundColor: `${GOLD}0A`,
                    display: 'flex', alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}CC`, letterSpacing: '2px', textTransform: 'uppercase' }}>
                      Temp. Ideal
                    </span>
                  </div>
                  <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: '#E0E0E0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {beer.temp}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ingredientes */}
            <motion.div custom={2} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideRight}>
              <Tag>Ingredientes</Tag>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {beer.ingredients.map(({ label, Icon }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Icon />
                    <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 10, color: '#E0E0E0', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* embalagem */}
            <motion.div custom={3} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideRight}>
              <Tag>Embalagem</Tag>
              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#E0E0E0', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                {beer.packaging}
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── carousel arrows ── */}
        <CarouselArrow dir={-1} onClick={() => goToSlide(-1)} isMobile={mobile} />
        <CarouselArrow dir={1} onClick={() => goToSlide(1)} isMobile={mobile} />

        {/* social handles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ended ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ position: 'absolute', bottom: 20, right: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, zIndex: 6 }}
        >
          <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}70`, letterSpacing: '2px' }}>@bancadodinei.udi</span>
          <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}70`, letterSpacing: '2px' }}>@louvadauberlandia</span>
        </motion.div>
      </section>

      {/* ── mobile info modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              backgroundColor: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              overflowY: 'auto',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* ambient glow behind modal */}
            <div style={{
              position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
              width: '140%', height: '50%',
              background: `radial-gradient(ellipse 60% 60% at 50% 0%, ${GOLD}18, transparent 70%)`,
              pointerEvents: 'none', zIndex: 0,
            }} />

            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.97 }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: 440,
                padding: '0 20px 48px',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              {/* ── modal header ── */}
              <div style={{
                position: 'sticky', top: 0, zIndex: 10,
                paddingTop: 18, paddingBottom: 14,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 60%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontFamily: "'Teko', sans-serif", fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: `${GOLD}80` }}>
                    Cervejaria {beer.brewery}
                  </div>
                  <div style={{ fontFamily: "'Teko', sans-serif", fontSize: 28, fontWeight: 700, color: GOLD, lineHeight: 1, letterSpacing: '3px' }}>
                    {beer.name}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${GOLD}40`,
                    borderRadius: '50%',
                    width: 38,
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ccc',
                    fontSize: 16,
                    fontFamily: 'sans-serif',
                    flexShrink: 0,
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onPointerEnter={(e) => { e.currentTarget.style.background = `${GOLD}20`; e.currentTarget.style.borderColor = GOLD; }}
                  onPointerLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = `${GOLD}40`; }}
                >
                  ✕
                </button>
              </div>

              {/* gold divider */}
              <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${GOLD}50, transparent)`, marginBottom: 28 }} />

              {/* ── sections ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* estilo + sobre */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4, ease: EASE }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}18`, borderRadius: 10, padding: '18px 20px' }}>
                  <Tag>Estilo</Tag>
                  <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: '#F0EAD6', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 16px' }}>
                    {beer.style}
                  </p>
                  <div style={{ height: 1, background: `${GOLD}15`, margin: '0 0 14px' }} />
                  <Tag>Sobre o Estilo</Tag>
                  {beer.aboutStyle.map((t, i) => <ShieldItem key={i} text={t} />)}
                </motion.div>

                {/* características vitais */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4, ease: EASE }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}18`, borderRadius: 10, padding: '18px 20px' }}>
                  <Tag>Características Vitais</Tag>
                  <div style={{
                    border: `1px solid ${GOLD}30`,
                    borderRadius: 8,
                    overflow: 'hidden',
                    backgroundColor: `${GOLD}06`,
                  }}>
                    {/* amargor */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${GOLD}20` }}>
                      <div style={{ padding: '12px 16px', borderRight: `1px solid ${GOLD}20`, backgroundColor: `${GOLD}0A`, display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 12, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase' }}>Amargor</span>
                      </div>
                      <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#E0E0E0', letterSpacing: '1px', textTransform: 'uppercase' }}>{beer.ibu.label}</span>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {Array.from({ length: 5 }, (_, i) => <HopIcon key={i} active={i < beer.ibu.filled} />)}
                        </div>
                      </div>
                    </div>
                    {/* teor */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${GOLD}20` }}>
                      <div style={{ padding: '12px 16px', borderRight: `1px solid ${GOLD}20`, backgroundColor: `${GOLD}0A`, display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 12, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase' }}>Teor Alc.</span>
                      </div>
                      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#E0E0E0', letterSpacing: '1px', textTransform: 'uppercase' }}>{beer.abv}</span>
                      </div>
                    </div>
                    {/* temperatura */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                      <div style={{ padding: '12px 16px', borderRight: `1px solid ${GOLD}20`, backgroundColor: `${GOLD}0A`, display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 12, color: GOLD, letterSpacing: '2px', textTransform: 'uppercase' }}>Temp. Ideal</span>
                      </div>
                      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#E0E0E0', letterSpacing: '1px', textTransform: 'uppercase' }}>{beer.temp}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* sensoriais */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}18`, borderRadius: 10, padding: '18px 20px' }}>
                  <Tag>Características Sensoriais</Tag>
                  {beer.sensory.map((t, i) => <ShieldItem key={i} text={t} />)}
                </motion.div>

                {/* copo ideal + harmonização row */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4, ease: EASE }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* copo */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}18`, borderRadius: 10, padding: '16px 14px' }}>
                    <Tag>Copo Ideal</Tag>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', justifyContent: 'center', marginTop: 8 }}>
                      {beer.glasses.map(g => (
                        <div key={g.type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <GlassIcon type={g.type} />
                          <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 10, color: '#E0E0E0', letterSpacing: '2px', textTransform: 'uppercase' }}>{g.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* harmonização */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}18`, borderRadius: 10, padding: '16px 14px' }}>
                    <Tag>Harmonização</Tag>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      {beer.harmonizationShort.map(item => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: GOLD, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: '#E0E0E0', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.3 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* ingredientes */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4, ease: EASE }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}18`, borderRadius: 10, padding: '18px 20px' }}>
                  <Tag>Ingredientes</Tag>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center', marginTop: 8 }}>
                    {beer.ingredients.map(({ label, Icon }) => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 60 }}>
                        <div style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25`, borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon />
                        </div>
                        <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 10, color: '#E0E0E0', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* embalagem */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.4, ease: EASE }}
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}18`, borderRadius: 10, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div>
                    <Tag>Embalagem</Tag>
                    <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, color: '#F0EAD6', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
                      {beer.packaging}
                    </p>
                  </div>
                </motion.div>

              </div>

              {/* bottom gold divider */}
              <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${GOLD}35, transparent)`, marginTop: 28 }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── existing Louvada partnership content ─────────────── */}
      <CervejariaLouvada hideVideo />
    </>
  );
}

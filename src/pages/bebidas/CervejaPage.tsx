import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CervejariaLouvada from '../../components/louvada/CervejariaLouvada';
import apaVideo from '../../assets/ezgif-3f66b04213e14bc8.mp4';

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

function GlassIcon({ type }: { type: 'caldereta' | 'pint' }) {
  const path = type === 'caldereta'
    ? 'M8 5 H28 L25 44 H11 Z'
    : 'M6 5 H30 L28 44 H8 Z';
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
  const [progress, setProgress] = useState(0); // 0→1 driven by video currentTime

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
    v.play().catch(() => {
      /* autoplay blocked — show content immediately */
      setEnded(true);
    });
  }, []);

  return (
    <>
      {/* ── APA section ───────────────────────────────────────── */}
      <section style={{ backgroundColor: BG, position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        {/* ── atmospheric lighting layers ── */}

        {/* Blue fill – adapts position: bottom-left desktop / bottom-center mobile */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? 'radial-gradient(ellipse 100% 35% at 50% 48%, rgba(40,90,255,0.14), transparent 70%)'
            : 'radial-gradient(ellipse 70% 60% at -5% 110%, rgba(40,90,255,0.18), transparent 65%)',
        }} />

        {/* Amber key/rim – top-right desktop / top-center mobile */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? 'radial-gradient(ellipse 110% 50% at 50% -2%, rgba(255,160,40,0.28), transparent 65%)'
            : 'radial-gradient(ellipse 65% 55% at 105% -5%, rgba(255,160,40,0.30), transparent 60%)',
          opacity: 0.10 + progress * 0.90,
          transition: 'opacity 0.35s ease',
        }} />

        {/* Amber haze bloom */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? 'radial-gradient(ellipse 120% 55% at 50% 5%, rgba(255,130,20,0.18), transparent 68%)'
            : 'radial-gradient(ellipse 80% 60% at 90% 5%, rgba(255,130,20,0.20), transparent 65%)',
          opacity: progress,
          transition: 'opacity 0.55s ease',
        }} />

        {/* Floor glow – base reflection: 88% desktop / 46% mobile (vídeo fica no topo da seção) */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? 'radial-gradient(ellipse 80% 8% at 50% 46%, rgba(180,120,40,0.28), transparent 70%)'
            : 'radial-gradient(ellipse 38% 14% at 50% 88%, rgba(180,120,40,0.22), transparent 70%)',
          opacity: 0.3 + progress * 0.70,
          transition: 'opacity 0.5s ease',
        }} />

        {/* Centre lift */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: mobile
            ? 'radial-gradient(ellipse 90% 45% at 50% 25%, rgba(255,155,50,0.05), transparent 70%)'
            : 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(255,155,50,0.04), transparent 70%)',
          opacity: progress,
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: mobile ? '0 20px' : 0 }}>

            {/* estilo */}
            <motion.div custom={0} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideLeft}>
              <Tag>Estilo</Tag>
              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#E0E0E0', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                American Pale Ale
              </p>
            </motion.div>

            {/* sobre o estilo */}
            <motion.div custom={1} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideLeft}>
              <Tag>Sobre o Estilo</Tag>
              <ShieldItem text="Surgiu nos anos 80, em meio à revolução cervejeira dos EUA" />
              <ShieldItem text="Apesar de serem lupuladas, não chegam a ser muito amargas" />
              <ShieldItem text="O estilo está próximo de uma India Pale Ale (IPA), porém a IPA é mais forte e possui lúpulo mais assertivo" />
            </motion.div>

            {/* copo ideal */}
            <motion.div custom={2} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideLeft}
              style={{ border: `1px solid ${GOLD}30`, borderRadius: 6, padding: '14px 18px', backgroundColor: `${GOLD}08` }}>
              <Tag>Copo Ideal</Tag>
              <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <GlassIcon type="caldereta" />
                  <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: '#E0E0E0', letterSpacing: '2px', textTransform: 'uppercase' }}>Caldereta</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <GlassIcon type="pint" />
                  <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: '#E0E0E0', letterSpacing: '2px', textTransform: 'uppercase' }}>Pint</span>
                </div>
              </div>
            </motion.div>

            {/* harmonização */}
            <motion.div custom={3} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideLeft}>
              <Tag>Harmonização</Tag>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {['Queijos Maturados', 'Embutidos', 'Hambúrgueres com Queijos Fortes'].map(item => (
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
              top: 0,
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
                Louvada
              </div>
              <div style={{ fontFamily: "'Teko', sans-serif", fontSize: 'clamp(40px, 8vw, 90px)', fontWeight: 700, color: GOLD, lineHeight: 0.85, letterSpacing: '2px' }}>
                APA
              </div>
            </div>
            <video
              ref={videoRef}
              src={apaVideo}
              muted
              playsInline
              preload="auto"
              onTimeUpdate={() => {
                const v = videoRef.current;
                if (v && v.duration) setProgress(v.currentTime / v.duration);
              }}
              onEnded={() => setEnded(true)}
              style={{
                width: '100%',
                maxHeight: mobile ? '70vh' : '82vh',
                objectFit: 'contain',
                display: 'block',
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
          </div>

          {/* ── RIGHT ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: mobile ? '0 20px' : 0 }}>

            {/* características sensoriais */}
            <motion.div custom={0} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideRight}>
              <Tag>Características Sensoriais</Tag>
              <ShieldItem text="Aromática, marcante e acobreada" />
              <ShieldItem text="Aromas que remetem a frutas tropicais" />
              <ShieldItem text="Cor acobreada" />
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
                      45 IBU – Médio
                    </span>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[true, true, true, true, false].map((active, i) => <HopIcon key={i} active={active} />)}
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
                      5,1% vol
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
                      4–8 °C
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ingredientes */}
            <motion.div custom={2} initial="hidden" animate={ended ? 'visible' : 'hidden'} variants={slideRight}>
              <Tag>Ingredientes</Tag>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {([
                  { label: 'Água',           Icon: WaterIcon },
                  { label: 'Lúpulo',         Icon: HopIngIcon },
                  { label: 'Levedura',       Icon: YeastIcon },
                  { label: 'Malte de Cevada', Icon: MaltIcon },
                ] as { label: string; Icon: React.FC }[]).map(({ label, Icon }) => (
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
                Garrafa 500 ml e Chopp
              </p>
            </motion.div>
          </div>
        </div>

        {/* social handles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ended ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ position: 'absolute', bottom: 20, right: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, zIndex: 6 }}
        >
          <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}70`, letterSpacing: '2px' }}>@CERVEJARIALOUGADA</span>
          <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}70`, letterSpacing: '2px' }}>LOUVADA.COM.BR</span>
        </motion.div>
      </section>

      {/* ── existing Louvada partnership content ─────────────── */}
      <CervejariaLouvada hideVideo />
    </>
  );
}

import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import logoLouvada from '../../assets/cervejaria-louvada.png';
import videoLouvada from '../../assets/cerveja-scroll.mp4';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const LOUVADA_GOLD = '#DFA62B';
const SCROLL_PX_PER_SECOND = 200;

const CODIGOS_HONRA = ['Devoção', 'Honradez', 'Majestade', 'Tradição', 'Parceria', 'Celebração'];

const BEER_TYPES = [
  'Pilsen', 'German Pilsner', 'Hop Lager', 'Vienna', 'Weiss', 'Witbier',
  'APA', 'IPA', 'NEIPA', 'Double NEIPA', 'Porter', 'Benedita Coffee',
  'Catharina Sour Amora e Framboesa', 'Catharina Sour Laranja',
  'Catharina Sour Bergamota', 'Gose Limão', 'Blond Caju', 'Louvada Low',
  'Hop Lager Zero', 'Barley Wine', 'Coffee Pilsen',
];
const BEER_MARQUEE = [...BEER_TYPES, ...BEER_TYPES];

export default function CervejariaLouvada({ hideVideo = false }: { hideVideo?: boolean }) {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [scrollHeight, setScrollHeight] = useState(1600);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const video = videoRef.current;
    if (video && video.duration && isFinite(video.duration)) {
      video.currentTime = Math.max(0, Math.min(progress * video.duration, video.duration));
    }
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onMeta = () => {
      if (video.duration && isFinite(video.duration)) {
        setScrollHeight(Math.ceil(video.duration * SCROLL_PX_PER_SECOND));
      }
      video.play().then(() => video.pause()).catch(() => {});
    };
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();
    return () => video.removeEventListener('loadedmetadata', onMeta);
  }, []);

  return (
    <>
      {!hideVideo && <section
        ref={sectionRef}
        id="cervejaria-louvada"
        style={{ height: `calc(100vh + ${scrollHeight}px)`, position: 'relative', scrollMarginTop: '70px' }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          <video
            ref={videoRef}
            src={videoLouvada}
            muted
            playsInline
            preload="auto"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.75) 100%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              backgroundSize: '200px',
              opacity: 0.03,
              pointerEvents: 'none',
            }}
          />

          {/* Logo + overline */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '80px',
              gap: '12px',
            }}
          >
            <img
              src={logoLouvada}
              alt="Cervejaria Louvada"
              style={{ height: '68px', width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
            <p
              style={{
                fontFamily: "'Teko', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                color: `${LOUVADA_GOLD}CC`,
                margin: 0,
              }}
            >
              Parceiro Oficial · Cuiabá, MT · Desde 2014
            </p>
          </div>

          {/* Slogan */}
          <div
            style={{
              position: 'absolute',
              bottom: '100px',
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '0 24px',
            }}
          >
            <h2
              style={{
                fontFamily: "'Teko', sans-serif",
                fontSize: 'clamp(38px, 6vw, 68px)',
                fontWeight: 600,
                textTransform: 'uppercase',
                lineHeight: 1.0,
                color: '#FFFFFF',
                letterSpacing: '2px',
                textAlign: 'center',
                textShadow: '0 2px 24px rgba(0,0,0,0.7)',
                margin: 0,
              }}
            >
              Honre até o <span style={{ color: LOUVADA_GOLD }}>último gole</span>
            </h2>
            <p
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: '14px',
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '1px',
                margin: 0,
              }}
            >
              Água, malte, lúpulo e honra
            </p>
          </div>

          {/* Beer types marquee */}
          <div
            style={{
              position: 'absolute',
              bottom: '3px',
              left: 0,
              right: 0,
              overflow: 'hidden',
              borderTop: `1px solid ${LOUVADA_GOLD}25`,
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              padding: '8px 0',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '28px',
                whiteSpace: 'nowrap',
                animation: `marquee ${isMobile ? '8s' : '20s'} linear infinite`,
              }}
            >
              {BEER_MARQUEE.map((beer, i) => (
                <span
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    fontFamily: "'Teko', sans-serif",
                    fontSize: '12px',
                    fontWeight: 400,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: `${LOUVADA_GOLD}99`,
                    flexShrink: 0,
                  }}
                >
                  <svg width="6" height="6" viewBox="0 0 6 6" fill={LOUVADA_GOLD} opacity={0.4}>
                    <circle cx="3" cy="3" r="3" />
                  </svg>
                  {beer}
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              width: '100%',
              backgroundColor: LOUVADA_GOLD,
              scaleX: scrollYProgress,
              transformOrigin: 'left center',
            }}
          />

          {/* Scroll hint */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: '48px',
              left: '50%',
              x: '-50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              pointerEvents: 'none',
              opacity: hintOpacity,
            }}
          >
            <p
              style={{
                fontFamily: "'Teko', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: `${LOUVADA_GOLD}80`,
                margin: 0,
              }}
            >
              role para avançar
            </p>
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
              <path
                d="M1 1L7 7L13 1"
                stroke={LOUVADA_GOLD}
                strokeOpacity="0.45"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </div>
      </section>}

      {/* Post-scroll content */}
      {!hideVideo && (
        <section style={{ backgroundColor: '#000', padding: '60px 40px', display: 'flex', justifyContent: 'center' }}>
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            onClick={() => { navigate('/bebidas/cerveja'); window.scrollTo({ top: 0 }); }}
            style={{
              fontFamily: "'Teko', sans-serif",
              fontSize: '20px',
              fontWeight: 400,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: LOUVADA_GOLD,
              backgroundColor: 'transparent',
              border: `1px solid ${LOUVADA_GOLD}`,
              borderRadius: '20px',
              padding: '10px 36px 6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s, color 0.3s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = LOUVADA_GOLD;
              el.style.color = '#000';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = 'transparent';
              el.style.color = LOUVADA_GOLD;
            }}
          >
            Conhecer a Cervejaria Louvada
          </motion.button>
        </section>
      )}
      {hideVideo && <section style={{ backgroundColor: '#000', padding: '90px 40px' }}>
        <motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            maxWidth: '780px',
            margin: '0 auto 64px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${LOUVADA_GOLD}60)` }} />
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L17.5 10H26L19.5 15L22 23L14 18L6 23L8.5 15L2 10H10.5L14 2Z" fill={LOUVADA_GOLD} opacity="0.8" />
          </svg>
          <div style={{ flex: 1, height: '1px', background: `linear-gradient(to left, transparent, ${LOUVADA_GOLD}60)` }} />
        </motion.div>

        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{
              maxWidth: '780px',
              margin: '0 auto 56px',
              padding: '1px',
              border: `1px solid ${LOUVADA_GOLD}30`,
              borderRadius: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#23282D',
                borderRadius: '15px',
                padding: '48px 40px',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    border: `1px solid ${LOUVADA_GOLD}40`,
                    backgroundColor: `${LOUVADA_GOLD}12`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2Z"
                      stroke={LOUVADA_GOLD}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke={LOUVADA_GOLD}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <h3
                style={{
                  fontFamily: "'Teko', sans-serif",
                  fontSize: '32px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                  lineHeight: '32px',
                  marginBottom: '20px',
                  letterSpacing: '1px',
                }}
              >
                Uma parceria fundada na{' '}
                <span style={{ color: LOUVADA_GOLD }}>honra</span>
              </h3>

              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: '16px', color: '#C4C4C4', lineHeight: '28px', marginBottom: '20px' }}>
                A Banca do Dinei e a Cervejaria Louvada compartilham o mesmo código
                de valores: produto artesanal, processo honesto, ingredientes
                selecionados e orgulho regional. Fundada em 2014 em Cuiabá–MT, a
                Louvada construiu sua cavalaria com devoção à qualidade e ao sabor
                genuíno — e é exatamente esse espírito que harmoniza com as nossas
                tábuas de frios, queijos e embutidos.
              </p>

              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: '16px', color: '#C4C4C4', lineHeight: '28px', margin: 0 }}>
                Cada cerveja Louvada foi pensada para elevar momentos — e agora
                você encontra os rótulos selecionados aqui na Banca do Dinei.
                Celebre com honra, brinde com estilo, honre onde estiver.
              </p>
            </div>
          </motion.div>

          {/* Honor codes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '48px' }}
          >
            {CODIGOS_HONRA.map((codigo, i) => (
              <motion.span
                key={codigo}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease: EASE }}
                style={{
                  fontFamily: "'Teko', sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: LOUVADA_GOLD,
                  border: `1px solid ${LOUVADA_GOLD}50`,
                  borderRadius: '20px',
                  padding: '6px 18px 4px',
                  backgroundColor: `${LOUVADA_GOLD}0D`,
                }}
              >
                {codigo}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}
          >
            <a
              href="https://wa.me/5534321220099?text=Ol%C3%A1!%20Vi%20as%20cervejas%20Louvada%20no%20site%20da%20Banca%20do%20Dinei%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20r%C3%B3tulos%20dispon%C3%ADveis."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                fontFamily: "'Teko', sans-serif",
                fontSize: '20px',
                fontWeight: 400,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: LOUVADA_GOLD,
                backgroundColor: 'transparent',
                border: `1px solid ${LOUVADA_GOLD}`,
                borderRadius: '20px',
                padding: '10px 28px 6px',
                textDecoration: 'none',
                transition: 'background-color 0.3s, color 0.3s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = LOUVADA_GOLD;
                el.style.color = '#000000';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = 'transparent';
                el.style.color = LOUVADA_GOLD;
              }}
            >
              Consultar rótulos disponíveis
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            style={{ textAlign: 'center', fontFamily: "'Roboto', sans-serif", fontSize: '12px', color: '#555', letterSpacing: '1px', margin: 0 }}
          >
            Parceria oficial Banca do Dinei × Cervejaria Louvada ·{' '}
            <a
              href="https://louvada.com.br"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: `${LOUVADA_GOLD}80`, textDecoration: 'none' }}
            >
              louvada.com.br
            </a>
          </motion.p>
        </div>
      </section>}
    </>
  );
}

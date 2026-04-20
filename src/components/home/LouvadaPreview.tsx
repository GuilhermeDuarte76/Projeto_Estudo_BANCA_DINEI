import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@phosphor-icons/react';
import logoLouvada from '../../assets/cervejaria-louvada.png';
import { EASE } from '../../lib/motion'

const LOUVADA_GOLD = '#DFA62B';

const CODIGOS_HONRA = ['Devoção', 'Honradez', 'Majestade', 'Tradição', 'Parceria', 'Celebração'];

export default function LouvadaPreview() {
  const navigate = useNavigate();

  return (
    <section
      className="py-20 px-6 lg:px-16 relative overflow-hidden"
      style={{ backgroundColor: '#050505' }}
    >
      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px',
        }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            padding: '1px',
            border: `1px solid ${LOUVADA_GOLD}25`,
            borderRadius: '24px',
          }}
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center rounded-[23px] p-8 lg:p-12"
            style={{ backgroundColor: '#0F0F0F', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
          >
            {/* Left: content */}
            <div className="flex flex-col gap-7">
              {/* Logo + badge */}
              <div className="flex items-center gap-4">
                <img
                  src={logoLouvada}
                  alt="Cervejaria Louvada"
                  className="h-12 w-auto"
                  style={{ filter: 'brightness(0) invert(1) opacity(0.85)' }}
                />
                <span
                  style={{
                    fontFamily: "'Teko', sans-serif",
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: `${LOUVADA_GOLD}90`,
                  }}
                >
                  Parceiro Oficial
                </span>
              </div>

              {/* Heading */}
              <div>
                <h2
                  style={{
                    fontFamily: "'Teko', sans-serif",
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    lineHeight: 1.05,
                    letterSpacing: '1px',
                    marginBottom: '12px',
                  }}
                >
                  Honre até o{' '}
                  <span style={{ color: LOUVADA_GOLD }}>último gole</span>
                </h2>
                <p
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '15px',
                    color: '#888',
                    lineHeight: '26px',
                    maxWidth: '52ch',
                  }}
                >
                  Cervejaria artesanal fundada em 2014 em Cuiabá–MT. Produto honesto,
                  ingredientes selecionados, orgulho regional. Parceira exclusiva da Banca do Dinei.
                </p>
              </div>

              {/* Honor codes */}
              <div className="flex flex-wrap gap-2">
                {CODIGOS_HONRA.map((codigo, i) => (
                  <motion.span
                    key={codigo}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.35, ease: EASE }}
                    style={{
                      fontFamily: "'Teko', sans-serif",
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: LOUVADA_GOLD,
                      border: `1px solid ${LOUVADA_GOLD}40`,
                      borderRadius: '16px',
                      padding: '4px 14px 2px',
                      backgroundColor: `${LOUVADA_GOLD}0A`,
                    }}
                  >
                    {codigo}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Right: CTA card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="flex flex-col items-center lg:items-end gap-4"
            >
              <div
                className="text-center lg:text-right"
                style={{ fontFamily: "'Teko', sans-serif" }}
              >
                <p style={{ fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', color: `${LOUVADA_GOLD}80`, marginBottom: '4px' }}>
                  Cuiabá, MT · Desde 2014
                </p>
                <p style={{ fontSize: '28px', fontWeight: 600, color: '#fff', lineHeight: 1 }}>
                  Cervejaria Louvada
                </p>
              </div>

              <button
                onClick={() => { navigate('/bebidas/cerveja'); window.scrollTo({ top: 0 }); }}
                className="group flex items-center gap-3 font-body font-bold uppercase tracking-wider text-xs px-7 py-3.5 rounded-full transition-all duration-300"
                style={{
                  border: `1px solid ${LOUVADA_GOLD}`,
                  color: LOUVADA_GOLD,
                  backgroundColor: 'transparent',
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
                Descobrir a cervejaria
                <ArrowRightIcon
                  size={13}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

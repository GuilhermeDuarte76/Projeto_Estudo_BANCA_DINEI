import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ShoppingCartIcon, CheckIcon, CrownIcon, TagIcon } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext';
import { type ProdutoPublico } from '../catalogo/ProdutoCard';
import { EASE } from '../../lib/motion'

const GOLD = '#DFA62B';
const PLACEHOLDER = 'https://picsum.photos/seed/cerveja/800/600';

/** Converte **texto** em <strong> inline, preservando o restante como string */
function parseDesc(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#C8B898', fontWeight: 600 }}>{part}</strong>
      : part
  );
}

interface Props {
  produto: ProdutoPublico;
  index: number;
}

export default function CervejaCard({ produto, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const hasDiscount = produto.precoComDesconto < produto.preco;
  const activePromo = produto.promocoes[0];

  const handleAdd = () => {
    addItem({
      id: `produto-${produto.id}`,
      produtoId: produto.id,
      name: produto.nome,
      subtitle: produto.marca
        ? `${produto.marca} · ${produto.unidadeMedida}`
        : produto.unidadeMedida,
      price: produto.precoComDesconto,
      category: produto.categoria,
      promocaoId: activePromo?.id ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: EASE }}
      className="group relative"
      style={{
        borderRadius: 12,
        border: `1px solid ${produto.destaque ? `${GOLD}38` : `${GOLD}18`}`,
        backgroundColor: produto.destaque ? `${GOLD}07` : `${GOLD}04`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.3s ease',
      }}
      whileHover={{ borderColor: produto.destaque ? `${GOLD}65` : `${GOLD}38` }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(to right, transparent, ${GOLD}${produto.destaque ? '70' : '40'}, transparent)`,
      }} />

      {/* Image */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={produto.imagemUrl || PLACEHOLDER}
          alt={produto.nome}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />
        {/* Dark gradient — heavier at bottom for text legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.10) 75%, transparent 100%)',
        }} />

        {/* Destaque badge */}
        {produto.destaque && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 4,
            background: `linear-gradient(135deg, ${GOLD}, #C8920A)`,
            borderRadius: 20, padding: '3px 9px',
          }}>
            <CrownIcon size={9} weight="fill" color="#1A0A00" />
            <span style={{
              fontFamily: "'Teko', sans-serif",
              fontSize: 9, fontWeight: 600,
              color: '#1A0A00',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              Destaque
            </span>
          </div>
        )}

        {/* Oferta badge */}
        {hasDiscount && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(107,26,26,0.9)',
            border: '1px solid rgba(139,42,42,0.7)',
            borderRadius: 20, padding: '2px 8px',
          }}>
            <TagIcon size={9} weight="fill" color="#E8C0B0" />
            <span style={{
              fontFamily: "'Teko', sans-serif",
              fontSize: 9, fontWeight: 600,
              color: '#E8C0B0',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              Oferta
            </span>
          </div>
        )}

        {/* Brand + Name overlaid on image */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 14px 14px',
        }}>
          {produto.marca && (
            <span style={{
              display: 'block',
              fontFamily: "'Teko', sans-serif",
              fontSize: 10,
              color: GOLD,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              textShadow: '0 1px 6px rgba(0,0,0,0.9)',
              marginBottom: 3,
            }}>
              {produto.marca}
            </span>
          )}
          <p style={{
            fontFamily: "'Teko', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.05,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: 0,
            textShadow: '0 2px 10px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {produto.nome}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>

        {/* Description */}
        <p style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: 12,
          color: '#8A7A72',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {parseDesc(produto.descricao)}
        </p>

        {/* Active promo */}
        {activePromo && (
          <div style={{
            border: '1px solid rgba(139,42,42,0.35)',
            backgroundColor: 'rgba(107,26,26,0.15)',
            borderRadius: 5,
            padding: '5px 9px',
          }}>
            <p style={{
              fontFamily: "'Teko', sans-serif",
              fontSize: 9,
              color: '#C08080',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              {activePromo.nome}
            </p>
          </div>
        )}

        {/* Pricing */}
        <div style={{
          borderTop: `1px solid ${GOLD}15`,
          paddingTop: 10,
          marginTop: 'auto',
        }}>
          {hasDiscount && (
            <p style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 11,
              color: '#5A4A42',
              textDecoration: 'line-through',
              margin: '0 0 1px',
            }}>
              R$ {produto.preco.toFixed(2).replace('.', ',')}
            </p>
          )}
          <p style={{
            fontFamily: "'Teko', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: GOLD,
            lineHeight: 1,
            margin: 0,
            letterSpacing: '1px',
          }}>
            R$ {produto.precoComDesconto.toFixed(2).replace('.', ',')}
          </p>
          <p style={{
            fontFamily: "'Teko', sans-serif",
            fontSize: 9,
            color: `${GOLD}50`,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: '3px 0 0',
          }}>
            {produto.unidadeMedida}
          </p>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          aria-label={`Adicionar ${produto.nome} ao carrinho`}
          style={{
            width: '100%',
            padding: '9px 0',
            border: `1px solid ${added ? GOLD : `${GOLD}38`}`,
            borderRadius: 6,
            backgroundColor: added ? `${GOLD}20` : 'transparent',
            color: added ? GOLD : `${GOLD}75`,
            fontFamily: "'Teko', sans-serif",
            fontSize: 11,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onPointerEnter={(e) => {
            if (!added) {
              e.currentTarget.style.borderColor = `${GOLD}75`;
              e.currentTarget.style.backgroundColor = `${GOLD}10`;
              e.currentTarget.style.color = GOLD;
            }
          }}
          onPointerLeave={(e) => {
            if (!added) {
              e.currentTarget.style.borderColor = `${GOLD}38`;
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = `${GOLD}75`;
            }
          }}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <CheckIcon size={11} weight="bold" />
                Adicionado
              </motion.span>
            ) : (
              <motion.span
                key="cart"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ShoppingCartIcon size={11} weight="fill" />
                Adicionar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}

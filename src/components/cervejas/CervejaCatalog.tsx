import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, StarIcon, XIcon, CaretDownIcon } from '@phosphor-icons/react';
import { apiFetch } from '../../services/api';
import { type ProdutoPublico } from '../catalogo/ProdutoCard';
import CervejaCard from './CervejaCard';

const GOLD = '#DFA62B';
const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type OrdenarPor = 'nome' | 'preco' | 'criadoEm';
type Ordem = 'asc' | 'desc';

interface SortOption {
  label: string;
  ordenarPor: OrdenarPor;
  ordem: Ordem;
}

const SORT_OPTIONS: SortOption[] = [
  { label: 'Mais recentes', ordenarPor: 'criadoEm', ordem: 'desc' },
  { label: 'Nome A–Z',      ordenarPor: 'nome',     ordem: 'asc'  },
  { label: 'Nome Z–A',      ordenarPor: 'nome',     ordem: 'desc' },
  { label: 'Menor preço',   ordenarPor: 'preco',    ordem: 'asc'  },
  { label: 'Maior preço',   ordenarPor: 'preco',    ordem: 'desc' },
];

type PopoverId = 'sort' | 'marca' | 'preco';

/* ── popover trigger button ─────────────────────────────────── */
function PopoverButton({
  label,
  isActive,
  isOpen,
  onClick,
  fullWidth,
}: {
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: fullWidth ? '100%' : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: fullWidth ? 'space-between' : undefined,
        gap: 6,
        height: 42,
        padding: '0 14px',
        background: isActive || isOpen ? `${GOLD}15` : `${GOLD}06`,
        border: `1px solid ${isActive || isOpen ? `${GOLD}60` : `${GOLD}22`}`,
        borderRadius: 6,
        color: isActive || isOpen ? GOLD : `${GOLD}65`,
        fontFamily: "'Teko', sans-serif",
        fontSize: 11,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
      onPointerEnter={(e) => {
        if (!isActive && !isOpen) {
          e.currentTarget.style.borderColor = `${GOLD}45`;
          e.currentTarget.style.color = `${GOLD}85`;
        }
      }}
      onPointerLeave={(e) => {
        if (!isActive && !isOpen) {
          e.currentTarget.style.borderColor = `${GOLD}22`;
          e.currentTarget.style.color = `${GOLD}65`;
        }
      }}
    >
      {label}
      <CaretDownIcon
        size={10}
        weight="bold"
        style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          opacity: 0.7,
        }}
      />
    </button>
  );
}

/* ── popover panel ──────────────────────────────────────────── */
function PopoverPanel({
  children,
  alignRight = false,
  fixedPos,
}: {
  children: React.ReactNode;
  alignRight?: boolean;
  fixedPos?: { top: number; left: number; maxWidth: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        position: fixedPos ? 'fixed' : 'absolute',
        top: fixedPos ? fixedPos.top : 'calc(100% + 8px)',
        ...(fixedPos
          ? { left: fixedPos.left }
          : alignRight ? { right: 0 } : { left: 0 }),
        zIndex: 9999,
        minWidth: 200,
        maxWidth: fixedPos ? fixedPos.maxWidth : 'min(280px, calc(100vw - 48px))',
        background: '#0D0A07',
        border: `1px solid ${GOLD}30`,
        borderRadius: 8,
        padding: '8px',
        boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px ${GOLD}08`,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── popover option row ─────────────────────────────────────── */
function PopoverOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 10px',
        background: active ? `${GOLD}12` : 'transparent',
        border: 'none',
        borderRadius: 5,
        color: active ? GOLD : `${GOLD}65`,
        fontFamily: "'Teko', sans-serif",
        fontSize: 11,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
      onPointerEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = `${GOLD}08`;
          e.currentTarget.style.color = `${GOLD}85`;
        }
      }}
      onPointerLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = `${GOLD}65`;
        }
      }}
    >
      {/* active dot */}
      <span style={{
        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
        background: active ? GOLD : `${GOLD}25`,
        transition: 'background 0.15s',
      }} />
      {label}
    </button>
  );
}

/* ── main component ─────────────────────────────────────────── */
export default function CervejaCatalog() {
  /* responsive */
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* pagination */
  const [produtos, setProdutos] = useState<ProdutoPublico[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* filters */
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('');
  const [destaque, setDestaque] = useState(false);
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [precoMinDebounced, setPrecoMinDebounced] = useState('');
  const [precoMaxDebounced, setPrecoMaxDebounced] = useState('');
  const [sortIdx, setSortIdx] = useState(0);

  /* popover state */
  const [openPopover, setOpenPopover] = useState<PopoverId | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; maxWidth: number } | null>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const marcaRef = useRef<HTMLDivElement>(null);
  const precoRef = useRef<HTMLDivElement>(null);

  /* available marcas */
  const [availableMarcas, setAvailableMarcas] = useState<string[]>([]);

  /* close popover on outside click */
  useEffect(() => {
    if (!openPopover) return;
    const handler = (e: MouseEvent) => {
      if (filterRowRef.current && !filterRowRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
        setPopoverPos(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openPopover]);

  const togglePopover = (id: PopoverId, triggerRef?: React.RefObject<HTMLDivElement>) => {
    setOpenPopover((cur) => {
      if (cur === id) {
        setPopoverPos(null);
        return null;
      }
      if (mobile && triggerRef?.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const maxW = Math.min(280, window.innerWidth - 24);
        let left = rect.left;
        if (left + maxW > window.innerWidth - 12) left = window.innerWidth - maxW - 12;
        setPopoverPos({ top: rect.bottom + 8, left, maxWidth: maxW });
      } else {
        setPopoverPos(null);
      }
      return id;
    });
  };

  /* debounce busca */
  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca), 400);
    return () => clearTimeout(t);
  }, [busca]);

  /* debounce precos */
  useEffect(() => {
    const t = setTimeout(() => setPrecoMinDebounced(precoMin), 500);
    return () => clearTimeout(t);
  }, [precoMin]);
  useEffect(() => {
    const t = setTimeout(() => setPrecoMaxDebounced(precoMax), 500);
    return () => clearTimeout(t);
  }, [precoMax]);

  /* reset page on filter change */
  useEffect(() => {
    setPage(1);
  }, [buscaDebounced, marcaFilter, destaque, precoMinDebounced, precoMaxDebounced, sortIdx]);

  /* discovery fetch for marcas */
  useEffect(() => {
    const params = new URLSearchParams({ categoria: 'Cervejas', pageSize: '100' });
    apiFetch<PagedResult<ProdutoPublico>>(`/api/produtos?${params}`)
      .then((res) => {
        if (res.success) {
          const marcas = [
            ...new Set(res.data.items.map((p) => p.marca).filter((m): m is string => !!m)),
          ].sort();
          setAvailableMarcas(marcas);
        }
      })
      .catch(() => {});
  }, []);

  /* main fetch */
  useEffect(() => {
    setLoading(true);
    setError(null);

    const sort = SORT_OPTIONS[sortIdx];
    const params = new URLSearchParams({
      categoria: 'Cervejas',
      page: String(page),
      pageSize: '20',
      ordenarPor: sort.ordenarPor,
      ordem: sort.ordem,
    });
    if (buscaDebounced)    params.set('busca',    buscaDebounced);
    if (marcaFilter)       params.set('marca',    marcaFilter);
    if (destaque)          params.set('destaque', 'true');
    if (precoMinDebounced) params.set('precoMin', precoMinDebounced);
    if (precoMaxDebounced) params.set('precoMax', precoMaxDebounced);

    apiFetch<PagedResult<ProdutoPublico>>(`/api/produtos?${params}`)
      .then((res) => {
        if (res.success) {
          setProdutos(res.data.items);
          setTotalPages(res.data.totalPages);
          setTotalCount(res.data.totalCount);
        } else {
          setError(res.message || 'Erro ao carregar produtos.');
        }
      })
      .catch(() => setError('Erro de conexão com o servidor.'))
      .finally(() => setLoading(false));
  }, [page, buscaDebounced, marcaFilter, destaque, precoMinDebounced, precoMaxDebounced, sortIdx]);

  /* derived labels for buttons */
  const sortLabel   = sortIdx === 0 ? 'Ordenar' : SORT_OPTIONS[sortIdx].label;
  const marcaLabel  = marcaFilter || 'Marca';
  const precoLabel  = precoMin && precoMax
    ? `R$${precoMin}–${precoMax}`
    : precoMin  ? `≥ R$${precoMin}`
    : precoMax  ? `≤ R$${precoMax}`
    : 'Preço';

  const hasFilters = !!(busca || marcaFilter || destaque || precoMin || precoMax || sortIdx !== 0);

  const clearFilters = () => {
    setBusca(''); setBuscaDebounced('');
    setMarcaFilter('');
    setDestaque(false);
    setPrecoMin(''); setPrecoMax('');
    setPrecoMinDebounced(''); setPrecoMaxDebounced('');
    setSortIdx(0);
    setPage(1);
    setOpenPopover(null);
    setPopoverPos(null);
  };

  /* ── render ── */
  return (
    <section style={{
      backgroundColor: '#050302',
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(56px, 8vw, 96px) clamp(24px, 5vw, 72px)',
    }}>
      {/* decorators */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(to right, transparent, ${GOLD}35, transparent)` }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '35%', background: `radial-gradient(ellipse 60% 60% at 50% 0%, ${GOLD}0A, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: '180px', opacity: 0.025 }} />

      <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ marginBottom: 36 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <svg width="13" height="15" viewBox="0 0 14 16" fill="none">
              <path d="M7 1.5L1.5 4v4.5c0 3.5 2.3 6.5 5.5 7 3.2-.5 5.5-3.5 5.5-7V4L7 1.5Z" stroke={GOLD} strokeWidth="1.2" fill={`${GOLD}20`} />
            </svg>
            <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}65`, letterSpacing: '4px', textTransform: 'uppercase' }}>
              Artesanais · Louvada
            </span>
          </div>
          <h2 style={{ fontFamily: "'Teko', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: '#E8E0D0', lineHeight: 0.9, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 14px' }}>
            Nossas <span style={{ color: GOLD }}>Cervejas</span>
          </h2>
          <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: '#6A5A52', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, maxWidth: 480, lineHeight: 1.7 }}>
            Rótulos exclusivos produzidos com ingredientes selecionados.
            Do chopp artesanal à garrafa especial.
          </p>
        </motion.div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: `linear-gradient(to right, ${GOLD}30, transparent)`, marginBottom: 28 }} />

        {/* ── Filter row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          style={{ marginBottom: 20 }}
        >
          <div ref={filterRowRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* ── Row 1: Search (full width always) ── */}
            <div style={{ position: 'relative', height: 42 }}>
              <MagnifyingGlassIcon
                size={14} weight="regular" color={`${GOLD}55`}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{
                  width: '100%', height: '100%',
                  padding: '0 36px 0 34px',
                  background: `${GOLD}06`,
                  border: `1px solid ${GOLD}22`,
                  borderRadius: 6,
                  color: '#E8E0D0',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = `${GOLD}60`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = `${GOLD}22`; }}
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: `${GOLD}50`, display: 'flex' }}
                >
                  <XIcon size={12} weight="bold" />
                </button>
              )}
            </div>

            {/* ── Row 2: Filter / sort buttons ── */}
            <div
              style={mobile ? {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              } : {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {/* Destaques toggle */}
              <button
                onClick={() => setDestaque((d) => !d)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: mobile ? 'space-between' : undefined, gap: 6,
                  width: mobile ? '100%' : undefined,
                  flexShrink: 0,
                  height: 42, padding: '0 14px',
                  background: destaque ? `${GOLD}15` : `${GOLD}06`,
                  border: `1px solid ${destaque ? `${GOLD}60` : `${GOLD}22`}`,
                  borderRadius: 6,
                  color: destaque ? GOLD : `${GOLD}65`,
                  fontFamily: "'Teko', sans-serif", fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                }}
                onPointerEnter={(e) => { if (!destaque) { e.currentTarget.style.borderColor = `${GOLD}45`; e.currentTarget.style.color = `${GOLD}85`; } }}
                onPointerLeave={(e) => { if (!destaque) { e.currentTarget.style.borderColor = `${GOLD}22`; e.currentTarget.style.color = `${GOLD}65`; } }}
              >
                <StarIcon size={10} weight={destaque ? 'fill' : 'regular'} />
                Destaques
              </button>

              {/* separator (desktop only) */}
              {!mobile && <div style={{ flexShrink: 0, width: 1, height: 22, background: `${GOLD}20` }} />}

              {/* ── Ordenar popover ── */}
              <div ref={sortRef} style={{ position: 'relative', flexShrink: 0, height: 42, width: mobile ? '100%' : undefined }}>
                <PopoverButton
                  label={sortLabel}
                  isActive={sortIdx !== 0}
                  isOpen={openPopover === 'sort'}
                  onClick={() => togglePopover('sort', sortRef)}
                  fullWidth={mobile}
                />
                <AnimatePresence>
                  {openPopover === 'sort' && (
                    <PopoverPanel fixedPos={mobile ? popoverPos ?? undefined : undefined}>
                      {SORT_OPTIONS.map((opt, i) => (
                        <PopoverOption
                          key={i}
                          label={opt.label}
                          active={sortIdx === i}
                          onClick={() => { setSortIdx(i); setOpenPopover(null); setPopoverPos(null); }}
                        />
                      ))}
                    </PopoverPanel>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Marca popover ── */}
              <div ref={marcaRef} style={{ position: 'relative', flexShrink: 0, height: 42, width: mobile ? '100%' : undefined }}>
                <PopoverButton
                  label={marcaLabel}
                  isActive={marcaFilter !== ''}
                  isOpen={openPopover === 'marca'}
                  onClick={() => togglePopover('marca', marcaRef)}
                  fullWidth={mobile}
                />
                <AnimatePresence>
                  {openPopover === 'marca' && (
                    <PopoverPanel fixedPos={mobile ? popoverPos ?? undefined : undefined}>
                      <PopoverOption
                        label="Todas as marcas"
                        active={marcaFilter === ''}
                        onClick={() => { setMarcaFilter(''); setOpenPopover(null); setPopoverPos(null); }}
                      />
                      {availableMarcas.length > 0 && (
                        <div style={{ height: 1, background: `${GOLD}15`, margin: '4px 0' }} />
                      )}
                      {availableMarcas.map((marca) => (
                        <PopoverOption
                          key={marca}
                          label={marca}
                          active={marcaFilter === marca}
                          onClick={() => { setMarcaFilter(marca); setOpenPopover(null); setPopoverPos(null); }}
                        />
                      ))}
                      {availableMarcas.length === 0 && (
                        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: `${GOLD}40`, padding: '4px 10px', margin: 0 }}>
                          Carregando...
                        </p>
                      )}
                    </PopoverPanel>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Preço popover ── */}
              <div ref={precoRef} style={{ position: 'relative', flexShrink: 0, height: 42, width: mobile ? '100%' : undefined }}>
                <PopoverButton
                  label={precoLabel}
                  isActive={!!(precoMin || precoMax)}
                  isOpen={openPopover === 'preco'}
                  onClick={() => togglePopover('preco', precoRef)}
                  fullWidth={mobile}
                />
                <AnimatePresence>
                  {openPopover === 'preco' && (
                    <PopoverPanel alignRight={!mobile} fixedPos={mobile ? popoverPos ?? undefined : undefined}>
                      <p style={{ fontFamily: "'Teko', sans-serif", fontSize: 9, color: `${GOLD}55`, letterSpacing: '3px', textTransform: 'uppercase', margin: '4px 10px 10px' }}>
                        Faixa de preço
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 4px 4px' }}>
                        <div>
                          <label style={{ fontFamily: "'Teko', sans-serif", fontSize: 9, color: `${GOLD}50`, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>De</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Teko', sans-serif", fontSize: 10, color: `${GOLD}50`, pointerEvents: 'none' }}>R$</span>
                            <input
                              type="number" min="0" placeholder="0,00"
                              value={precoMin}
                              onChange={(e) => setPrecoMin(e.target.value)}
                              style={{ width: '100%', padding: '7px 10px 7px 28px', background: `${GOLD}08`, border: `1px solid ${GOLD}22`, borderRadius: 5, color: '#E8E0D0', fontFamily: "'Roboto', sans-serif", fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = `${GOLD}60`; }}
                              onBlur={(e) => { e.currentTarget.style.borderColor = `${GOLD}22`; }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontFamily: "'Teko', sans-serif", fontSize: 9, color: `${GOLD}50`, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Até</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Teko', sans-serif", fontSize: 10, color: `${GOLD}50`, pointerEvents: 'none' }}>R$</span>
                            <input
                              type="number" min="0" placeholder="999,99"
                              value={precoMax}
                              onChange={(e) => setPrecoMax(e.target.value)}
                              style={{ width: '100%', padding: '7px 10px 7px 28px', background: `${GOLD}08`, border: `1px solid ${GOLD}22`, borderRadius: 5, color: '#E8E0D0', fontFamily: "'Roboto', sans-serif", fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = `${GOLD}60`; }}
                              onBlur={(e) => { e.currentTarget.style.borderColor = `${GOLD}22`; }}
                            />
                          </div>
                        </div>
                        {(precoMin || precoMax) && (
                          <button
                            onClick={() => { setPrecoMin(''); setPrecoMax(''); }}
                            style={{ width: '100%', padding: '6px 0', background: 'none', border: `1px solid ${GOLD}20`, borderRadius: 4, color: `${GOLD}55`, fontFamily: "'Teko', sans-serif", fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                            onPointerEnter={(e) => { e.currentTarget.style.borderColor = `${GOLD}45`; e.currentTarget.style.color = GOLD; }}
                            onPointerLeave={(e) => { e.currentTarget.style.borderColor = `${GOLD}20`; e.currentTarget.style.color = `${GOLD}55`; }}
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </PopoverPanel>
                  )}
                </AnimatePresence>
              </div>

            </div>{/* end buttons row */}
          </div>{/* end filter col */}
        </motion.div>

        {/* ── Results count + clear all ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={totalCount}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}45`, letterSpacing: '2px', margin: 0 }}
            >
              {loading ? '—' : `${totalCount} ${totalCount === 1 ? 'produto encontrado' : 'produtos encontrados'}`}
            </motion.p>
          </AnimatePresence>

          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: `1px solid ${GOLD}25`,
                borderRadius: 20, padding: '4px 12px',
                color: `${GOLD}65`,
                fontFamily: "'Teko', sans-serif", fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onPointerEnter={(e) => { e.currentTarget.style.borderColor = `${GOLD}55`; e.currentTarget.style.color = GOLD; }}
              onPointerLeave={(e) => { e.currentTarget.style.borderColor = `${GOLD}25`; e.currentTarget.style.color = `${GOLD}65`; }}
            >
              <XIcon size={9} weight="bold" />
              Limpar filtros
            </button>
          )}
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse" style={{ height: 340, borderRadius: 12, border: `1px solid ${GOLD}10`, backgroundColor: `${GOLD}04` }} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, color: '#6A5A52', letterSpacing: '1px', textTransform: 'uppercase' }}>{error}</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && produtos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, color: '#6A5A52', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Nenhum produto encontrado para os filtros aplicados.
            </p>
            {hasFilters && (
              <button onClick={clearFilters} style={{ marginTop: 16, background: 'none', border: `1px solid ${GOLD}30`, borderRadius: 20, padding: '8px 20px', color: `${GOLD}70`, fontFamily: "'Teko', sans-serif", fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer' }}>
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && produtos.length > 0 && (
          <>
            <motion.div
              key={`${page}-${buscaDebounced}-${marcaFilter}-${destaque}-${sortIdx}-${precoMinDebounced}-${precoMaxDebounced}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}
            >
              {produtos.map((produto, i) => (
                <CervejaCard key={produto.id} produto={produto} index={i} />
              ))}
            </motion.div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 48 }}>
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={{ padding: '8px 20px', borderRadius: 20, border: `1px solid ${GOLD}30`, backgroundColor: 'transparent', color: `${GOLD}70`, fontFamily: "'Teko', sans-serif", fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.3 : 1, transition: 'all 0.2s ease' }}>
                  Anterior
                </button>
                <span style={{ fontFamily: "'Teko', sans-serif", fontSize: 11, color: `${GOLD}45`, letterSpacing: '2px' }}>
                  {page} / {totalPages}
                </span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: '8px 20px', borderRadius: 20, border: `1px solid ${GOLD}30`, backgroundColor: 'transparent', color: `${GOLD}70`, fontFamily: "'Teko', sans-serif", fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.3 : 1, transition: 'all 0.2s ease' }}>
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

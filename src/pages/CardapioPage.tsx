import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BeerBottleIcon,
  WineIcon,
  BeerSteinIcon,
  BrandyIcon,
  BreadIcon,
  ForkKnifeIcon,
  CakeIcon,
  FireIcon,
  HamburgerIcon,
  ArrowDownIcon,
} from '@phosphor-icons/react'
import { apiFetch } from '../services/api'
import CardapioLayout from '../components/cardapio/CardapioLayout'
import CardapioHeader from '../components/cardapio/CardapioHeader'
import CardapioTabBar from '../components/cardapio/CardapioTabBar'
import CardapioSection, { type CardapioProduct } from '../components/cardapio/CardapioSection'
import CardapioSkeleton from '../components/cardapio/CardapioSkeleton'
import { EASE } from '../lib/motion'

const S = 15

const CATEGORIAS = [
  { id: 'chopps',      label: 'Chopps',     icon: <BeerSteinIcon      size={S} />, categoria: 'Chopps' },
  { id: 'cervejas',    label: 'Cervejas',   icon: <BeerBottleIcon size={S} />, categoria: 'Cervejas' },
  { id: 'espetos',     label: 'Espetos',    icon: <FireIcon       size={S} />, categoria: 'Espetos' },
  { id: 'sanduiches',  label: 'Sanduíches', icon: <HamburgerIcon      size={S} />, categoria: 'Sanduíches' },
  { id: 'salgados',    label: 'Salgados',   icon: <BreadIcon     size={S} />, categoria: 'Salgados' },
  { id: 'petiscos',    label: 'Petiscos',   icon: <ForkKnifeIcon  size={S} />, categoria: 'Petiscos' },
  { id: 'vinhos',      label: 'Vinhos',     icon: <WineIcon       size={S} />, categoria: 'Vinhos' },
  { id: 'bebidas',     label: 'Bebidas',    icon: <BrandyIcon       size={S} />, categoria: 'Bebidas' },
  { id: 'sobremesas',  label: 'Sobremesas', icon: <CakeIcon       size={S} />, categoria: 'Sobremesas' },
] as const

type CatId = (typeof CATEGORIAS)[number]['id']

export default function CardapioPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [grouped, setGrouped] = useState<Record<string, CardapioProduct[]>>({})
  const [activeTab, setActiveTab] = useState<CatId>('sanduiches')
  const [atBottom, setAtBottom] = useState(false)
  const [overscrollProgress, setOverscrollProgress] = useState(0)
  const overscrollRef = useRef(0)
  const THRESHOLD = 160

  useEffect(() => {
    document.title = 'Cardápio — Banca do Dinei'
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const created = !meta
    if (created) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta!.content = 'noindex, nofollow'
    return () => {
      document.title = 'Banca do Dinei'
      if (created && meta?.parentNode) meta.parentNode.removeChild(meta)
      else if (meta) meta.content = 'index, follow'
    }
  }, [])

  useEffect(() => {
    apiFetch<CardapioProduct[]>('/api/cardapio')
      .then((res) => {
        if (!res.success || !Array.isArray(res.data)) { setError(true); return }
        const acc: Record<string, CardapioProduct[]> = {}
        for (const p of res.data) {
          if (!acc[p.categoria]) acc[p.categoria] = []
          acc[p.categoria].push(p)
        }
        setGrouped(acc)
        const first = CATEGORIAS.find((c) => (acc[c.categoria] ?? []).length > 0)
        if (first) setActiveTab(first.id as CatId)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const visibleTabs = CATEGORIAS.filter(
    (c) => loading || (grouped[c.categoria] ?? []).length > 0
  )

  const handleTabChange = useCallback((id: string, source: 'manual' | 'overscroll' = 'manual') => {
    overscrollRef.current = 0
    setOverscrollProgress(0)
    setActiveTab(id as CatId)
    setAtBottom(false)

    if (source === 'overscroll') {
      window.scrollTo({ top: 0, behavior: 'auto' })
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
      })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const activeCategory = CATEGORIAS.find((c) => c.id === activeTab)
  const activeProdutos = activeCategory ? (grouped[activeCategory.categoria] ?? []) : []

  const activeIndex = visibleTabs.findIndex((c) => c.id === activeTab)
  const nextTab = visibleTabs[activeIndex + 1] ?? null

  useEffect(() => {
    const onScroll = () => {
      const reached = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80
      if (!reached) {
        overscrollRef.current = 0
        setOverscrollProgress(0)
      }
      setAtBottom(reached)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Overscroll via mouse wheel
  useEffect(() => {
    if (!atBottom || !nextTab) return
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY <= 0) {
        overscrollRef.current = Math.max(0, overscrollRef.current - e.deltaY * 0.5)
        setOverscrollProgress(overscrollRef.current / THRESHOLD)
        return
      }
      overscrollRef.current = Math.min(overscrollRef.current + e.deltaY, THRESHOLD)
      setOverscrollProgress(overscrollRef.current / THRESHOLD)
      if (overscrollRef.current >= THRESHOLD) {
        overscrollRef.current = 0
        setOverscrollProgress(0)
        handleTabChange(nextTab.id, 'overscroll')
      }
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [atBottom, nextTab, handleTabChange, THRESHOLD])

  // Overscroll via touch (mobile)
  useEffect(() => {
    if (!atBottom || !nextTab) return
    let lastY = 0
    const onTouchStart = (e: TouchEvent) => { lastY = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => {
      const dy = lastY - e.touches[0].clientY
      lastY = e.touches[0].clientY
      if (dy <= 0) return
      overscrollRef.current = Math.min(overscrollRef.current + dy * 1.2, THRESHOLD)
      setOverscrollProgress(overscrollRef.current / THRESHOLD)
      if (overscrollRef.current >= THRESHOLD) {
        overscrollRef.current = 0
        setOverscrollProgress(0)
        handleTabChange(nextTab.id, 'overscroll')
      }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [atBottom, nextTab, handleTabChange, THRESHOLD])

  return (
    <CardapioLayout>
      <CardapioHeader />
      <CardapioTabBar
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <main className="px-4 sm:px-6 pb-16 pt-6 max-w-3xl mx-auto min-h-[60vh]">
        {loading && <CardapioSkeleton />}

        {!loading && error && (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p
              className="text-[10px] tracking-[4px] uppercase mb-3"
              style={{ fontFamily: "'Teko', sans-serif", color: 'rgba(223,166,43,0.50)' }}
            >
              Indisponível
            </p>
            <p className="font-display text-[#F5F0E8]/55 text-base">
              Cardápio temporariamente indisponível.
            </p>
            <p className="font-subtitle italic text-[#F5F0E8]/32 text-sm mt-1">
              Tente novamente em instantes.
            </p>
          </motion.div>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {activeProdutos.length > 0 ? (
                <CardapioSection
                  titulo={activeCategory?.label ?? ''}
                  produtos={activeProdutos}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p
                    className="text-[10px] tracking-[4px] uppercase mb-2"
                    style={{ fontFamily: "'Teko', sans-serif", color: 'rgba(223,166,43,0.38)' }}
                  >
                    Em breve
                  </p>
                  <p className="font-display text-[#F5F0E8]/40 text-sm">
                    Nenhum item disponível nesta categoria.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && !error && (
          <motion.div
            className="mt-14 flex flex-col items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <div
              className="h-px w-20"
              style={{ background: 'linear-gradient(to right, transparent, rgba(223,166,43,0.35), transparent)' }}
            />
            <span
              className="text-[9px] tracking-[3px] uppercase"
              style={{ fontFamily: "'Teko', sans-serif", color: 'rgba(223,166,43,0.30)' }}
            >
              Banca do Dinei · Uberlândia
            </span>
          </motion.div>
        )}
      </main>

      {/* Floating next-category badge */}
      <AnimatePresence>
        {atBottom && nextTab && !loading && !error && (
          <motion.div
            key="next-badge"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed bottom-8 inset-x-0 flex justify-center z-50 pointer-events-none"
          >
            <button
              type="button"
              onClick={() => handleTabChange(nextTab.id)}
              className="pointer-events-auto flex flex-col items-center gap-1.5 cursor-pointer"
            >
              {/* Label */}
              <span
                className="text-[9px] tracking-[3px] uppercase"
                style={{ fontFamily: "'Teko', sans-serif", color: 'rgba(223,166,43,0.55)' }}
              >
                role para avançar
              </span>

              {/* Pill */}
              <div
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border"
                style={{
                  backgroundColor: 'rgba(6,6,6,0.90)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderColor: 'rgba(223,166,43,0.30)',
                  boxShadow: '0 0 32px 4px rgba(223,166,43,0.10), inset 0 0 0 1px rgba(223,166,43,0.06)',
                  color: '#DFA62B',
                }}
              >
                <span className="flex items-center" style={{ color: '#DFA62B' }}>{nextTab.icon}</span>
                <span
                  className="text-[12px] tracking-[2.5px] uppercase"
                  style={{ fontFamily: "'Teko', sans-serif", color: '#F5F0E8', lineHeight: 1 }}
                >
                  {nextTab.label}
                </span>
              </div>

              {/* Overscroll progress bar */}
              <div
                className="w-24 h-px rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(223,166,43,0.15)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${overscrollProgress * 100}%`,
                    backgroundColor: '#DFA62B',
                    boxShadow: overscrollProgress > 0 ? '0 0 6px 1px rgba(223,166,43,0.5)' : 'none',
                  }}
                />
              </div>

              {/* Arrow */}
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ color: 'rgba(223,166,43,0.45)', display: 'flex' }}
              >
                <ArrowDownIcon size={13} />
              </motion.span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </CardapioLayout>
  )
}

import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

interface Props {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
}

export default function CardapioTabBar({ tabs, activeTab, onTabChange }: Props) {
  return (
    /* top-[65px] = header h-16 (64px) + shimmer border (1px) */
    <div
      className="sticky top-[65px] z-40 border-b"
      style={{
        backgroundColor: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(223,166,43,0.12)',
      }}
    >
      <motion.div
        className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] max-w-3xl mx-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              type="button"
              variants={fadeUp}
              whileTap={{ scale: 0.92 }}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-3 sm:px-4 py-2.5 cursor-pointer whitespace-nowrap flex-shrink-0 border-b-2 transition-colors duration-200"
              style={{
                borderBottomColor: isActive ? '#DFA62B' : 'transparent',
                color: isActive ? '#DFA62B' : 'rgba(245,240,232,0.35)',
              }}
              onPointerEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'rgba(245,240,232,0.62)'
              }}
              onPointerLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'rgba(245,240,232,0.35)'
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="tabGlow"
                  className="absolute inset-x-1 bottom-[-2px] h-[2px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, #DFA62B 50%, transparent 100%)',
                    boxShadow: '0 0 10px 2px rgba(223,166,43,0.40)',
                  }}
                  transition={{ duration: 0.26, ease: EASE }}
                />
              )}
              <span className="leading-none">{tab.icon}</span>
              <span
                className="text-[9px] tracking-[0.20em] uppercase"
                style={{ fontFamily: "'Teko', sans-serif", lineHeight: 1 }}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

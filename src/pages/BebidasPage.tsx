import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DropIcon, FlaskIcon, WineIcon, BeerBottleIcon } from '@phosphor-icons/react'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

const CATEGORIAS = [
  {
    label: 'Não Alcoólicos',
    href: '/bebidas/nao-alcoolicos',
    Icon: DropIcon,
    descricao: 'Sucos, refrescos e águas premium',
    gradiente: 'from-teal-950/80 via-teal-900/20 to-dark-warm',
    borda: 'border-teal-700/25 hover:border-teal-500/50',
    iconeBg: 'bg-teal-800/30 group-hover:bg-teal-700/40',
    iconeColor: 'text-teal-300',
    acento: '#0D9488',
  },
  {
    label: 'Cachaça',
    href: '/bebidas/cachaca',
    Icon: FlaskIcon,
    descricao: 'Cachaças artesanais selecionadas',
    gradiente: 'from-amber-950/80 via-amber-900/20 to-dark-warm',
    borda: 'border-amber-700/25 hover:border-amber-500/50',
    iconeBg: 'bg-amber-800/30 group-hover:bg-amber-700/40',
    iconeColor: 'text-amber-300',
    acento: '#D97706',
  },
  {
    label: 'Vinhos',
    href: '/bebidas/vinhos',
    Icon: WineIcon,
    descricao: 'Rótulos nacionais e importados',
    gradiente: 'from-[#3B0A0A]/80 via-[#2A0808]/20 to-dark-warm',
    borda: 'border-bordeaux/25 hover:border-bordeaux/60',
    iconeBg: 'bg-bordeaux/20 group-hover:bg-bordeaux/35',
    iconeColor: 'text-red-300',
    acento: '#8B1A1A',
  },
  {
    label: 'Cerveja',
    href: '/bebidas/cerveja',
    Icon: BeerBottleIcon,
    descricao: 'Cervejas artesanais e especiais',
    gradiente: 'from-yellow-950/80 via-yellow-900/20 to-dark-warm',
    borda: 'border-yellow-700/25 hover:border-yellow-500/50',
    iconeBg: 'bg-yellow-800/30 group-hover:bg-yellow-700/40',
    iconeColor: 'text-yellow-300',
    acento: '#CA8A04',
  },
]

export default function BebidasPage() {
  const navigate = useNavigate()

  return (
    <section className="min-h-screen bg-dark-warm px-4 pt-32 pb-20">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE }}
          className="text-center mb-14"
        >
          <p className="type-overline text-gold-primary tracking-widest mb-3">Nosso Cardápio</p>
          <h1 className="type-h1 text-cream mb-4">Bebidas</h1>
          <div className="w-12 h-0.5 bg-gradient-gold mx-auto mb-5" />
          <p className="type-body text-cream/50 max-w-sm mx-auto leading-relaxed">
            Escolha sua categoria e descubra nossas seleções cuidadosas.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {CATEGORIAS.map((cat, i) => (
            <motion.button
              key={cat.href}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.55, ease: EASE }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(cat.href)}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${cat.gradiente} ${cat.borda} p-7 md:p-8 text-left transition-all duration-400 cursor-pointer`}
              style={{
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px -8px ${cat.acento}50`
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
              }}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(ellipse at 20% 50%, ${cat.acento}08 0%, transparent 60%)`,
                }}
              />

              {/* Icon */}
              <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${cat.iconeBg}`}>
                <cat.Icon size={28} weight="fill" className={`${cat.iconeColor} transition-transform duration-300 group-hover:scale-110`} />
              </div>

              {/* Content */}
              <h2 className="font-display font-bold text-[1.4rem] leading-none text-cream mb-2 tracking-wide">
                {cat.label}
              </h2>
              <p className="type-caption text-cream/45 text-[0.8rem]">{cat.descricao}</p>

              {/* Arrow */}
              <div className="absolute bottom-7 right-7 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                <span className="type-overline text-gold-primary/70 text-[10px] tracking-widest">Ver</span>
                <span className="text-gold-primary/70 text-base leading-none">→</span>
              </div>

              {/* Bottom line accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `linear-gradient(90deg, transparent, ${cat.acento}80, transparent)` }}
              />
            </motion.button>
          ))}
        </div>

        {/* Footer divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 flex items-center gap-4"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold-primary/20" />
          <span className="type-overline text-[9px] text-cream/20 tracking-widest">
            Banca do Dinei · Delicatessen
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold-primary/20" />
        </motion.div>
      </div>
    </section>
  )
}

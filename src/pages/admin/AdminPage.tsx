import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PackageIcon, ClipboardTextIcon, UsersIcon, TagIcon, StorefrontIcon,
} from '@phosphor-icons/react'
import { useAuth } from '../../context/AuthContext'
import ProductsTab from './ProductsTab'
import OrdersTab from './OrdersTab'
import PromotionsTab from './PromotionsTab'
import StoresTab from './StoresTab'
import UsersTab from './UsersTab'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

type Tab = 'products' | 'orders' | 'promotions' | 'stores' | 'users'

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'products',   label: 'Produtos',   Icon: PackageIcon },
  { id: 'orders',     label: 'Pedidos',    Icon: ClipboardTextIcon },
  { id: 'promotions', label: 'Promoções',  Icon: TagIcon },
  { id: 'stores',     label: 'Lojas',      Icon: StorefrontIcon },
  { id: 'users',      label: 'Usuários',   Icon: UsersIcon },
]

const TAB_META: Record<Tab, { title: string; subtitle: string }> = {
  products:   { title: 'Produtos',   subtitle: 'Gerencie o catálogo completo de produtos' },
  orders:     { title: 'Pedidos',    subtitle: 'Acompanhe e atualize pedidos dos clientes' },
  promotions: { title: 'Promoções',  subtitle: 'Crie e configure promoções e descontos' },
  stores:     { title: 'Lojas',      subtitle: 'Gerencie lojas físicas e seus endereços' },
  users:      { title: 'Usuários',   subtitle: 'Gerencie contatos e endereços dos clientes' },
}

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('products')

  if (isLoading) return null
  if (!user || user.role !== 'Admin') return <Navigate to="/" replace />

  const meta = TAB_META[activeTab]

  return (
    <div className="min-h-screen bg-dark-warm pt-24 flex">

      {/* ── Desktop Sidebar ───────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gold-primary/10 sticky top-24 h-[calc(100vh-6rem)] self-start overflow-y-auto">

        {/* Brand header */}
        <div className="px-5 py-5 border-b border-gold-primary/10">
          <p className="type-overline text-gold-primary/40 text-[9px] tracking-widest mb-0.5 uppercase">
            Painel Admin
          </p>
          <p className="font-display font-bold text-cream text-lg leading-tight">
            Banca do Dinei
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gold-primary/12 text-gold-light'
                    : 'text-cream/45 hover:text-cream/80 hover:bg-white/4'
                }`}
              >
                <Icon
                  size={16}
                  weight={isActive ? 'fill' : 'regular'}
                  className={isActive ? 'text-gold-primary shrink-0' : 'text-cream/35 group-hover:text-cream/55 shrink-0'}
                />
                <span className="font-body text-sm">{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-primary shrink-0" />
                )}
              </button>
            )
          })}
        </nav>

        {/* User info */}
        <div className="px-3 py-4 border-t border-gold-primary/10 shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/3">
            <div className="w-8 h-8 rounded-full bg-gold-primary/20 border border-gold-primary/30 flex items-center justify-center shrink-0">
              <span className="text-gold-light font-bold text-xs">{user.name[0].toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-cream/70 text-xs font-body truncate leading-tight">{user.name.split(' ')[0]}</p>
              <p className="text-gold-primary/50 text-[10px] type-overline tracking-widest">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-4 md:px-8 py-5 pb-24 md:pb-10">

        {/* Page header */}
        <motion.div
          key={`header-${activeTab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="mb-5"
        >
          <h1 className="font-display font-bold text-2xl md:text-3xl text-cream leading-tight">
            {meta.title}
          </h1>
          <p className="text-cream/35 text-sm font-body mt-1">{meta.subtitle}</p>
        </motion.div>

        <div className="h-px bg-gradient-to-r from-gold-primary/20 via-gold-primary/8 to-transparent mb-5" />

        {/* Tab content */}
        <motion.div
          key={`content-${activeTab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {activeTab === 'products'   && <ProductsTab />}
          {activeTab === 'orders'     && <OrdersTab />}
          {activeTab === 'promotions' && <PromotionsTab />}
          {activeTab === 'stores'     && <StoresTab />}
          {activeTab === 'users'      && <UsersTab />}
        </motion.div>
      </main>

      {/* ── Mobile Bottom Navigation ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-warm/96 backdrop-blur-xl border-t border-gold-primary/12 flex items-center justify-around px-1 py-1.5 safe-b">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive ? 'text-gold-light' : 'text-cream/35'
              }`}
            >
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              <span className="text-[9px] type-overline tracking-widest leading-none">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

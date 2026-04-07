import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PackageIcon, ClipboardTextIcon, UsersIcon, TagIcon, StorefrontIcon } from '@phosphor-icons/react'
import { useAuth } from '../../context/AuthContext'
import ProductsTab from './ProductsTab'
import OrdersTab from './OrdersTab'
import PromotionsTab from './PromotionsTab'
import StoresTab from './StoresTab'
import UsersTab from './UsersTab'

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

type Tab = 'products' | 'orders' | 'promotions' | 'stores' | 'users'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'products',   label: 'Produtos',   icon: <PackageIcon size={16} weight="fill" /> },
  { id: 'orders',     label: 'Pedidos',    icon: <ClipboardTextIcon size={16} weight="fill" /> },
  { id: 'promotions', label: 'Promoções',  icon: <TagIcon size={16} weight="fill" /> },
  { id: 'stores',     label: 'Lojas',      icon: <StorefrontIcon size={16} weight="fill" /> },
  { id: 'users',      label: 'Usuários',   icon: <UsersIcon size={16} weight="fill" /> },
]

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('products')

  if (isLoading) return null

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  return (
    <section className="min-h-screen bg-dark-warm pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8"
        >
          <p className="type-overline text-gold-primary/50 text-[10px] tracking-widest mb-1">
            Painel administrativo
          </p>
          <h1 className="font-display font-bold text-3xl text-cream">
            Banca do Dinei
          </h1>
          <p className="type-body text-cream/40 text-sm mt-1">
            Olá, {user.name.split(' ')[0]}. Gerencie produtos, pedidos, promoções e lojas.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="flex gap-2 mb-8 overflow-x-auto pb-1"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full type-overline text-[10px] tracking-widest whitespace-nowrap transition-all duration-300 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-gold text-dark-warm font-bold shadow-gold'
                  : 'border border-gold-primary/20 text-cream/50 hover:border-gold-primary/40 hover:text-cream/80'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-gold-primary/20 via-gold-primary/8 to-transparent mb-8" />

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {activeTab === 'products'   && <ProductsTab />}
          {activeTab === 'orders'     && <OrdersTab />}
          {activeTab === 'promotions' && <PromotionsTab />}
          {activeTab === 'stores'     && <StoresTab />}
          {activeTab === 'users'      && <UsersTab />}
        </motion.div>
      </div>
    </section>
  )
}

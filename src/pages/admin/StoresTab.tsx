import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  WarningCircleIcon,
  CaretDownIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  StorefrontIcon,
} from '@phosphor-icons/react'
import {
  type Loja,
  type LojaCreateInput,
  type LojaEndereco,
  type LojaEnderecoInput,
  getLojas,
  createLoja,
  updateLoja,
  desativarLoja,
  addEnderecoLoja,
  updateEnderecoLoja,
  setEnderecoPrincipalLoja,
  deleteEnderecoLoja,
} from '../../services/lojas'
import StoreForm from '../../components/admin/StoreForm'
import AddressForm from '../../components/admin/AddressForm'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { EASE } from '../../lib/motion'


export default function StoresTab() {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Store form
  const [storeFormOpen, setStoreFormOpen] = useState(false)
  const [storeEditTarget, setStoreEditTarget] = useState<Loja | null>(null)
  const [storeFormLoading, setStoreFormLoading] = useState(false)

  // Deactivate store
  const [deactivateTarget, setDeactivateTarget] = useState<Loja | null>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  // Address form
  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [addressEditTarget, setAddressEditTarget] = useState<LojaEndereco | null>(null)
  const [addressFormLojaId, setAddressFormLojaId] = useState<number | null>(null)
  const [addressFormLoading, setAddressFormLoading] = useState(false)

  // Delete address
  const [deleteAddressTarget, setDeleteAddressTarget] = useState<{
    lojaId: number
    endereco: LojaEndereco
  } | null>(null)
  const [deleteAddressLoading, setDeleteAddressLoading] = useState(false)

  const fetchLojas = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await getLojas()
    if (res.success) {
      setLojas(res.data ?? [])
    } else {
      setError(res.message || 'Erro ao carregar lojas.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchLojas() }, [fetchLojas])

  const handleSaveStore = async (data: LojaCreateInput) => {
    setStoreFormLoading(true)
    const res = storeEditTarget
      ? await updateLoja(storeEditTarget.id, data)
      : await createLoja(data)
    setStoreFormLoading(false)
    if (res.success) {
      setStoreFormOpen(false)
      setStoreEditTarget(null)
      fetchLojas()
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    setDeactivateLoading(true)
    await desativarLoja(deactivateTarget.id)
    setDeactivateLoading(false)
    setDeactivateTarget(null)
    fetchLojas()
  }

  const openAddressForm = (lojaId: number, endereco?: LojaEndereco) => {
    setAddressFormLojaId(lojaId)
    setAddressEditTarget(endereco ?? null)
    setAddressFormOpen(true)
  }

  const handleSaveAddress = async (data: LojaEnderecoInput) => {
    if (!addressFormLojaId) return
    setAddressFormLoading(true)
    const res = addressEditTarget
      ? await updateEnderecoLoja(addressFormLojaId, addressEditTarget.id, data)
      : await addEnderecoLoja(addressFormLojaId, data)
    setAddressFormLoading(false)
    if (res.success) {
      setAddressFormOpen(false)
      setAddressEditTarget(null)
      fetchLojas()
    }
  }

  const handleSetPrincipal = async (lojaId: number, enderecoId: number) => {
    await setEnderecoPrincipalLoja(lojaId, enderecoId)
    fetchLojas()
  }

  const handleDeleteAddress = async () => {
    if (!deleteAddressTarget) return
    setDeleteAddressLoading(true)
    await deleteEnderecoLoja(deleteAddressTarget.lojaId, deleteAddressTarget.endereco.id)
    setDeleteAddressLoading(false)
    setDeleteAddressTarget(null)
    fetchLojas()
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <p className="type-overline text-[9px] text-cream/25 tracking-widest">
          {lojas.length} loja{lojas.length !== 1 ? 's' : ''} cadastrada{lojas.length !== 1 ? 's' : ''}
        </p>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setStoreEditTarget(null); setStoreFormOpen(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-gold text-dark-warm font-body font-bold text-xs uppercase tracking-widest hover:shadow-gold transition-all duration-300"
        >
          <PlusIcon size={14} weight="bold" />
          Nova loja
        </motion.button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"
          >
            <WarningCircleIcon size={16} weight="fill" className="shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && lojas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center">
            <StorefrontIcon size={28} weight="fill" className="text-gold-primary/50" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-cream mb-1">Nenhuma loja cadastrada</h3>
            <p className="type-body text-cream/40 text-sm">Adicione a primeira loja física da Banca Dinei.</p>
          </div>
        </div>
      )}

      {/* Store cards */}
      {!loading && !error && (
        <div className="space-y-3">
          {lojas.map((loja, i) => {
            const isExpanded = expandedId === loja.id
            return (
              <motion.div
                key={loja.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
                className="rounded-2xl border border-gold-primary/15 bg-white/3 overflow-hidden"
              >
                {/* Card header */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/3 transition-colors duration-200"
                  onClick={() => setExpandedId(isExpanded ? null : loja.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-base text-cream truncate">{loja.nome}</p>
                    {loja.cnpj && (
                      <p className="text-cream/30 text-xs font-body mt-0.5">CNPJ: {loja.cnpj}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setStoreEditTarget(loja)
                        setStoreFormOpen(true)
                      }}
                      title="Editar loja"
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-200"
                    >
                      <PencilSimpleIcon size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeactivateTarget(loja) }}
                      title="Desativar loja"
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-red-500/20 text-cream/40 hover:text-red-400 hover:border-red-500/50 transition-all duration-200"
                    >
                      <TrashIcon size={13} />
                    </button>
                    <div className={`w-6 h-6 flex items-center justify-center text-cream/30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <CaretDownIcon size={14} />
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      key="expanded"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-5 pb-5 border-t border-gold-primary/10 pt-4 space-y-4">
                        {/* Contact info */}
                        <div className="flex flex-wrap gap-4">
                          {loja.telefone && (
                            <div className="flex items-center gap-1.5 text-cream/50 text-sm">
                              <PhoneIcon size={13} className="text-gold-primary/50 shrink-0" />
                              {loja.telefone}
                            </div>
                          )}
                          {loja.email && (
                            <div className="flex items-center gap-1.5 text-cream/50 text-sm">
                              <EnvelopeIcon size={13} className="text-gold-primary/50 shrink-0" />
                              {loja.email}
                            </div>
                          )}
                        </div>

                        {/* Addresses section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="type-overline text-[9px] text-gold-primary/50 tracking-widest">
                              Endereços ({loja.enderecos.length})
                            </p>
                            <button
                              onClick={() => openAddressForm(loja.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/50 text-[10px] type-overline tracking-widest transition-all duration-200"
                            >
                              <PlusIcon size={10} weight="bold" />
                              Adicionar
                            </button>
                          </div>

                          {loja.enderecos.length === 0 ? (
                            <p className="text-cream/25 text-xs font-body italic">Nenhum endereço cadastrado.</p>
                          ) : (
                            <div className="space-y-2">
                              {loja.enderecos.map((end) => (
                                <div
                                  key={end.id}
                                  className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                                    end.isPrincipal
                                      ? 'bg-gold-primary/8 border border-gold-primary/20'
                                      : 'bg-white/3 border border-white/5'
                                  }`}
                                >
                                  <MapPinIcon
                                    size={14}
                                    weight={end.isPrincipal ? 'fill' : 'regular'}
                                    className={`shrink-0 mt-0.5 ${end.isPrincipal ? 'text-gold-primary' : 'text-cream/30'}`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-cream/80 text-sm font-body leading-snug">
                                      {end.logradouro}, {end.numero}
                                      {end.complemento && ` — ${end.complemento}`}
                                    </p>
                                    <p className="text-cream/40 text-xs font-body mt-0.5">
                                      {end.bairro}, {end.cidade}/{end.estado} · CEP {end.cep}
                                    </p>
                                    {end.isPrincipal && (
                                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gold-primary/10 text-gold-light type-overline text-[9px] tracking-widest">
                                        Principal
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleSetPrincipal(loja.id, end.id)}
                                      disabled={end.isPrincipal}
                                      title={end.isPrincipal ? 'Já é o principal' : 'Definir como principal'}
                                      className={`w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-200 ${
                                        end.isPrincipal
                                          ? 'border-gold-primary/20 text-gold-primary/40 cursor-not-allowed'
                                          : 'border-gold-primary/20 text-cream/30 hover:text-gold-light hover:border-gold-primary/50'
                                      }`}
                                    >
                                      <StarIcon size={11} weight={end.isPrincipal ? 'fill' : 'regular'} />
                                    </button>
                                    <button
                                      onClick={() => openAddressForm(loja.id, end)}
                                      title="Editar endereço"
                                      className="w-7 h-7 flex items-center justify-center rounded-full border border-gold-primary/20 text-cream/30 hover:text-gold-light hover:border-gold-primary/50 transition-all duration-200"
                                    >
                                      <PencilSimpleIcon size={11} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteAddressTarget({ lojaId: loja.id, endereco: end })}
                                      title="Remover endereço"
                                      className="w-7 h-7 flex items-center justify-center rounded-full border border-red-500/15 text-cream/25 hover:text-red-400 hover:border-red-500/40 transition-all duration-200"
                                    >
                                      <TrashIcon size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      <StoreForm
        open={storeFormOpen}
        initial={storeEditTarget}
        loading={storeFormLoading}
        onSave={handleSaveStore}
        onClose={() => { setStoreFormOpen(false); setStoreEditTarget(null) }}
      />

      <AddressForm
        open={addressFormOpen}
        initial={addressEditTarget}
        loading={addressFormLoading}
        onSave={handleSaveAddress}
        onClose={() => { setAddressFormOpen(false); setAddressEditTarget(null) }}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Desativar loja"
        description={`Tem certeza que deseja desativar "${deactivateTarget?.nome}"? A loja ficará invisível no catálogo público.`}
        confirmLabel="Desativar loja"
        loading={deactivateLoading}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteAddressTarget}
        title="Remover endereço"
        description="Este endereço será removido permanentemente da loja."
        confirmLabel="Remover endereço"
        loading={deleteAddressLoading}
        onConfirm={handleDeleteAddress}
        onCancel={() => setDeleteAddressTarget(null)}
      />
    </div>
  )
}

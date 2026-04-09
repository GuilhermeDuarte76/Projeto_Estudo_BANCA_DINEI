import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XIcon, ShoppingCartIcon, TrashIcon,
  MinusIcon, PlusIcon, WhatsappLogoIcon,
  TruckIcon, StorefrontIcon, MapPinIcon,
  CheckCircleIcon, WarningCircleIcon, ArrowClockwiseIcon,
} from '@phosphor-icons/react';
import { useCart, buildWhatsAppMessage } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { type UserEndereco } from '../../services/usuarios';
import { createPedido } from '../../services/pedidos';
import DeliveryModal from './DeliveryModal';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const WHATSAPP_NUMBER = '5534991633698';
const PAYMENT_METHODS = ['Pix', 'Cartão', 'Dinheiro'];

export default function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice, isOpen, closeCart } = useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<'entrega' | 'retirada' | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<UserEndereco | null>(null);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Used to trigger delivery modal after login
  const pendingDelivery = useRef(false);

  // When user logs in while cart is open and had clicked "Entrega"
  useEffect(() => {
    if (isAuthenticated && pendingDelivery.current) {
      pendingDelivery.current = false;
      setSelectedDelivery('entrega');
      setDeliveryModalOpen(true);
    }
  }, [isAuthenticated]);

  // Reset delivery when cart closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDelivery(null);
      setSelectedAddress(null);
      setOrderError('');
      setOrderSuccess(false);
    }
  }, [isOpen]);

  const handleDeliverySelect = (type: 'entrega' | 'retirada') => {
    setOrderError('');
    if (type === 'retirada') {
      setSelectedDelivery('retirada');
      setSelectedAddress(null);
      return;
    }
    // entrega
    if (!isAuthenticated) {
      pendingDelivery.current = true;
      openAuthModal();
      return;
    }
    setSelectedDelivery('entrega');
    setDeliveryModalOpen(true);
  };

  const handleAddressConfirmed = (address: UserEndereco) => {
    setSelectedAddress(address);
    setDeliveryModalOpen(false);
  };

  const canSendOrder =
    selectedDelivery !== null &&
    (selectedDelivery === 'retirada' || selectedAddress !== null);

  const handleSendOrder = async () => {
    if (!canSendOrder) return;
    setOrderLoading(true);
    setOrderError('');

    // Build message and open WhatsApp before the async call to preserve the
    // user-gesture context and avoid popup blockers.
    const msg = buildWhatsAppMessage(
      items,
      totalPrice,
      selectedPayment ?? undefined,
      selectedDelivery,
      selectedAddress ?? undefined,
    );
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    const waWindow = window.open(waUrl, '_blank', 'noopener,noreferrer');

    const res = await createPedido({
      enderecoEntregaId: selectedDelivery === 'entrega' ? (selectedAddress?.id ?? null) : null,
      formaPagamento: selectedPayment ?? undefined,
      itens: items.filter(item => item.produtoId != null).map(item => ({
        produtoId: item.produtoId as number,
        quantidade: item.quantity,
        ...(item.promocaoId != null && { promocaoId: item.promocaoId }),
      })),
    });

    if (!res.success) {
      setOrderLoading(false);
      setOrderError('Não foi possível registrar o pedido. Verifique sua conexão e tente novamente.');
      // Fallback: if popup was blocked, try navigating directly
      if (!waWindow) window.location.href = waUrl;
      return;
    }

    clearCart();
    setOrderLoading(false);
    setOrderSuccess(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block fixed inset-0 z-[60] bg-dark-warm/60"
              onClick={closeCart}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: EASE }}
              className="hidden md:flex fixed top-0 right-0 bottom-0 z-[65] w-full max-w-[420px] flex-col bg-dark-warm border-l border-gold-primary/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gold-primary/15">
                <div className="flex items-center gap-3">
                  <ShoppingCartIcon size={20} weight="fill" className="text-gold-light" />
                  <div>
                    <h2 className="font-display font-bold text-cream text-lg leading-none">Meu Carrinho</h2>
                    <AnimatePresence mode="wait">
                      {totalItems > 0 && (
                        <motion.p
                          key={totalItems}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="type-overline text-[9px] text-gold-primary/60 mt-0.5"
                        >
                          {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-1.5 type-overline text-[9px] text-cream/25 hover:text-bordeaux transition-colors duration-200"
                    >
                      <TrashIcon size={11} />
                      Limpar
                    </button>
                  )}
                  <button
                    onClick={closeCart}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-300"
                    aria-label="Fechar carrinho"
                  >
                    <XIcon size={15} />
                  </button>
                </div>
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    {orderSuccess ? (
                      <>
                        <CheckCircleIcon size={44} className="text-green-400/70" />
                        <div>
                          <p className="font-display text-cream/80 text-xl">Pedido realizado!</p>
                          <p className="type-overline text-[10px] text-cream/35 mt-1.5 leading-relaxed">
                            Seu pedido foi registrado.<br />
                            Continue no WhatsApp para confirmar.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon size={44} className="text-gold-primary/15" />
                        <div>
                          <p className="font-display text-cream/35 text-xl">Carrinho vazio</p>
                          <p className="type-overline text-[10px] text-cream/20 mt-1.5 leading-relaxed">
                            Adicione vinhos ou tábuas<br />para começar seu pedido
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {items.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                          transition={{ duration: 0.2, ease: EASE }}
                          className="bg-white/[0.04] border border-gold-primary/15 rounded-xl p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-bold text-cream/90 text-[13px] leading-snug">
                                {item.name}
                              </p>
                              <p className="text-cream/40 text-[10px] font-body mt-0.5 line-clamp-1">
                                {item.subtitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-1 bg-white/[0.06] rounded-full px-1.5 py-1">
                                <button
                                  onClick={() => updateQty(item.id, item.quantity - 1)}
                                  className="w-5 h-5 flex items-center justify-center text-cream/50 hover:text-gold-light transition-colors duration-200"
                                  aria-label="Diminuir quantidade"
                                >
                                  <MinusIcon size={9} weight="bold" />
                                </button>
                                <span className="font-body font-bold text-cream text-xs w-4 text-center tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQty(item.id, item.quantity + 1)}
                                  className="w-5 h-5 flex items-center justify-center text-cream/50 hover:text-gold-light transition-colors duration-200"
                                  aria-label="Aumentar quantidade"
                                >
                                  <PlusIcon size={9} weight="bold" />
                                </button>
                              </div>
                              <p className="font-display font-bold text-gold-light text-sm w-16 text-right tabular-nums">
                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                              </p>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-cream/20 hover:text-bordeaux transition-colors duration-200"
                                aria-label={`Remover ${item.name}`}
                              >
                                <XIcon size={13} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer — só aparece quando há itens */}
              <AnimatePresence>
                {items.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="px-4 py-3 border-t border-gold-primary/15 space-y-2.5"
                  >
                    {/* Entrega + Pagamento em linha */}
                    <div className="flex gap-3 items-start">
                      {/* Forma de entrega */}
                      <div className="flex-1">
                        <p className="type-overline text-[8px] text-cream/25 mb-1.5">ENTREGA</p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleDeliverySelect('entrega')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[11px] font-body transition-all duration-200 ${
                              selectedDelivery === 'entrega'
                                ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                                : 'text-cream/45 border-gold-primary/20 hover:border-gold-primary/50 hover:text-cream/70'
                            }`}
                          >
                            <TruckIcon size={12} />
                            Entrega
                          </button>
                          <button
                            onClick={() => handleDeliverySelect('retirada')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[11px] font-body transition-all duration-200 ${
                              selectedDelivery === 'retirada'
                                ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                                : 'text-cream/45 border-gold-primary/20 hover:border-gold-primary/50 hover:text-cream/70'
                            }`}
                          >
                            <StorefrontIcon size={12} />
                            Retirada
                          </button>
                        </div>
                      </div>

                      {/* Forma de pagamento */}
                      <div className="flex-1">
                        <p className="type-overline text-[8px] text-cream/25 mb-1.5">PAGAMENTO</p>
                        <div className="flex gap-1.5">
                          {PAYMENT_METHODS.map(method => (
                            <button
                              key={method}
                              onClick={() => setSelectedPayment(prev => prev === method ? null : method)}
                              className={`flex-1 type-overline text-[9px] border py-2 rounded-lg transition-all duration-200 ${
                                selectedPayment === method
                                  ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                                  : 'text-cream/45 border-gold-primary/20 hover:border-gold-primary/50 hover:text-cream/70'
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Endereço selecionado */}
                    <AnimatePresence>
                      {selectedDelivery === 'entrega' && selectedAddress && (
                        <motion.button
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setDeliveryModalOpen(true)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 bg-white/[0.04] border border-gold-primary/20 rounded-lg text-left hover:border-gold-primary/40 transition-colors duration-200"
                        >
                          <MapPinIcon size={12} className="text-gold-primary/60 flex-shrink-0" />
                          <p className="flex-1 text-cream/60 text-[10px] truncate">
                            {selectedAddress.logradouro}, {selectedAddress.numero} · {selectedAddress.bairro}, {selectedAddress.cidade}
                          </p>
                          <span className="type-overline text-[8px] text-gold-primary/50 flex-shrink-0">alterar</span>
                        </motion.button>
                      )}
                      {selectedDelivery === 'entrega' && !selectedAddress && (
                        <motion.button
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setDeliveryModalOpen(true)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gold-primary/25 rounded-lg text-cream/35 hover:text-cream/60 hover:border-gold-primary/40 transition-all duration-200 text-[10px]"
                        >
                          <MapPinIcon size={11} />
                          Selecionar endereço de entrega
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Total + CTA */}
                    <div className="flex items-center justify-between pt-0.5">
                      <p className="type-overline text-[9px] text-cream/35">Total</p>
                      <p className="font-display font-bold text-gold-light text-lg">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    {/* Erro */}
                    <AnimatePresence>
                      {orderError && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start gap-2 text-red-400 text-[10px] bg-red-400/5 border border-red-400/20 rounded-lg px-2.5 py-2"
                        >
                          <WarningCircleIcon size={12} className="flex-shrink-0 mt-0.5" />
                          {orderError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* CTA */}
                    <button
                      onClick={handleSendOrder}
                      disabled={!canSendOrder || orderLoading}
                      className="flex items-center justify-center gap-2 w-full bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-full transition-all duration-300 hover:shadow-gold hover:-translate-y-px active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {orderLoading ? (
                        <>
                          <ArrowClockwiseIcon size={14} className="animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <WhatsappLogoIcon size={15} weight="fill" />
                          Finalizar Pedido
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Delivery address modal — rendered outside AnimatePresence so it stacks above the drawer */}
      {user && (
        <DeliveryModal
          open={deliveryModalOpen}
          userId={user.id}
          onConfirm={handleAddressConfirmed}
          onClose={() => setDeliveryModalOpen(false)}
        />
      )}
    </>
  );
}

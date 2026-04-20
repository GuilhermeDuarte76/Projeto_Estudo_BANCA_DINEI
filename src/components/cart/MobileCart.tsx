import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon, ShoppingCartIcon, TrashIcon,
  MinusIcon, PlusIcon, WhatsappLogoIcon, XIcon,
  TruckIcon, StorefrontIcon, MapPinIcon,
  CheckCircleIcon, WarningCircleIcon, ArrowClockwiseIcon,
} from '@phosphor-icons/react';
import { useCart, buildWhatsAppMessage } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { type UserEndereco } from '../../services/usuarios';
import { createPedido } from '../../services/pedidos';
import DeliveryModal from './DeliveryModal';
import { EASE } from '../../lib/motion'
import { WHATSAPP_NUMBER } from '../../config/constants'

const PAYMENT_METHODS = ['Pix', 'Cartão', 'Dinheiro'];

export default function MobileCart() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice, isOpen, closeCart } = useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<'entrega' | 'retirada' | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<UserEndereco | null>(null);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const pendingDelivery = useRef(false);
  const pendingOrder = useRef(false);
  const [guestConfirmOpen, setGuestConfirmOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && pendingDelivery.current) {
      pendingDelivery.current = false;
      setSelectedDelivery('entrega');
      setDeliveryModalOpen(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDelivery(null);
      setSelectedAddress(null);
      setOrderError('');
      setOrderSuccess(false);
      setGuestConfirmOpen(false);
    }
  }, [isOpen]);

  const handleDeliverySelect = (type: 'entrega' | 'retirada') => {
    setOrderError('');
    if (type === 'retirada') {
      setSelectedDelivery('retirada');
      setSelectedAddress(null);
      return;
    }
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

    // If not authenticated, show dialog asking to continue as guest or login
    if (!isAuthenticated) {
      setGuestConfirmOpen(true);
      return;
    }

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

  // Guest flow: open WhatsApp only, no backend POST
  const handleSendOrderAsGuest = () => {
    setGuestConfirmOpen(false);
    const msg = buildWhatsAppMessage(
      items,
      totalPrice,
      selectedPayment ?? undefined,
      selectedDelivery ?? undefined,
      selectedAddress ?? undefined,
    );
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    const waWindow = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (!waWindow) window.location.href = waUrl;
    clearCart();
  };

  // Login flow: open auth modal, order is sent automatically after login
  const handleLoginForOrder = () => {
    setGuestConfirmOpen(false);
    pendingOrder.current = true;
    openAuthModal();
  };

  // After login, finalize the pending order
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isAuthenticated && pendingOrder.current) {
      pendingOrder.current = false;
      void handleSendOrder();
    }
  }, [isAuthenticated]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.45, ease: EASE }}
            className="md:hidden fixed inset-0 z-[65] bg-dark-warm flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gold-primary/15">
              <button
                onClick={closeCart}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gold-primary/25 text-cream/50 hover:text-gold-light hover:border-gold-primary/60 transition-all duration-300"
                aria-label="Fechar carrinho"
              >
                <ArrowLeftIcon size={15} />
              </button>
              <div className="text-center">
                <h2 className="font-display font-bold text-cream text-lg leading-none">Meu Carrinho</h2>
                <AnimatePresence mode="wait">
                  {totalItems > 0 && (
                    <motion.p
                      key={totalItems}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="type-overline text-[9px] text-gold-primary/60 mt-0.5"
                    >
                      {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              {items.length > 0 ? (
                <button
                  onClick={clearCart}
                  className="w-9 h-9 flex items-center justify-center text-cream/25 hover:text-bordeaux transition-colors duration-200"
                  aria-label="Limpar carrinho"
                >
                  <TrashIcon size={18} />
                </button>
              ) : (
                <div className="w-9" />
              )}
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
                  {orderSuccess ? (
                    <>
                      <CheckCircleIcon size={52} className="text-green-400/70" />
                      <div>
                        <p className="font-display text-cream/80 text-2xl">Pedido realizado!</p>
                        <p className="type-overline text-[10px] text-cream/35 mt-2 leading-relaxed">
                          Seu pedido foi registrado com sucesso.<br />
                          Continue no WhatsApp para confirmar.
                        </p>
                      </div>
                      <button
                        onClick={closeCart}
                        className="mt-2 type-overline text-[10px] text-gold-primary/50 border border-gold-primary/25 px-6 py-3 rounded-full"
                      >
                        Fechar
                      </button>
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon size={52} className="text-gold-primary/12" />
                      <div>
                        <p className="font-display text-cream/35 text-2xl">Carrinho vazio</p>
                        <p className="type-overline text-[10px] text-cream/20 mt-2 leading-relaxed">
                          Adicione vinhos ou tábuas<br />para começar seu pedido
                        </p>
                      </div>
                      <button
                        onClick={closeCart}
                        className="mt-2 type-overline text-[10px] text-gold-primary/50 border border-gold-primary/25 px-6 py-3 rounded-full"
                      >
                        Continuar explorando
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="bg-white/[0.05] border border-gold-primary/15 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-cream/90 text-sm leading-snug">
                              {item.name}
                            </p>
                            <p className="text-cream/40 text-[11px] font-body mt-0.5 line-clamp-1">
                              {item.subtitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1.5 bg-white/[0.07] rounded-full px-2 py-1.5">
                              <button
                                onClick={() => updateQty(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-cream/50 hover:text-gold-light transition-colors duration-200"
                                aria-label="Diminuir quantidade"
                              >
                                <MinusIcon size={10} weight="bold" />
                              </button>
                              <span className="font-body font-bold text-cream text-sm w-5 text-center tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQty(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-cream/50 hover:text-gold-light transition-colors duration-200"
                                aria-label="Aumentar quantidade"
                              >
                                <PlusIcon size={10} weight="bold" />
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
                              <XIcon size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="px-4 pt-3 pb-6 border-t border-gold-primary/15 space-y-2.5"
                >
                  {/* Entrega + Pagamento em linha */}
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <p className="type-overline text-[8px] text-cream/25 mb-1.5">ENTREGA</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDeliverySelect('entrega')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-body transition-all duration-200 ${
                            selectedDelivery === 'entrega'
                              ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                              : 'text-cream/45 border-gold-primary/20 hover:border-gold-primary/50 hover:text-cream/70'
                          }`}
                        >
                          <TruckIcon size={13} />
                          Entrega
                        </button>
                        <button
                          onClick={() => handleDeliverySelect('retirada')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-body transition-all duration-200 ${
                            selectedDelivery === 'retirada'
                              ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                              : 'text-cream/45 border-gold-primary/20 hover:border-gold-primary/50 hover:text-cream/70'
                          }`}
                        >
                          <StorefrontIcon size={13} />
                          Retirada
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="type-overline text-[8px] text-cream/25 mb-1.5">PAGAMENTO</p>
                      <div className="flex gap-1.5">
                        {PAYMENT_METHODS.map(method => (
                          <button
                            key={method}
                            onClick={() => setSelectedPayment(prev => prev === method ? null : method)}
                            className={`flex-1 type-overline text-[9px] border py-2.5 rounded-lg transition-all duration-200 ${
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
                        className="w-full flex items-center gap-2 px-3 py-2 bg-white/[0.04] border border-gold-primary/20 rounded-lg text-left hover:border-gold-primary/40 transition-colors duration-200"
                      >
                        <MapPinIcon size={12} className="text-gold-primary/60 flex-shrink-0" />
                        <p className="flex-1 text-cream/60 text-[11px] truncate">
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
                        className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gold-primary/25 rounded-lg text-cream/35 hover:text-cream/60 hover:border-gold-primary/40 transition-all duration-200 text-xs"
                      >
                        <MapPinIcon size={12} />
                        Selecionar endereço de entrega
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-0.5">
                    <p className="type-overline text-[9px] text-cream/35">Total do pedido</p>
                    <motion.p
                      key={totalPrice}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="font-display font-bold text-gold-light text-xl"
                    >
                      R$ {totalPrice.toFixed(2).replace('.', ',')}
                    </motion.p>
                  </div>

                  {/* Erro */}
                  <AnimatePresence>
                    {orderError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2 text-red-400 text-[11px] bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2"
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
                    className="flex items-center justify-center gap-2 w-full bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-full transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {orderLoading ? (
                      <>
                        <ArrowClockwiseIcon size={15} className="animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <WhatsappLogoIcon size={16} weight="fill" />
                        Finalizar Pedido
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {user && (
        <DeliveryModal
          open={deliveryModalOpen}
          userId={user.id}
          onConfirm={handleAddressConfirmed}
          onClose={() => setDeliveryModalOpen(false)}
        />
      )}

      {/* Guest confirm modal */}
      <AnimatePresence>
        {guestConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-dark-warm/70"
            onClick={() => setGuestConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xs bg-dark-warm border border-gold-primary/30 rounded-2xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display font-bold text-cream text-lg text-center mb-1">
                Você não está logado
              </h3>
              <p className="text-cream/50 text-[11px] text-center mb-5 leading-relaxed">
                Faça login para registrar seu pedido, ou continue sem login e envie apenas pelo WhatsApp.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleLoginForOrder}
                  className="w-full bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-full transition-all duration-300 active:scale-[0.97]"
                >
                  Fazer login
                </button>
                <button
                  onClick={handleSendOrderAsGuest}
                  className="w-full flex items-center justify-center gap-2 border border-gold-primary/30 text-cream/60 font-body text-xs px-6 py-3 rounded-full hover:border-gold-primary/60 hover:text-cream/80 transition-all duration-200"
                >
                  <WhatsappLogoIcon size={14} weight="fill" />
                  Continuar sem login
                </button>
                <button
                  onClick={() => setGuestConfirmOpen(false)}
                  className="w-full text-cream/30 font-body text-[11px] py-2 hover:text-cream/50 transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XIcon, ShoppingCartIcon, TrashIcon,
  MinusIcon, PlusIcon, WhatsappLogoIcon,
} from '@phosphor-icons/react';
import { useCart, buildWhatsAppMessage } from '../../context/CartContext';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const WHATSAPP_NUMBER = '5534991633698';

const PAYMENT_METHODS = ['Pix', 'Cartão', 'Dinheiro'];

export default function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice, isOpen, closeCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const handleSendOrder = () => {
    const msg = buildWhatsAppMessage(items, totalPrice, selectedPayment ?? undefined);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
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
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingCartIcon size={52} className="text-gold-primary/15" />
                  <div>
                    <p className="font-display text-cream/35 text-xl">Carrinho vazio</p>
                    <p className="type-overline text-[10px] text-cream/20 mt-1.5 leading-relaxed">
                      Adicione vinhos ou tábuas<br />para começar seu pedido
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.2, ease: EASE }}
                        className="bg-white/[0.04] border border-gold-primary/15 rounded-xl p-3.5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-cream/90 text-[13px] leading-snug">
                              {item.name}
                            </p>
                            <p className="text-cream/40 text-[11px] font-body mt-0.5 line-clamp-1">
                              {item.subtitle}
                            </p>
                            <p className="font-display font-bold text-gold-light text-sm mt-1.5">
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                              {item.quantity > 1 && (
                                <span className="text-cream/30 font-body font-normal text-[10px] ml-1.5">
                                  R$ {item.price.toFixed(2).replace('.', ',')} cada
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-cream/20 hover:text-bordeaux transition-colors duration-200"
                              aria-label={`Remover ${item.name}`}
                            >
                              <XIcon size={13} />
                            </button>
                            <div className="flex items-center gap-1.5 bg-white/[0.06] rounded-full px-1.5 py-1">
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
                  className="px-6 py-5 border-t border-gold-primary/15 space-y-4"
                >
                  {/* Formas de pagamento */}
                  <div>
                    <p className="type-overline text-[9px] text-cream/25 mb-2.5 text-center">Forma de pagamento</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {PAYMENT_METHODS.map(method => (
                        <button
                          key={method}
                          onClick={() => setSelectedPayment(prev => prev === method ? null : method)}
                          className={`type-overline text-[9px] border px-2.5 py-1 rounded-full transition-all duration-200 ${
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

                  {/* Divisor */}
                  <div className="h-px bg-gold-primary/10" />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <p className="type-overline text-[10px] text-cream/35">Total do pedido</p>
                    <p className="font-display font-bold text-gold-light text-xl">
                      R$ {totalPrice.toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleSendOrder}
                    className="flex items-center justify-center gap-2.5 w-full bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-full transition-all duration-300 hover:shadow-gold hover:-translate-y-px active:scale-[0.98]"
                  >
                    <WhatsappLogoIcon size={16} weight="fill" />
                    Enviar Pedido
                  </button>
                  <p className="text-center type-overline text-[9px] text-cream/20">
                    Você será direcionado ao WhatsApp
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

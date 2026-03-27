import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon, ShoppingCartIcon, TrashIcon,
  MinusIcon, PlusIcon, WhatsappLogoIcon, XIcon,
} from '@phosphor-icons/react';
import { useCart, buildWhatsAppMessage } from '../../context/CartContext';

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const WHATSAPP_NUMBER = '5534991633698';

const PAYMENT_METHODS = ['Pix', 'Cartão', 'Dinheiro'];

export default function MobileCart() {
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
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
                <ShoppingCartIcon size={64} className="text-gold-primary/12" />
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
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="bg-white/[0.05] border border-gold-primary/15 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-cream/90 text-sm leading-snug">
                            {item.name}
                          </p>
                          <p className="text-cream/40 text-[11px] font-body mt-0.5 line-clamp-2">
                            {item.subtitle}
                          </p>
                          <div className="flex items-baseline gap-2 mt-2">
                            <p className="font-display font-bold text-gold-light text-base">
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </p>
                            {item.quantity > 1 && (
                              <span className="text-cream/30 text-[10px] font-body">
                                R$ {item.price.toFixed(2).replace('.', ',')} cada
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-cream/20 hover:text-bordeaux transition-colors duration-200"
                            aria-label={`Remover ${item.name}`}
                          >
                            <XIcon size={14} />
                          </button>
                          <div className="flex items-center gap-2 bg-white/[0.07] rounded-full px-2 py-1.5">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-cream/50 hover:text-gold-light transition-colors duration-200"
                              aria-label="Diminuir quantidade"
                            >
                              <MinusIcon size={12} weight="bold" />
                            </button>
                            <span className="font-body font-bold text-cream text-sm w-5 text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-cream/50 hover:text-gold-light transition-colors duration-200"
                              aria-label="Aumentar quantidade"
                            >
                              <PlusIcon size={12} weight="bold" />
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

          {/* Footer */}
          <AnimatePresence>
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="px-5 pt-4 pb-8 border-t border-gold-primary/15 space-y-4"
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
                  <motion.p
                    key={totalPrice}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="font-display font-bold text-gold-light text-2xl"
                  >
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </motion.p>
                </div>

                {/* CTA */}
                <button
                  onClick={handleSendOrder}
                  className="flex items-center justify-center gap-2.5 w-full bg-gradient-gold text-dark-warm font-body font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-full transition-all duration-300 active:scale-[0.97]"
                >
                  <WhatsappLogoIcon size={18} weight="fill" />
                  Enviar Pedido pelo WhatsApp
                </button>
                <p className="text-center type-overline text-[9px] text-cream/20">
                  Você será direcionado ao WhatsApp para confirmar
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext';

export default function CartFAB() {
  const { totalItems, openCart, mobileMenuOpen } = useCart();

  return (
    <AnimatePresence>
      {totalItems > 0 && !mobileMenuOpen && (
        <motion.button
          key="cart-fab"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          onClick={openCart}
          className="md:hidden fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-gradient-gold text-dark-warm flex items-center justify-center shadow-gold transition-transform duration-200 active:scale-90"
          aria-label={`Abrir carrinho — ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
        >
          <ShoppingCartIcon size={22} weight="fill" />

          <motion.span
            key="fab-badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-bordeaux text-cream text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-dark-warm tabular-nums"
          >
            {totalItems > 9 ? '9+' : totalItems}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

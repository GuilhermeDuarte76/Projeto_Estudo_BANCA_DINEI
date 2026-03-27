import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  category: 'vinho' | 'tabua';
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) {
      setItems(prev => prev.filter(i => i.id !== id));
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const value = useMemo(() => ({
    items, addItem, removeItem, updateQty, clearCart,
    totalItems, totalPrice,
    isOpen, openCart, closeCart,
    mobileMenuOpen, setMobileMenuOpen,
  }), [items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, isOpen, openCart, closeCart, mobileMenuOpen]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function buildWhatsAppMessage(items: CartItem[], totalPrice: number, paymentMethod?: string): string {
  const vinhos = items.filter(i => i.category === 'vinho');
  const tabuas = items.filter(i => i.category === 'tabua');

  let msg = 'Ola! Vim pelo site da *Banca do Dinei* e gostaria de fazer um pedido. 🛒\n\n';
  msg += '*📋 MEU PEDIDO*\n';
  msg += '- - - - - - - - - - - - - -\n';

  if (vinhos.length > 0) {
    msg += '\n🍷 *Vinhos:*\n';
    vinhos.forEach(item => {
      const unit = item.price.toFixed(2).replace('.', ',');
      const subtotal = (item.price * item.quantity).toFixed(2).replace('.', ',');
      if (item.quantity > 1) {
        msg += `• ${item.name} _(${item.subtitle})_\n  ${item.quantity}x R$ ${unit} = *R$ ${subtotal}*\n`;
      } else {
        msg += `• ${item.name} _(${item.subtitle})_ — *R$ ${unit}*\n`;
      }
    });
  }

  if (tabuas.length > 0) {
    msg += '\n🧀 *Tabuas & Petiscos:*\n';
    tabuas.forEach(item => {
      const unit = item.price.toFixed(2).replace('.', ',');
      const subtotal = (item.price * item.quantity).toFixed(2).replace('.', ',');
      if (item.quantity > 1) {
        msg += `• ${item.name} — ${item.subtitle}\n  ${item.quantity}x R$ ${unit} = *R$ ${subtotal}*\n`;
      } else {
        msg += `• ${item.name} — ${item.subtitle} — *R$ ${unit}*\n`;
      }
    });
  }

  const total = totalPrice.toFixed(2).replace('.', ',');
  msg += '\n- - - - - - - - - - - - - -\n';
  msg += `💰 *TOTAL: R$ ${total}*\n`;
  if (paymentMethod) {
    msg += `💳 *Pagamento:* ${paymentMethod}\n`;
  }
  msg += '\nAguardo o retorno para confirmar e combinar a entrega. Obrigado(a)! 😊';

  return msg;
}

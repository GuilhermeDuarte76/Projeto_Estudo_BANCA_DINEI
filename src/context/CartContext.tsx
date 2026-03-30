import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  produtoId: number;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  category: string;
  promocaoId?: number | null;
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

export interface DeliveryAddress {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

const CATEGORY_LABELS: Record<string, { emoji: string; label: string }> = {
  vinho: { emoji: '🍷', label: 'Vinhos' },
  tabua: { emoji: '🧀', label: 'Tábuas & Petiscos' },
  'Bebidas': { emoji: '🍹', label: 'Bebidas' },
  'Frios': { emoji: '🧊', label: 'Frios' },
  'Doces': { emoji: '🍫', label: 'Doces' },
  'Grãos e Castanhas': { emoji: '🥜', label: 'Grãos e Castanhas' },
};

const DEFAULT_CATEGORY = { emoji: '📦', label: 'Outros' };

export function buildWhatsAppMessage(
  items: CartItem[],
  totalPrice: number,
  paymentMethod?: string,
  deliveryType?: 'entrega' | 'retirada',
  deliveryAddress?: DeliveryAddress,
): string {
  const grouped = new Map<string, CartItem[]>();
  items.forEach(item => {
    const key = item.category;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  });

  let msg = 'Ola! Vim pelo site da *Banca do Dinei* e gostaria de fazer um pedido. 🛒\n\n';
  msg += '*📋 MEU PEDIDO*\n';
  msg += '- - - - - - - - - - - - - -\n';

  grouped.forEach((groupItems, category) => {
    const { emoji, label } = CATEGORY_LABELS[category] ?? { emoji: DEFAULT_CATEGORY.emoji, label: category || DEFAULT_CATEGORY.label };
    msg += `\n${emoji} *${label}:*\n`;
    groupItems.forEach(item => {
      const unit = item.price.toFixed(2).replace('.', ',');
      const subtotal = (item.price * item.quantity).toFixed(2).replace('.', ',');
      const detail = item.subtitle ? ` _(${item.subtitle})_` : '';
      if (item.quantity > 1) {
        msg += `• ${item.name}${detail}\n  ${item.quantity}x R$ ${unit} = *R$ ${subtotal}*\n`;
      } else {
        msg += `• ${item.name}${detail} — *R$ ${unit}*\n`;
      }
    });
  });

  const total = totalPrice.toFixed(2).replace('.', ',');
  msg += '\n- - - - - - - - - - - - - -\n';
  msg += `💰 *TOTAL: R$ ${total}*\n`;
  if (paymentMethod) {
    msg += `💳 *Pagamento:* ${paymentMethod}\n`;
  }
  if (deliveryType === 'retirada') {
    msg += '🏪 *Entrega:* Retirada na loja\n';
  } else if (deliveryType === 'entrega' && deliveryAddress) {
    const comp = deliveryAddress.complemento ? ` — ${deliveryAddress.complemento}` : '';
    msg += `🚚 *Entrega:* ${deliveryAddress.logradouro}, ${deliveryAddress.numero}${comp}, ${deliveryAddress.bairro}, ${deliveryAddress.cidade} — ${deliveryAddress.estado} (CEP: ${deliveryAddress.cep})\n`;
  }
  msg += '\nAguardo o retorno para confirmar e combinar a entrega. Obrigado(a)! 😊';

  return msg;
}

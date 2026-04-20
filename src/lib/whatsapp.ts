import type { CartItem } from '../context/CartContext'

export interface DeliveryAddress {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

const CATEGORY_LABELS: Record<string, { emoji: string; label: string }> = {
  vinho: { emoji: '🍷', label: 'Vinhos' },
  tabua: { emoji: '🧀', label: 'Tábuas & Petiscos' },
  'Bebidas': { emoji: '🍹', label: 'Bebidas' },
  'Frios': { emoji: '🧊', label: 'Frios' },
  'Doces': { emoji: '🍫', label: 'Doces' },
  'Grãos e Castanhas': { emoji: '🥜', label: 'Grãos e Castanhas' },
}

const DEFAULT_CATEGORY = { emoji: '📦', label: 'Outros' }

export function buildWhatsAppMessage(
  items: CartItem[],
  totalPrice: number,
  paymentMethod?: string,
  deliveryType?: 'entrega' | 'retirada',
  deliveryAddress?: DeliveryAddress,
): string {
  const grouped = new Map<string, CartItem[]>()
  items.forEach(item => {
    const key = item.category
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(item)
  })

  let msg = 'Ola! Vim pelo site da *Banca do Dinei* e gostaria de fazer um pedido. 🛒\n\n'
  msg += '*📋 MEU PEDIDO*\n'
  msg += '- - - - - - - - - - - - - -\n'

  grouped.forEach((groupItems, category) => {
    const { emoji, label } = CATEGORY_LABELS[category] ?? { emoji: DEFAULT_CATEGORY.emoji, label: category || DEFAULT_CATEGORY.label }
    msg += `\n${emoji} *${label}:*\n`
    groupItems.forEach(item => {
      const unit = item.price.toFixed(2).replace('.', ',')
      const subtotal = (item.price * item.quantity).toFixed(2).replace('.', ',')
      const detail = item.subtitle ? ` _(${item.subtitle})_` : ''
      if (item.quantity > 1) {
        msg += `• ${item.name}${detail}\n  ${item.quantity}x R$ ${unit} = *R$ ${subtotal}*\n`
      } else {
        msg += `• ${item.name}${detail} — *R$ ${unit}*\n`
      }
    })
  })

  const total = totalPrice.toFixed(2).replace('.', ',')
  msg += '\n- - - - - - - - - - - - - -\n'
  msg += `💰 *TOTAL: R$ ${total}*\n`
  if (paymentMethod) {
    msg += `💳 *Pagamento:* ${paymentMethod}\n`
  }
  if (deliveryType === 'retirada') {
    msg += '🏪 *Entrega:* Retirada na loja\n'
  } else if (deliveryType === 'entrega' && deliveryAddress) {
    const comp = deliveryAddress.complemento ? ` — ${deliveryAddress.complemento}` : ''
    msg += `🚚 *Entrega:* ${deliveryAddress.logradouro}, ${deliveryAddress.numero}${comp}, ${deliveryAddress.bairro}, ${deliveryAddress.cidade} — ${deliveryAddress.estado} (CEP: ${deliveryAddress.cep})\n`
  }
  msg += '\nAguardo o retorno para confirmar e combinar a entrega. Obrigado(a)! 😊'

  return msg
}

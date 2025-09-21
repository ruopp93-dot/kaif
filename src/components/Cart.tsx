import { CartItem, Product } from '../types';
import { formatPrice } from '../utils/money';

export type CartHandlers = {
  onInc: (p: Product) => void;
  onDec: (p: Product) => void;
  onRemove: (p: Product) => void;
  onClear?: () => void;
};

type Props = {
  items: CartItem[];
  currency: 'RUB' | 'USD' | 'EUR';
  handlers: CartHandlers;
};

export default function Cart({ items, currency, handlers }: Props) {
  const total = items.reduce((sum, it) => sum + it.product.price * it.qty, 0);

  return (
    <div style={{
      background: 'var(--tg-theme-secondary-bg-color, #111)',
      color: 'var(--tg-theme-text-color, #fff)',
      borderRadius: 12,
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700 }}>Корзина</div>
        {handlers.onClear && (
          <button onClick={handlers.onClear} style={{ background: 'transparent', color: 'var(--tg-theme-hint-color, #aaa)', border: 'none' }}>Очистить</button>
        )}
      </div>

      {items.length === 0 && <div style={{ opacity: 0.8 }}>Пусто. Добавьте товары.</div>}

      {items.map((it) => (
        <div key={it.product.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{it.product.title}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{formatPrice(it.product.price, currency)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => handlers.onDec(it.product)} style={btnSm}>-</button>
            <div style={{ minWidth: 24, textAlign: 'center' }}>{it.qty}</div>
            <button onClick={() => handlers.onInc(it.product)} style={btnSm}>+</button>
            <button onClick={() => handlers.onRemove(it.product)} style={{ ...btnSm, background: '#ff4d4f' }}>✕</button>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 700 }}>
        <div>Итого</div>
        <div>{formatPrice(total, currency)}</div>
      </div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>Оплата запускается через кнопку Telegram снизу.</div>
    </div>
  );
}

const btnSm: React.CSSProperties = {
  background: 'var(--tg-theme-button-color, #40a9ff)',
  color: 'var(--tg-theme-button-text-color, #fff)',
  border: 'none',
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer'
};

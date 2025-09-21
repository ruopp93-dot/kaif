import { formatPrice } from '../utils/money';
import type { Product } from '../types';
import placeholder from '../assets/placeholder.svg';

type Props = {
  product: Product;
  onClose: () => void;
  onAdd: () => void;
};

export default function ProductModal({ product, onClose, onAdd }: Props) {
  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 12 }}>
          <img
            src={product.image || placeholder}
            alt={product.title}
            style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 12 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{product.title}</div>
            {product.nicotine && (
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>Крепость: {product.nicotine}</div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.tags.map((t) => (
                  <span key={t} style={tag}>{t}</span>
                ))}
              </div>
            )}
            <div style={{ marginTop: 8, fontWeight: 700 }}>{formatPrice(product.price, product.currency)}</div>
          </div>
        </div>
        {product.description && (
          <div style={{ marginTop: 12, opacity: 0.95, lineHeight: 1.4 }}>{product.description}</div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSecondary}>Закрыть</button>
          <button onClick={onAdd} style={btnPrimary} disabled={!product.inStock}>
            {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000
};

const modal: React.CSSProperties = {
  width: 'min(680px, 100%)',
  background: 'var(--tg-theme-bg-color, #1c1c1c)',
  color: 'var(--tg-theme-text-color, #fff)',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 12px 40px rgba(0,0,0,0.45)'
};

const btnPrimary: React.CSSProperties = {
  background: 'var(--tg-theme-button-color, #40a9ff)',
  color: 'var(--tg-theme-button-text-color, #fff)',
  border: 'none',
  borderRadius: 10,
  padding: '10px 14px',
  cursor: 'pointer',
  fontWeight: 600
};

const btnSecondary: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--tg-theme-text-color, #fff)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 10,
  padding: '10px 14px',
  cursor: 'pointer'
};

const tag: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 12,
  opacity: 0.9
};

import { Product } from '../types';
import { formatPrice } from '../utils/money';
import placeholder from '../assets/placeholder.svg';

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
};

export default function ProductCard({ product, onAdd }: Props) {
  return (
    <div style={{
      background: 'var(--tg-theme-bg-color, #1c1c1c)',
      color: 'var(--tg-theme-text-color, #fff)',
      borderRadius: 12,
      padding: 12,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <img
        src={product.image || placeholder}
        alt={product.title}
        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }}
      />
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontWeight: 600 }}>{product.title}</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{product.description}</div>
        <div style={{ marginTop: 8, fontWeight: 700 }}>{formatPrice(product.price, product.currency)}</div>
      </div>
      <button
        disabled={!product.inStock}
        onClick={(e) => { e.stopPropagation(); onAdd(product); }}
        style={{
          background: 'var(--tg-theme-button-color, #40a9ff)',
          color: 'var(--tg-theme-button-text-color, #fff)',
          border: 'none',
          borderRadius: 8,
          padding: '8px 12px',
          cursor: 'pointer'
        }}
      >
        {product.inStock ? 'В корзину' : 'Нет в наличии'}
      </button>
    </div>
  );
}

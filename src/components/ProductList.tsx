import { Product } from '../types';
import ProductCard from './ProductCard';

type Props = {
  products: Product[];
  onAdd: (p: Product) => void;
  onSelect?: (p: Product) => void;
};

export default function ProductList({ products, onAdd, onSelect }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
        alignItems: 'stretch'
      }}
    >
      {products.map((p) => (
        <div key={p.id} onClick={() => onSelect?.(p)} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
          <ProductCard product={p} onAdd={onAdd} />
        </div>
      ))}
    </div>
  );
}

import { useMemo, useState } from 'react';
import type { Product } from '../types';

const CATEGORIES: Array<Product['category']> = ['vape', 'liquid', 'pod', 'accessory'];

type Props = {
  products: Product[];
  onChange: (next: Product[]) => void;
};

export default function AdminPanel({ products, onChange }: Props) {
  const [filter, setFilter] = useState<'all' | Product['category']>('all');
  const [jsonText, setJsonText] = useState('');
  const [newItem, setNewItem] = useState<Partial<Product>>({
    title: '',
    price: 0,
    currency: 'RUB',
    category: 'vape',
    inStock: true,
  });

  const list = useMemo(() => {
    return filter === 'all' ? products : products.filter((p) => p.category === filter);
  }, [filter, products]);

  const update = (idx: number, patch: Partial<Product>) => {
    const original = list[idx];
    const i = products.findIndex((p) => p.id === original.id);
    if (i === -1) return;
    const next = [...products];
    next[i] = { ...next[i], ...patch } as Product;
    onChange(next);
  };

  const remove = (idx: number) => {
    const original = list[idx];
    const next = products.filter((p) => p.id !== original.id);
    onChange(next);
  };

  const add = () => {
    if (!newItem.title || !newItem.price || !newItem.category) return;
    const id = generateId(String(newItem.title));
    const item: Product = {
      id,
      title: String(newItem.title),
      description: String(newItem.description || ''),
      price: Number(newItem.price),
      currency: (newItem.currency as any) || 'RUB',
      image: newItem.image ? String(newItem.image) : undefined,
      tags: newItem.tags as any,
      nicotine: newItem.nicotine ? String(newItem.nicotine) : undefined,
      category: newItem.category as Product['category'],
      inStock: Boolean(newItem.inStock),
    };
    onChange([item, ...products]);
    setNewItem({ title: '', price: 0, currency: 'RUB', category: 'vape', inStock: true });
  };

  const exportJson = () => {
    setJsonText(JSON.stringify(products, null, 2));
  };

  const importJson = () => {
    try {
      const arr = JSON.parse(jsonText);
      if (!Array.isArray(arr)) throw new Error('JSON должен быть массивом товаров');
      // naive validation
      const normalized: Product[] = arr.map((p, idx) => ({
        id: String(p.id || generateId('item-' + idx)),
        title: String(p.title || 'Без названия'),
        description: String(p.description || ''),
        price: Number(p.price || 0),
        currency: (p.currency === 'RUB' || p.currency === 'USD' || p.currency === 'EUR') ? p.currency : 'RUB',
        image: p.image ? String(p.image) : undefined,
        tags: Array.isArray(p.tags) ? p.tags.map(String) : undefined,
        nicotine: p.nicotine ? String(p.nicotine) : undefined,
        category: (CATEGORIES.includes(p.category) ? p.category : 'accessory'),
        inStock: Boolean(p.inStock),
      }));
      onChange(normalized);
    } catch (e: any) {
      alert('Ошибка импорта JSON: ' + e.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Админ-панель</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">Все категории</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{labelOf(c)}</option>
            ))}
          </select>
          <button onClick={exportJson} style={btn}>Экспорт JSON</button>
        </div>
      </div>

      <details>
        <summary>Импорт JSON / просмотр</summary>
        <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} style={{ width: '100%', height: 160 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={importJson} style={btn}>Импорт</button>
        </div>
      </details>

      <div style={{ padding: 12, borderRadius: 12, background: 'var(--tg-theme-secondary-bg-color, #111)' }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Добавить товар</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px 1fr', gap: 8 }}>
          <input placeholder="Название" value={newItem.title as any} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
          <input placeholder="Цена" type="number" value={Number(newItem.price)} onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })} />
          <select value={newItem.category as any} onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{labelOf(c)}</option>)}
          </select>
          <input placeholder="URL картинки" value={newItem.image as any} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={add} style={btn}>Добавить</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((p, idx) => (
          <div key={p.id} style={{ background: 'var(--tg-theme-secondary-bg-color, #111)', padding: 8, borderRadius: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px 1fr 90px', gap: 8, alignItems: 'center' }}>
              <input value={p.title} onChange={(e) => update(idx, { title: e.target.value })} />
              <input type="number" value={p.price} onChange={(e) => update(idx, { price: Number(e.target.value) })} />
              <select value={p.category} onChange={(e) => update(idx, { category: e.target.value as Product['category'] })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{labelOf(c)}</option>)}
              </select>
              <input placeholder="URL картинки" value={p.image || ''} onChange={(e) => update(idx, { image: e.target.value })} />
              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" checked={p.inStock} onChange={(e) => update(idx, { inStock: e.target.checked })} />
                В наличии
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
              <input placeholder="Никотин" value={p.nicotine || ''} onChange={(e) => update(idx, { nicotine: e.target.value })} />
              <input placeholder="Теги (через запятую)" value={(p.tags || []).join(', ')} onChange={(e) => update(idx, { tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) as any })} />
              <input placeholder="Краткое описание" value={p.description} onChange={(e) => update(idx, { description: e.target.value })} />
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => remove(idx)} style={{ ...btn, background: '#ff4d4f' }}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function labelOf(c: Product['category']) {
  switch (c) {
    case 'vape': return 'Девайсы';
    case 'liquid': return 'Жидкости';
    case 'pod': return 'Картриджи/Испарители';
    case 'accessory': return 'Аксессуары/Кальян';
  }
}

function generateId(s: string) {
  return s.toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6);
}

const btn: React.CSSProperties = {
  background: 'var(--tg-theme-button-color, #40a9ff)',
  color: 'var(--tg-theme-button-text-color, #fff)',
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer'
};

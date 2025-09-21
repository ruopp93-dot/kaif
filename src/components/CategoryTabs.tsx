type Category = 'all' | 'vape' | 'liquid' | 'pod' | 'accessory';

type Props = {
  value: Category;
  onChange: (c: Category) => void;
};

const TABS: { key: Category; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'vape', label: 'Девайсы' },
  { key: 'liquid', label: 'Жидкости' },
  { key: 'pod', label: 'Картриджи/Испарители' },
  { key: 'accessory', label: 'Аксессуары/Кальян' },
];

export default function CategoryTabs({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0' }}>
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              whiteSpace: 'nowrap',
              border: 'none',
              borderRadius: 999,
              padding: '8px 12px',
              cursor: 'pointer',
              background: active ? 'var(--tg-theme-button-color, #40a9ff)' : 'var(--tg-theme-secondary-bg-color, #111)',
              color: active ? 'var(--tg-theme-button-text-color, #fff)' : 'var(--tg-theme-text-color, #fff)',
              boxShadow: active ? '0 2px 8px rgba(0,0,0,0.25)' : 'none'
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

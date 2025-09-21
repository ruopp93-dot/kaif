import WebApp from '@twa-dev/sdk';

export default function Header() {
  const tg = WebApp;
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Vape Shop</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>Theme: {tg.colorScheme}</div>
    </header>
  );
}

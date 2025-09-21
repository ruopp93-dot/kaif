import { useEffect, useMemo, useState } from 'react'
import './App.css'

import WebApp from '@twa-dev/sdk'
import Header from './components/Header'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import AgeGate from './components/AgeGate'
import CategoryTabs from './components/CategoryTabs'
import AdminPanel from './components/AdminPanel'
import ProductModal from './components/ProductModal'
import { products } from './data/products'
import type { CartItem, Product } from './types'

type Category = 'all' | 'vape' | 'liquid' | 'pod' | 'accessory'

function App() {
  const [ageConfirmed, setAgeConfirmed] = useState<boolean>(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [category, setCategory] = useState<Category>('all')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [items, setItems] = useState<Product[]>(products as Product[])
  const [adminAuthorized, setAdminAuthorized] = useState<boolean>(false)
  const [adminPassword, setAdminPassword] = useState<string>('')
  const [selected, setSelected] = useState<Product | null>(null)

  // Restore age gate decision within session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ageConfirmed')
      if (saved === 'true') setAgeConfirmed(true)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem('ageConfirmed', ageConfirmed ? 'true' : 'false')
    } catch {}
  }, [ageConfirmed])

  const total = useMemo<number>(
    () => cart.reduce((s: number, it: CartItem) => s + it.product.price * it.qty, 0),
    [cart]
  )

  // Router: check hash for admin flag
  useEffect(() => {
    const apply = () => setIsAdmin(window.location.hash.includes('admin=1'))
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

  // Restore admin auth from session
  useEffect(() => {
    try {
      const ok = sessionStorage.getItem('adminAuthorized') === 'true'
      if (ok) setAdminAuthorized(true)
    } catch {}
  }, [])

  // Auto authorize admin by Telegram ID if listed in VITE_ADMIN_IDS
  useEffect(() => {
    try {
      const idsRaw = (import.meta as any).env?.VITE_ADMIN_IDS || ''
      const ids = String(idsRaw)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
      const uid = (WebApp as any)?.initDataUnsafe?.user?.id
      if (uid && ids.includes(String(uid))) {
        setAdminAuthorized(true)
        sessionStorage.setItem('adminAuthorized', 'true')
      }
    } catch {}
  }, [])

  const tryAdminLogin = () => {
    const EXPECTED = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin123'
    if (adminPassword === EXPECTED) {
      setAdminAuthorized(true)
      try { sessionStorage.setItem('adminAuthorized', 'true') } catch {}
    } else {
      alert('Неверный пароль администратора')
    }
  }

  const addToCart = (p: Product) => {
    setCart((prev: CartItem[]) => {
      const idx = prev.findIndex((it: CartItem) => it.product.id === p.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return next
      }
      return [...prev, { product: p, qty: 1 }]
    })
  }

  const inc = (p: Product) => setCart((prev: CartItem[]) => prev.map((it: CartItem) => it.product.id === p.id ? { ...it, qty: it.qty + 1 } : it))
  const dec = (p: Product) => setCart((prev: CartItem[]) => prev.flatMap((it: CartItem) => {
    if (it.product.id !== p.id) return [it]
    const q = it.qty - 1
    return q > 0 ? [{ ...it, qty: q }] : []
  }))
  const removeItem = (p: Product) => setCart((prev: CartItem[]) => prev.filter((it: CartItem) => it.product.id !== p.id))
  const clear = () => setCart([])

  // Telegram MainButton integration (redirect to external payment page)
  useEffect(() => {
    const tg = WebApp
    // Setup button visibility and text
    if (cart.length > 0) {
      tg.MainButton.setText(`К оплате • ${total} ₽`)
      tg.MainButton.show()
      tg.MainButton.enable()
    } else {
      tg.MainButton.hide()
    }

    const onClick = () => {
      const itemsMin = cart.map((it) => ({ id: it.product.id, qty: it.qty, price: it.product.price }))
      const payload = {
        items: itemsMin,
        total,
        currency: 'RUB' as const,
        user_id: (tg as any)?.initDataUnsafe?.user?.id ?? null,
      }
      const base = (import.meta as any).env?.VITE_PAYMENT_URL || 'https://example.com/checkout'
      const url = `${base}?payload=${encodeURIComponent(JSON.stringify(payload))}`
      try {
        tg.openLink(url)
      } catch (e) {
        tg.showAlert('Не удалось открыть страницу оплаты. Проверьте ссылку оплаты.')
      }
    }

    tg.onEvent('mainButtonClicked', onClick)
    return () => tg.offEvent('mainButtonClicked', onClick)
  }, [cart, total])

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Header />

      {!ageConfirmed ? (
        <AgeGate onConfirm={() => setAgeConfirmed(true)} />
      ) : (
        <>
          {/* Cart moved to top */}
          <Cart
            items={cart}
            currency={'RUB'}
            handlers={{ onInc: inc, onDec: dec, onRemove: removeItem, onClear: clear }}
          />

          {selected && (
            <ProductModal
              product={selected}
              onClose={() => setSelected(null)}
              onAdd={() => { addToCart(selected); setSelected(null); }}
            />
          )}

          {isAdmin ? (
            adminAuthorized ? (
              <AdminPanel
                products={items}
                onChange={(next: Product[]) => setItems(next)}
              />
            ) : (
              <div style={{
                background: 'var(--tg-theme-secondary-bg-color, #111)',
                color: 'var(--tg-theme-text-color, #fff)',
                padding: 12,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ fontWeight: 700 }}>Вход в админ-панель</div>
                <input
                  type="password"
                  placeholder="Пароль администратора"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{ padding: 8, borderRadius: 8, border: '1px solid #333', background: 'transparent', color: 'inherit' }}
                />
                <button onClick={tryAdminLogin} style={{
                  background: 'var(--tg-theme-button-color, #40a9ff)',
                  color: 'var(--tg-theme-button-text-color, #fff)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}>Войти</button>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Подсказка: задайте переменную окружения VITE_ADMIN_PASSWORD при сборке/деплое.
                </div>
              </div>
            )
          ) : (
            <>
              <CategoryTabs value={category} onChange={setCategory} />
              {category === 'all' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(['vape','liquid','pod','accessory'] as Category[]).map((cat) => {
                    const group = items.filter((p) => p.category === (cat as any))
                    if (group.length === 0) return null
                    const titleMap: Record<string, string> = {
                      vape: 'Девайсы',
                      liquid: 'Жидкости',
                      pod: 'Картриджи и Испарители',
                      accessory: 'Аксессуары / Кальян'
                    }
                    return (
                      <section key={cat}>
                        <h3 style={{ margin: '8px 0', textAlign: 'left' }}>{titleMap[cat]}</h3>
                        <ProductList products={group} onAdd={addToCart} onSelect={setSelected} />
                      </section>
                    )
                  })}
                </div>
              ) : (
                <ProductList
                  products={items.filter((p) => p.category === (category as any))}
                  onAdd={addToCart}
                  onSelect={setSelected}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App

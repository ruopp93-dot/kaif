export function formatPrice(amount: number, currency: 'RUB' | 'USD' | 'EUR' = 'RUB') {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

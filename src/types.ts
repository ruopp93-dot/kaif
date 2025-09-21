export type Currency = 'RUB' | 'USD' | 'EUR';

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number; // in minor units? we'll use number in RUB for simplicity
  currency: Currency;
  image?: string;
  tags?: string[];
  nicotine?: string; // e.g., "0mg", "20mg"
  category: 'vape' | 'liquid' | 'pod' | 'accessory';
  inStock: boolean;
};

export type CartItem = {
  product: Product;
  qty: number;
};

export type Order = {
  items: Array<{ id: string; qty: number; price: number }>;
  total: number;
  currency: Currency;
  comment?: string;
};

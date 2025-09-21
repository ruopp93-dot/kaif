/*
  Catalog Importer for Vape Shop TMA
  - Reads Excel files from project root
  - Auto-detects common Russian headers
  - Maps rows to Product[] and writes src/data/products.ts
*/

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const PROJECT_ROOT = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const DATA_DIR = path.join(SRC_DIR, 'data');
const OUTPUT_TS = path.join(DATA_DIR, 'products.ts');

const FILE_CATEGORY_HINTS = [
  { name: 'Жидкости.xlsx', category: 'liquid' },
  { name: 'Девайсы.xlsx', category: 'vape' },
  { name: 'Девайсы.xlsx', category: 'vape' }, // in case of different "й"
  { name: 'Одноразовые устройства.xlsx', category: 'vape' },
  { name: 'Картриджи,_испарители,_расходники.xlsx', category: 'pod' },
  { name: 'Девайсы, испарители, картриджи.xlsx', category: undefined }, // mixed, try row-level or default
  { name: 'Кальянная продукция.xlsx', category: 'accessory' },
];

const HEADER_MAP = {
  id: ['id', 'sku', 'артикул', 'код'],
  title: ['название', 'наименование', 'товар', 'модель', 'бренд+модель'],
  description: ['описание', 'примечание', 'комментарий'],
  price: ['цена', 'стоимость', 'price', 'цена, руб', 'цена руб', 'цена (руб)'],
  nicotine: ['крепость', 'никотин', 'крепость никотина'],
  stock: ['наличие', 'в наличии', 'статус'],
  image: ['фото', 'картинка', 'image', 'url', 'ссылка']
};

function normalize(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[ё]/g, 'е');
}

function detectHeaderIndexes(headers) {
  const map = {};
  const norm = headers.map((h) => normalize(h));
  for (const [key, variants] of Object.entries(HEADER_MAP)) {
    let idx = -1;
    for (const v of variants) {
      idx = norm.indexOf(normalize(v));
      if (idx !== -1) break;
    }
    map[key] = idx;
  }
  return map;
}

function parsePrice(val) {
  if (val == null) return 0;
  const num = String(val).replace(/[^0-9.,]/g, '').replace(',', '.');
  const f = parseFloat(num);
  return Number.isFinite(f) ? Math.round(f) : 0; // store as integer RUB
}

function parseStock(val) {
  if (val == null) return true;
  const s = normalize(val);
  if (['да', 'есть', 'в наличии', 'true', '1', 'yes'].includes(s)) return true;
  if (['нет', 'отсутствует', 'false', '0', 'no'].includes(s)) return false;
  return true;
}

function clampText(s, max = 300) {
  s = String(s || '').trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function deriveCategoryFromRow(row, fallback) {
  // try look into possible category column names
  const possible = ['категория', 'тип', 'раздел'];
  for (const key of possible) {
    for (const k of Object.keys(row)) {
      if (normalize(k) === normalize(key)) {
        const v = normalize(row[k]);
        if (v.includes('жидк')) return 'liquid';
        if (v.includes('однораз') || v.includes('дева')) return 'vape';
        if (v.includes('картридж') || v.includes('испар')) return 'pod';
        if (v.includes('кальян') || v.includes('аксесс')) return 'accessory';
      }
    }
  }
  return fallback;
}

function buildId(prefix, rawId, index) {
  const base = rawId ? String(rawId).trim() : `${prefix}-${index + 1}`;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function readWorkbook(filePath) {
  const wb = xlsx.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(ws, { header: 1, raw: false });
}

function processFile(filePath, hintCategory) {
  const rows = readWorkbook(filePath);
  if (!rows.length) return [];

  const headers = rows[0];
  const body = rows.slice(1);
  const idx = detectHeaderIndexes(headers);

  const prefix = path.basename(filePath, path.extname(filePath));

  const products = [];
  body.forEach((arr, i) => {
    const row = {};
    headers.forEach((h, j) => (row[h] = arr[j]));

    const title = idx.title !== -1 ? row[headers[idx.title]] : undefined;
    const priceRaw = idx.price !== -1 ? row[headers[idx.price]] : undefined;
    if (!title || !priceRaw) return; // skip empty lines

    const description = idx.description !== -1 ? row[headers[idx.description]] : '';
    const nicotine = idx.nicotine !== -1 ? row[headers[idx.nicotine]] : undefined;
    const stock = idx.stock !== -1 ? parseStock(row[headers[idx.stock]]) : true;
    const image = idx.image !== -1 ? row[headers[idx.image]] : undefined;
    const rawId = idx.id !== -1 ? row[headers[idx.id]] : undefined;

    const price = parsePrice(priceRaw);
    const category = deriveCategoryFromRow(row, hintCategory || 'accessory');

    products.push({
      id: buildId(prefix, rawId, i),
      title: clampText(title, 120),
      description: clampText(description, 300),
      price,
      currency: 'RUB',
      image: image || undefined,
      tags: nicotine ? [String(nicotine)] : undefined,
      nicotine: nicotine ? String(nicotine) : undefined,
      category,
      inStock: Boolean(stock)
    });
  });

  return products;
}

function generateTs(products) {
  const header = `import { Product } from '../types';\n\n`;
  const body = `export const products: Product[] = ${JSON.stringify(products, null, 2)};\n`;
  return header + body;
}

function main() {
  const files = fs.readdirSync(PROJECT_ROOT)
    .filter((f) => f.toLowerCase().endsWith('.xlsx'))
    .map((f) => path.join(PROJECT_ROOT, f));

  if (!files.length) {
    console.log('No .xlsx files found at project root. Nothing to import.');
    process.exit(0);
  }

  const merged = [];
  for (const f of files) {
    const base = path.basename(f);
    const hint = FILE_CATEGORY_HINTS.find((h) => h.name === base);
    const hintCategory = hint ? hint.category : undefined;
    console.log(`Parsing: ${base} (category hint: ${hintCategory || 'auto'})`);
    try {
      const items = processFile(f, hintCategory);
      console.log(`  -> ${items.length} products`);
      merged.push(...items);
    } catch (e) {
      console.warn(`  !! Failed to parse ${base}:`, e.message);
    }
  }

  if (!merged.length) {
    console.warn('No products parsed. Check headers and data.');
    process.exit(1);
  }

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const ts = generateTs(merged);
  fs.writeFileSync(OUTPUT_TS, ts, 'utf8');
  console.log(`Written ${merged.length} products to ${path.relative(PROJECT_ROOT, OUTPUT_TS)}`);
}

main();

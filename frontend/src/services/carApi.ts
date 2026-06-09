// ── Cache em memória para não repetir chamadas por sessão ─────────────────────
const photoCache = new Map<string, string>();

export async function carPhotoPexels(marca: string, modelo: string): Promise<string | null> {
  const key = `${marca} ${modelo}`;
  if (photoCache.has(key)) return photoCache.get(key)!;

  const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string;
  if (!apiKey || apiKey === 'cole_sua_chave_aqui') return null;

  try {
    const q = encodeURIComponent(`${marca} ${modelo} car`);
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${q}&per_page=1&orientation=landscape`,
      { headers: { Authorization: apiKey } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const url: string | undefined = data.photos?.[0]?.src?.large;
    if (url) photoCache.set(key, url);
    return url ?? null;
  } catch {
    return null;
  }
}

// ── FIPE API ──────────────────────────────────────────────────────────────────
const FIPE = 'https://parallelum.com.br/fipe/api/v2';

export interface FipeBrand  { code: string; name: string }
export interface FipeModel  { code: number; name: string }
export interface FipeYear   { code: string; name: string }

const brandsCache: { value: FipeBrand[] | null } = { value: null };
const modelsCache = new Map<string, FipeModel[]>();
const yearsCache  = new Map<string, FipeYear[]>();

export async function fetchFipeBrands(): Promise<FipeBrand[]> {
  if (brandsCache.value) return brandsCache.value;
  const res = await fetch(`${FIPE}/cars/brands`);
  if (!res.ok) throw new Error('Falha ao carregar marcas FIPE');
  const data = (await res.json()) as FipeBrand[];
  brandsCache.value = data;
  return data;
}

export async function fetchFipeModels(brandCode: string): Promise<FipeModel[]> {
  const cached = modelsCache.get(brandCode);
  if (cached) return cached;
  const res = await fetch(`${FIPE}/cars/brands/${brandCode}/models`);
  if (!res.ok) throw new Error('Falha ao carregar modelos FIPE');
  const data = (await res.json()) as FipeModel[];
  modelsCache.set(brandCode, data);
  return data;
}

export async function fetchFipeYears(brandCode: string, modelCode: number | string): Promise<FipeYear[]> {
  const key = `${brandCode}::${modelCode}`;
  const cached = yearsCache.get(key);
  if (cached) return cached;
  const res = await fetch(`${FIPE}/cars/brands/${brandCode}/models/${modelCode}/years`);
  if (!res.ok) throw new Error('Falha ao carregar anos FIPE');
  const data = (await res.json()) as FipeYear[];
  yearsCache.set(key, data);
  return data;
}

export async function fetchFipePrice(
  brandCode: string,
  modelCode: number | string,
  yearCode: string,
): Promise<{ price: string; modelYear: number } | null> {
  try {
    const res = await fetch(
      `${FIPE}/cars/brands/${brandCode}/models/${modelCode}/years/${yearCode}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return { price: data.price, modelYear: data.modelYear };
  } catch {
    return null;
  }
}

export function parseFipePrice(formatted: string): number | null {
  if (!formatted) return null;
  const clean = formatted.replace(/[^\d,]/g, '').replace(',', '.');
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

export interface FipeResult {
  price: string;
  model: string;
  brand: string;
  modelYear: number;
  referenceMonth: string;
}

function norm(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim();
}

function score(a: string, b: string): number {
  const na = norm(a), nb = norm(b);
  if (na === nb) return 100;
  if (nb.includes(na) || na.includes(nb)) return 80;
  const words = na.split(' ');
  const hits = words.filter(w => w.length > 2 && nb.includes(w)).length;
  return hits > 0 ? (hits / words.length) * 60 : 0;
}

function best<T extends { name: string }>(list: T[], query: string): T | null {
  let top = 0, winner: T | null = null;
  for (const item of list) {
    const s = score(query, item.name);
    if (s > top) { top = s; winner = item; }
  }
  return top >= 30 ? winner : null;
}

const BRAND_ALIASES: Record<string, string> = {
  chevrolet: 'gm',
  volkswagen: 'vw',
};

export async function lookupFipe(
  marca: string,
  modelo: string,
  ano: number,
): Promise<FipeResult | null> {
  try {
    const brands: FipeBrand[] = await fetch(`${FIPE}/cars/brands`).then(r => r.json());

    const alias = BRAND_ALIASES[norm(marca).split(' ')[0]];
    const brand = best(brands, alias ?? marca);
    if (!brand) return null;

    const models: FipeModel[] = await fetch(`${FIPE}/cars/brands/${brand.code}/models`).then(r => r.json());

    const model = best(models, modelo.split(' ')[0]);
    if (!model) return null;

    const years: FipeYear[] = await fetch(
      `${FIPE}/cars/brands/${brand.code}/models/${model.code}/years`,
    ).then(r => r.json());

    const year = years.find(y => y.name.startsWith(String(ano))) ?? years[0];
    if (!year) return null;

    const data = await fetch(
      `${FIPE}/cars/brands/${brand.code}/models/${model.code}/years/${year.code}`,
    ).then(r => r.json());

    return {
      price: data.price,
      model: data.model,
      brand: data.brand,
      modelYear: data.modelYear,
      referenceMonth: data.referenceMonth,
    };
  } catch {
    return null;
  }
}

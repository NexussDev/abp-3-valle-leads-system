import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  carPhotoPexels,
  fetchFipeBrands,
  fetchFipeModels,
  fetchFipePrice,
  fetchFipeYears,
  parseFipePrice,
  type FipeBrand,
  type FipeModel,
  type FipeYear,
} from '../../services/carApi';
import { createVehicleListing } from '../../services/vehicleListings';
import {
  BADGES,
  CATEGORIES,
  FUELS,
  TRANSMISSIONS,
  type Badge,
  type Category,
  type CreateVehicleListingInput,
  type Fuel,
  type Transmission,
} from '../../types/VehicleListing';
import './PublicarVeiculo.css';

const CATEGORY_LABEL: Record<Category, string> = {
  suv: 'SUV',
  sedan: 'Sedan',
  hatch: 'Hatch',
  pickup: 'Pickup',
};

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});
const KM_FMT = new Intl.NumberFormat('pt-BR');

interface FormState {
  brandCode: string;
  modelCode: string;
  yearCode: string;
  brandName: string;
  modelName: string;
  year: string;
  category: Category | '';
  color: string;
  km: string;
  price: string;
  fuel: Fuel | '';
  transmission: Transmission | '';
  badge: Badge | '';
  description: string;
}

const INITIAL_FORM: FormState = {
  brandCode: '',
  modelCode: '',
  yearCode: '',
  brandName: '',
  modelName: '',
  year: '',
  category: '',
  color: '',
  km: '',
  price: '',
  fuel: '',
  transmission: '',
  badge: '',
  description: '',
};

function formatKmInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 6);
  return digits ? KM_FMT.format(Number(digits)) : '';
}

function formatPriceInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 7);
  if (!digits) return '';
  return BRL.format(Number(digits)).replace('R$', 'R$ ').trim();
}

function parsePriceToNumber(value: string): number | null {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  return Number(digits);
}

function parseKmToNumber(value: string): number | null {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  return Number(digits);
}

export default function PublicarVeiculo() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [brands, setBrands] = useState<FipeBrand[]>([]);
  const [models, setModels] = useState<FipeModel[]>([]);
  const [years, setYears] = useState<FipeYear[]>([]);

  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // ── Carrega marcas FIPE ──
  useEffect(() => {
    let cancelled = false;
    setBrandsLoading(true);
    setBrandsError(null);
    fetchFipeBrands()
      .then(data => {
        if (cancelled) return;
        setBrands(data);
      })
      .catch(() => {
        if (!cancelled) setBrandsError('Não foi possível carregar as marcas. Tente recarregar.');
      })
      .finally(() => {
        if (!cancelled) setBrandsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Carrega modelos quando muda a marca ──
  useEffect(() => {
    if (!form.brandCode) {
      setModels([]);
      return;
    }
    let cancelled = false;
    setModelsLoading(true);
    fetchFipeModels(form.brandCode)
      .then(data => { if (!cancelled) setModels(data); })
      .catch(() => { if (!cancelled) setModels([]); })
      .finally(() => { if (!cancelled) setModelsLoading(false); });
    return () => { cancelled = true; };
  }, [form.brandCode]);

  // ── Carrega anos quando muda o modelo ──
  useEffect(() => {
    if (!form.brandCode || !form.modelCode) {
      setYears([]);
      return;
    }
    let cancelled = false;
    setYearsLoading(true);
    fetchFipeYears(form.brandCode, form.modelCode)
      .then(data => { if (!cancelled) setYears(data); })
      .catch(() => { if (!cancelled) setYears([]); })
      .finally(() => { if (!cancelled) setYearsLoading(false); });
    return () => { cancelled = true; };
  }, [form.brandCode, form.modelCode]);

  // ── Quando escolhe ano, busca preço FIPE sugerido + ano numérico ──
  useEffect(() => {
    if (!form.brandCode || !form.modelCode || !form.yearCode) return;
    const yearName = years.find(y => y.code === form.yearCode)?.name ?? '';
    const yearNum = parseInt(yearName, 10);
    setForm(f => ({ ...f, year: Number.isFinite(yearNum) ? String(yearNum) : f.year }));

    fetchFipePrice(form.brandCode, form.modelCode, form.yearCode).then(res => {
      if (!res) return;
      const num = parseFipePrice(res.price);
      if (num && !form.price) {
        setForm(f => ({ ...f, price: BRL.format(num).replace('R$', 'R$ ').trim() }));
      }
    });
  }, [form.brandCode, form.modelCode, form.yearCode, years]);

  // ── Foto via Pexels quando marca+modelo estão definidos ──
  useEffect(() => {
    if (!form.brandName || !form.modelName) {
      setPhotoUrl(null);
      return;
    }
    let cancelled = false;
    carPhotoPexels(form.brandName, form.modelName).then(url => {
      if (!cancelled) setPhotoUrl(url);
    });
    return () => { cancelled = true; };
  }, [form.brandName, form.modelName]);

  // ── Handlers ──
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function onBrandChange(code: string) {
    const brand = brands.find(b => b.code === code);
    setForm(f => ({
      ...f,
      brandCode: code,
      brandName: brand?.name ?? '',
      modelCode: '',
      modelName: '',
      yearCode: '',
      year: '',
    }));
  }

  function onModelChange(code: string) {
    const model = models.find(m => String(m.code) === code);
    setForm(f => ({
      ...f,
      modelCode: code,
      modelName: model?.name ?? '',
      yearCode: '',
      year: '',
    }));
  }

  const canSubmit = useMemo(() => {
    return (
      !!form.brandName &&
      !!form.modelName &&
      !!form.year &&
      !!form.category &&
      parsePriceToNumber(form.price) !== null &&
      parseKmToNumber(form.km) !== null
    );
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    const price = parsePriceToNumber(form.price);
    const km = parseKmToNumber(form.km);
    const year = parseInt(form.year, 10);

    if (price === null || km === null || !Number.isFinite(year)) {
      setError('Preencha preço, km e ano corretamente.');
      setSubmitting(false);
      return;
    }

    const payload: CreateVehicleListingInput = {
      brand: form.brandName.trim(),
      model: form.modelName.trim(),
      year,
      price,
      km,
      category: form.category as Category,
    };
    if (form.fuel)         payload.fuel = form.fuel;
    if (form.transmission) payload.transmission = form.transmission;
    if (form.color)        payload.color = form.color.trim();
    if (form.description)  payload.description = form.description.trim();
    if (form.badge)        payload.badge = form.badge;
    if (photoUrl)          payload.photoUrl = photoUrl;

    try {
      await createVehicleListing(payload);
      navigate('/minhas-publicacoes', { state: { justCreated: true } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível enviar a publicação. Tente novamente.';
      setError(msg);
      setSubmitting(false);
    }
  }

  // ── Preview ──
  const previewPrice = parsePriceToNumber(form.price);
  const previewKm = parseKmToNumber(form.km);

  return (
    <div className="pv-page">
      <header className="pv-header">
        <div>
          <h1 className="pv-title">Publicar veículo</h1>
          <p className="pv-subtitle">A publicação fica em moderação até ser aprovada pelo gerente.</p>
        </div>
        <button
          type="button"
          className="pv-link"
          onClick={() => navigate('/minhas-publicacoes')}
        >
          Minhas publicações →
        </button>
      </header>

      <div className="pv-layout">
        <form className="pv-form" onSubmit={onSubmit}>
          {/* Seção 1: Identificação */}
          <section className="pv-section">
            <h2 className="pv-section__title">Identificação</h2>

            <div className="pv-grid pv-grid--2">
              <label className="pv-field">
                <span>Marca *</span>
                <select
                  value={form.brandCode}
                  onChange={e => onBrandChange(e.target.value)}
                  disabled={brandsLoading || !!brandsError}
                  required
                >
                  <option value="">{brandsLoading ? 'Carregando…' : 'Selecione…'}</option>
                  {brands.map(b => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
                {brandsError && <small className="pv-error">{brandsError}</small>}
              </label>

              <label className="pv-field">
                <span>Modelo *</span>
                <select
                  value={form.modelCode}
                  onChange={e => onModelChange(e.target.value)}
                  disabled={!form.brandCode || modelsLoading}
                  required
                >
                  <option value="">
                    {!form.brandCode ? 'Escolha a marca' : modelsLoading ? 'Carregando…' : 'Selecione…'}
                  </option>
                  {models.map(m => (
                    <option key={m.code} value={String(m.code)}>{m.name}</option>
                  ))}
                </select>
              </label>

              <label className="pv-field">
                <span>Ano *</span>
                <select
                  value={form.yearCode}
                  onChange={e => set('yearCode', e.target.value)}
                  disabled={!form.modelCode || yearsLoading}
                  required
                >
                  <option value="">
                    {!form.modelCode ? 'Escolha o modelo' : yearsLoading ? 'Carregando…' : 'Selecione…'}
                  </option>
                  {years.map(y => (
                    <option key={y.code} value={y.code}>{y.name}</option>
                  ))}
                </select>
              </label>

              <label className="pv-field">
                <span>Cor</span>
                <input
                  type="text"
                  value={form.color}
                  onChange={e => set('color', e.target.value)}
                  maxLength={30}
                  placeholder="Ex.: Prata"
                />
              </label>
            </div>

            <div className="pv-chips-label">Categoria *</div>
            <div className="pv-chips">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`pv-chip ${form.category === c ? 'pv-chip--active' : ''}`}
                  onClick={() => set('category', c)}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </section>

          {/* Seção 2: Especificações */}
          <section className="pv-section">
            <h2 className="pv-section__title">Especificações</h2>
            <div className="pv-grid pv-grid--2">
              <label className="pv-field">
                <span>Quilometragem *</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.km}
                  onChange={e => set('km', formatKmInput(e.target.value))}
                  placeholder="0"
                  required
                />
              </label>

              <label className="pv-field">
                <span>Preço *</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.price}
                  onChange={e => set('price', formatPriceInput(e.target.value))}
                  placeholder="R$ 0,00"
                  required
                />
                <small className="pv-hint">Pré-preenchido com tabela FIPE quando disponível.</small>
              </label>

              <label className="pv-field">
                <span>Combustível</span>
                <select value={form.fuel} onChange={e => set('fuel', e.target.value as Fuel | '')}>
                  <option value="">Selecione…</option>
                  {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>

              <label className="pv-field">
                <span>Câmbio</span>
                <select
                  value={form.transmission}
                  onChange={e => set('transmission', e.target.value as Transmission | '')}
                >
                  <option value="">Selecione…</option>
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            </div>
          </section>

          {/* Seção 3: Descrição */}
          <section className="pv-section">
            <h2 className="pv-section__title">Descrição</h2>
            <label className="pv-field">
              <span>Texto (opcional, até 500 caracteres)</span>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Único dono, IPVA pago, revisões em dia…"
              />
              <small className="pv-hint">{form.description.length}/500</small>
            </label>

            <div className="pv-chips-label">Destaque na vitrine</div>
            <div className="pv-chips">
              <button
                type="button"
                className={`pv-chip ${!form.badge ? 'pv-chip--active' : ''}`}
                onClick={() => set('badge', '')}
              >
                Sem destaque
              </button>
              {BADGES.map(b => (
                <button
                  key={b}
                  type="button"
                  className={`pv-chip pv-chip--badge pv-chip--${b} ${form.badge === b ? 'pv-chip--active' : ''}`}
                  onClick={() => set('badge', b)}
                >
                  {b === 'novo' ? 'Novo' : b === 'destaque' ? 'Destaque' : 'Oferta'}
                </button>
              ))}
            </div>
          </section>

          {error && <div className="pv-banner pv-banner--error">{error}</div>}

          <div className="pv-actions">
            <button type="button" className="pv-btn pv-btn--ghost" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="pv-btn pv-btn--primary" disabled={!canSubmit || submitting}>
              {submitting ? 'Enviando…' : 'Enviar para aprovação'}
            </button>
          </div>
        </form>

        {/* Preview ao vivo */}
        <aside className="pv-preview" aria-label="Pré-visualização">
          <div className="pv-preview__label">Pré-visualização</div>
          <div className="pv-preview__card">
            <div className="pv-preview__img">
              {photoUrl ? (
                <img src={photoUrl} alt="" />
              ) : (
                <div className="pv-preview__img-fallback">Foto aparecerá ao escolher marca e modelo</div>
              )}
              {form.badge && (
                <span className={`pv-preview__badge pv-preview__badge--${form.badge}`}>
                  {form.badge === 'novo' ? 'Novo' : form.badge === 'destaque' ? 'Destaque' : 'Oferta'}
                </span>
              )}
            </div>
            <div className="pv-preview__body">
              <div className="pv-preview__meta">
                <span>{form.brandName || 'Marca'}</span>
                <span>{form.year || '—'}</span>
              </div>
              <h3 className="pv-preview__model">{form.modelName || 'Modelo'}</h3>
              <div className="pv-preview__specs">
                <span>{form.fuel || '—'}</span>
                <span>·</span>
                <span>{previewKm !== null ? `${KM_FMT.format(previewKm)} km` : '— km'}</span>
                <span>·</span>
                <span>{form.transmission || '—'}</span>
              </div>
              <div className="pv-preview__price">
                {previewPrice !== null ? BRL.format(previewPrice) : 'R$ —'}
              </div>
              {form.category && (
                <div className="pv-preview__category">{CATEGORY_LABEL[form.category]}</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

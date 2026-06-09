import { useEffect, useMemo, useState } from 'react';
import {
  buildWhatsappLink,
  daysSinceContact,
  fetchRecapture,
  markLeadContacted,
  renderTemplate,
  type RecaptureLead,
} from '../../services/recapture';
import './Repescagem.css';

const TEMPLATE_STORAGE_KEY = 'valle:recapture:template';
const DEFAULT_TEMPLATE =
  'Olá {nome}! Aqui é da 1000 Valle Multimarcas. Notei que faz {dias} dias desde nosso último contato e quero saber se você ainda tem interesse no veículo que conversamos. Posso te ajudar com mais alguma informação?';

const DAYS_FILTERS = [30, 60, 90] as const;
type DaysFilter = (typeof DAYS_FILTERS)[number];

function tempLabel(d: number): { label: string; tone: 'warm' | 'cold' | 'frozen' } {
  if (d >= 90) return { label: `${d} dias`, tone: 'frozen' };
  if (d >= 60) return { label: `${d} dias`, tone: 'cold' };
  return { label: `${d} dias`, tone: 'warm' };
}

export default function Repescagem() {
  const [days, setDays] = useState<DaysFilter>(30);
  const [leads, setLeads] = useState<RecaptureLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState(
    () => localStorage.getItem(TEMPLATE_STORAGE_KEY) ?? DEFAULT_TEMPLATE,
  );
  const [toast, setToast] = useState('');

  const atendenteNome = localStorage.getItem('@LeadsCar:userName') ?? 'nossa equipe';

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchRecapture(days)
      .then(res => setLeads(res.leads))
      .catch(() => setError('Não foi possível carregar a lista de repescagem.'))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, template);
  }, [template]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function onMarkContacted(lead: RecaptureLead) {
    try {
      await markLeadContacted(lead.id);
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      setToast(`Contato com ${lead.name ?? 'lead'} registrado.`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível registrar o contato.';
      setToast(msg);
    }
  }

  const total = leads.length;

  const distribuicao = useMemo(() => {
    const buckets = { warm: 0, cold: 0, frozen: 0 };
    for (const l of leads) {
      const d = daysSinceContact(l);
      if (d >= 90) buckets.frozen++;
      else if (d >= 60) buckets.cold++;
      else buckets.warm++;
    }
    return buckets;
  }, [leads]);

  return (
    <div className="rec-page">
      <header className="rec-header">
        <div>
          <h1 className="rec-title">Repescagem de leads</h1>
          <p className="rec-subtitle">
            Leads sem contato há mais de {days} dias. Reabra a conversa antes que esfriem de vez.
          </p>
        </div>
      </header>

      <div className="rec-stats">
        <div className="rec-stat">
          <span className="rec-stat__label">Total para repescar</span>
          <strong className="rec-stat__value">{total}</strong>
        </div>
        <div className="rec-stat rec-stat--warm">
          <span className="rec-stat__label">30–59 dias</span>
          <strong className="rec-stat__value">{distribuicao.warm}</strong>
        </div>
        <div className="rec-stat rec-stat--cold">
          <span className="rec-stat__label">60–89 dias</span>
          <strong className="rec-stat__value">{distribuicao.cold}</strong>
        </div>
        <div className="rec-stat rec-stat--frozen">
          <span className="rec-stat__label">90+ dias</span>
          <strong className="rec-stat__value">{distribuicao.frozen}</strong>
        </div>
      </div>

      <div className="rec-toolbar">
        <div className="rec-filters">
          {DAYS_FILTERS.map(d => (
            <button
              key={d}
              className={`rec-filter ${days === d ? 'rec-filter--active' : ''}`}
              onClick={() => setDays(d)}
            >
              {d}+ dias
            </button>
          ))}
        </div>
      </div>

      <details className="rec-template">
        <summary>Mensagem padrão · variáveis: {'{nome}'}, {'{dias}'}, {'{atendente}'}</summary>
        <textarea
          value={template}
          onChange={e => setTemplate(e.target.value)}
          rows={3}
          maxLength={600}
        />
        <small>Salvo automaticamente. Visualize o resultado clicando em "Mensagem" no card.</small>
      </details>

      {loading ? (
        <div className="rec-empty">Carregando…</div>
      ) : error ? (
        <div className="rec-empty">{error}</div>
      ) : leads.length === 0 ? (
        <div className="rec-empty">
          <strong>Tudo em dia!</strong>
          <p>Nenhum lead sem contato há mais de {days} dias no seu escopo.</p>
        </div>
      ) : (
        <div className="rec-list">
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              template={template}
              atendenteNome={atendenteNome}
              onMarkContacted={onMarkContacted}
            />
          ))}
        </div>
      )}

      {toast && <div className="rec-toast">{toast}</div>}
    </div>
  );
}

function LeadCard({
  lead,
  template,
  atendenteNome,
  onMarkContacted,
}: {
  lead: RecaptureLead;
  template: string;
  atendenteNome: string;
  onMarkContacted: (l: RecaptureLead) => void;
}) {
  const dias = daysSinceContact(lead);
  const { label, tone } = tempLabel(dias);
  const mensagem = renderTemplate(template, {
    nome: lead.name ?? lead.client?.name ?? null,
    dias,
    atendente: atendenteNome,
  });

  const phone = lead.phone ?? lead.client?.email ?? null;
  const whatsappHref = lead.phone ? buildWhatsappLink(lead.phone, mensagem) : null;
  const telHref = lead.phone ? `tel:${lead.phone.replace(/\D/g, '')}` : null;
  const emailAddr = lead.client?.email ?? null;
  const mailHref = emailAddr
    ? `mailto:${emailAddr}?subject=${encodeURIComponent('Retomando contato — 1000 Valle')}&body=${encodeURIComponent(mensagem)}`
    : null;

  return (
    <article className="rec-card">
      <div className="rec-card__head">
        <div>
          <h3 className="rec-card__name">{lead.name ?? lead.client?.name ?? 'Sem nome'}</h3>
          <div className="rec-card__meta">
            {phone && <span>{phone}</span>}
            {lead.status && <span>· {lead.status.replace('_', ' ')}</span>}
            {lead.origin && <span>· {lead.origin}</span>}
            {lead.user?.name && <span>· {lead.user.name}</span>}
          </div>
        </div>
        <span className={`rec-pill rec-pill--${tone}`}>{label}</span>
      </div>

      <div className="rec-card__actions">
        {whatsappHref ? (
          <a className="rec-btn rec-btn--whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        ) : null}
        {telHref ? (
          <a className="rec-btn rec-btn--phone" href={telHref}>
            Ligar
          </a>
        ) : null}
        {mailHref ? (
          <a className="rec-btn rec-btn--email" href={mailHref}>
            E-mail
          </a>
        ) : null}
        <button className="rec-btn rec-btn--mark" onClick={() => onMarkContacted(lead)}>
          Marcar como contatado
        </button>
      </div>
    </article>
  );
}

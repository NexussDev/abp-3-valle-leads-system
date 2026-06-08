import { useEffect, useMemo, useState, CSSProperties } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

import { fetchLeads, ApiLead } from '../../services/leadsApi';
import {
  fetchDashboardOperacional,
  fetchDashboardAnalytico,
  DashboardOperacional,
  DashboardAnalytico,
} from '../../services/dashboardApi';

type Role = 'ADMIN' | 'GERENTE' | 'LIDER_EQUIPE' | 'ATENDENTE';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  novo_lead:  'Novo Lead',
  contato:    'Contato',
  proposta:   'Proposta',
  negociacao: 'Negociação',
  fechado:    'Fechado',
};

const STAGE_COLORS: Record<string, string> = {
  novo_lead:  '#3b82f6',
  contato:    '#8b5cf6',
  proposta:   '#f59e0b',
  negociacao: '#f97316',
  fechado:    '#10b981',
};

const ORIGIN_COLORS: Record<string, string> = {
  instagram:     '#d4395b',
  whatsapp:      '#25d366',
  facebook:      '#0857be',
  site:          '#f6f03b',
  'indicação':   '#8b5cf6',
  telefone:      '#06b6d4',
  'loja física': '#f97316',
  outro:         '#64748b',
  outros:        '#64748b',
};

const BAR_PALETTE = ['#c0392b','#3b82f6','#8b5cf6','#f97316','#10b981','#f59e0b','#06b6d4','#ec4899'];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function cap(s: string) {
  return s.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function countBy<K extends string>(
  items: ApiLead[],
  key: (l: ApiLead) => K | null | undefined,
): { name: K; value: number }[] {
  const map: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    map[k] = (map[k] ?? 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name: name as K, value }));
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Hero({ badge, name, subtitle }: { badge: string; name: string; subtitle: string }) {
  return (
    <section style={heroStyle}>
      <div>
        <span style={badgeStyle}>{badge}</span>
        <h1 style={titleStyle}>Olá, {name.split(' ')[0]}!</h1>
        <p style={subtitleStyle}>{subtitle}</p>
      </div>
      <img src="/logo.png" alt="1000 Valle" style={logoStyle} />
    </section>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={statCardStyle}>
      <div style={{ ...topLineStyle, backgroundColor: color }} />
      <span style={statLabelStyle}>{label}</span>
      <strong style={statValueStyle}>{value}</strong>
    </div>
  );
}

function ChartCard({ title, subtitle, height = 230, children }: {
  title: string; subtitle: string; height?: number; children: React.ReactNode;
}) {
  return (
    <section style={chartCardStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>{title}</h2>
          <p style={sectionSubtitleStyle}>{subtitle}</p>
        </div>
      </div>
      <div style={{ height }}>{children}</div>
    </section>
  );
}

function PieSection({ title, subtitle, data }: {
  title: string; subtitle: string;
  data: { name: string; value: number; color: string }[];
}) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={50} outerRadius={76} paddingAngle={4} dataKey="value">
            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip />
          <Legend formatter={(v) => <span style={{ color: '#111827', fontWeight: 400 }}>{cap(String(v))}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function BarSection({ title, subtitle, data, dataKey = 'value' }: {
  title: string; subtitle: string; height?: number;
  data: { name: string; value: number; fill?: string }[];
  dataKey?: string;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle} height={260}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={60} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
            {data.map((e, i) => <Cell key={i} fill={e.fill ?? BAR_PALETTE[i % BAR_PALETTE.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ConversionBanner({ value, label }: { value: string | number; label: string }) {
  return (
    <section style={conversionStyle}>
      <div>
        <h2 style={sectionTitleStyle}>Taxa de Conversão</h2>
        <p style={sectionSubtitleStyle}>{label}</p>
      </div>
      <strong style={conversionValueStyle}>{value}</strong>
    </section>
  );
}

function LeadsList({ leads, title, subtitle }: {
  leads: ApiLead[]; title: string; subtitle: string;
}) {
  return (
    <section style={chartCardStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>{title}</h2>
          <p style={sectionSubtitleStyle}>{subtitle}</p>
        </div>
      </div>
      {leads.length === 0 ? (
        <div style={emptyStyle}>Nenhuma lead encontrada.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leads.slice(0, 5).map(lead => (
            <div key={lead.id} style={leadItemStyle}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ color: '#1a1a2e', fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {lead.name ?? lead.client?.name ?? 'Sem nome'}
                </strong>
                <p style={{ color: '#6b6b80', fontSize: 11, margin: '2px 0 0' }}>
                  {lead.user?.name ?? '—'} · {lead.team?.name ?? '—'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={originPillStyle}>{cap(lead.origin ?? 'Sem origem')}</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{STAGE_LABELS[lead.status ?? ''] ?? lead.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── ATENDENTE ────────────────────────────────────────────────────────────────
function AtendenteDashboard({ leads, userName }: { leads: ApiLead[]; userName: string }) {
  const total        = leads.length;
  const emContato    = leads.filter(l => l.status === 'contato').length;
  const emNegociacao = leads.filter(l => l.status === 'negociacao').length;
  const fechados     = leads.filter(l => l.status === 'fechado').length;
  const conversao    = total > 0 ? Math.round((fechados / total) * 100) : 0;

  const origemData = useMemo(() => countBy(leads, l => l.origin ? cap(l.origin) : 'Não informado').map(e => ({
    ...e, color: ORIGIN_COLORS[e.name.toLowerCase()] ?? '#94a3b8',
  })), [leads]);

  const latest = [...leads].sort((a, b) =>
    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  return (
    <>
      <Hero badge="Meu Pipeline" name={userName} subtitle="Acompanhe seus leads e o seu funil de vendas pessoal." />
      <div style={cardsGridStyle}>
        <StatCard label="Meus Leads"     value={total}        color="#c0392b" />
        <StatCard label="Em Contato"     value={emContato}    color="#8b5cf6" />
        <StatCard label="Em Negociação"  value={emNegociacao} color="#f97316" />
        <StatCard label="Fechados"       value={fechados}     color="#10b981" />
      </div>
      <div style={{ ...mainGridStyle, gridTemplateColumns: '1fr 1fr' }}>
        <PieSection title="Origem dos Meus Leads" subtitle="Canais que trouxeram seus leads" data={origemData} />
        <LeadsList leads={latest} title="Últimas Leads" subtitle="Leads mais recentes do seu pipeline" />
      </div>
      <ConversionBanner value={`${conversao}%`} label="Percentual dos seus leads que chegaram à etapa de venda." />
    </>
  );
}

// ─── LIDER DE EQUIPE ──────────────────────────────────────────────────────────
function LiderEquipeDashboard({ leads, userName }: { leads: ApiLead[]; userName: string }) {
  const total        = leads.length;
  const novos        = leads.filter(l => l.status === 'novo_lead').length;
  const emNegociacao = leads.filter(l => l.status === 'negociacao').length;
  const fechados     = leads.filter(l => l.status === 'fechado').length;

  const rankingData = useMemo(() =>
    countBy(leads, l => l.user?.name ?? 'Sem atendente')
      .sort((a, b) => b.value - a.value)
      .map((e, i) => ({ ...e, fill: BAR_PALETTE[i % BAR_PALETTE.length] })),
    [leads]
  );

  const funilData = useMemo(() =>
    Object.keys(STAGE_LABELS).map(stage => ({
      name: STAGE_LABELS[stage],
      value: leads.filter(l => l.status === stage).length,
      color: STAGE_COLORS[stage],
    })).filter(e => e.value > 0),
    [leads]
  );

  const followUp = useMemo(() =>
    [...leads]
      .filter(l => l.status !== 'fechado')
      .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()),
    [leads]
  );

  return (
    <>
      <Hero badge="Minha Equipe" name={userName} subtitle="Acompanhe a performance e o pipeline da sua equipe." />
      <div style={cardsGridStyle}>
        <StatCard label="Leads da Equipe"  value={total}        color="#c0392b" />
        <StatCard label="Novos Leads"      value={novos}        color="#3b82f6" />
        <StatCard label="Em Negociação"    value={emNegociacao} color="#f97316" />
        <StatCard label="Fechados"         value={fechados}     color="#10b981" />
      </div>
      <div style={{ ...mainGridStyle, gridTemplateColumns: '1.3fr 1fr' }}>
        <BarSection title="Ranking de Atendentes" subtitle="Leads por membro da equipe" data={rankingData} />
        <PieSection title="Funil da Equipe" subtitle="Distribuição por etapa" data={funilData} />
      </div>
      <LeadsList leads={followUp} title="Follow-up Necessário" subtitle="Leads mais antigos aguardando atualização" />
    </>
  );
}

// ─── GERENTE ─────────────────────────────────────────────────────────────────
function GerenteDashboard({ leads, userName }: { leads: ApiLead[]; userName: string }) {
  const total          = leads.length;
  const equipesAtivas  = new Set(leads.map(l => l.team?.id).filter(Boolean)).size;
  const leadsDoMes     = leads.filter(l => {
    if (!l.createdAt) return false;
    const d = new Date(l.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const fechados       = leads.filter(l => l.status === 'fechado').length;
  const conversao      = total > 0 ? Math.round((fechados / total) * 100) : 0;

  const equipeData = useMemo(() =>
    countBy(leads, l => l.team?.name ?? 'Sem equipe')
      .sort((a, b) => b.value - a.value)
      .map((e, i) => ({ ...e, fill: BAR_PALETTE[i % BAR_PALETTE.length] })),
    [leads]
  );

  const funilData = useMemo(() =>
    Object.keys(STAGE_LABELS).map(stage => ({
      name: STAGE_LABELS[stage],
      value: leads.filter(l => l.status === stage).length,
      color: STAGE_COLORS[stage],
    })).filter(e => e.value > 0),
    [leads]
  );

  const rankingAtendentes = useMemo(() =>
    countBy(leads, l => l.user?.name ?? 'Sem atendente').sort((a, b) => b.value - a.value),
    [leads]
  );

  return (
    <>
      <Hero badge="Visão da Loja" name={userName} subtitle="Gestão consolidada da loja — equipes, funil e conversão." />
      <div style={cardsGridStyle}>
        <StatCard label="Total Loja"       value={total}         color="#c0392b" />
        <StatCard label="Equipes Ativas"   value={equipesAtivas} color="#3b82f6" />
        <StatCard label="Leads do Mês"     value={leadsDoMes}    color="#f97316" />
        <StatCard label="Conversão"        value={`${conversao}%`} color="#10b981" />
      </div>
      <div style={{ ...mainGridStyle, gridTemplateColumns: '1.3fr 1fr' }}>
        <BarSection title="Comparativo entre Equipes" subtitle="Leads por equipe da loja" data={equipeData} />
        <PieSection title="Funil Consolidado" subtitle="Distribuição por etapa na loja" data={funilData} />
      </div>
      <section style={chartCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Ranking de Atendentes</h2>
            <p style={sectionSubtitleStyle}>Performance individual de todos os vendedores da loja</p>
          </div>
        </div>
        {rankingAtendentes.length === 0 ? (
          <div style={emptyStyle}>Sem dados ainda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rankingAtendentes.map((r, i) => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f9f9fb', borderRadius: 12, border: '1px solid #e4e4ea' }}>
                <span style={{ minWidth: 24, fontWeight: 900, fontSize: 14, color: i === 0 ? '#c0392b' : '#94a3b8' }}>
                  #{i + 1}
                </span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{r.name}</span>
                <span style={{ background: '#fdecea', color: '#c0392b', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 800 }}>
                  {r.value} lead{r.value !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ─── ADMIN — consome /api/dashboard e /api/dashboard/analytics ───────────────
function AdminDashboard({ userName }: { userName: string }) {
  const [operacional, setOperacional] = useState<DashboardOperacional | null>(null);
  const [analitico,   setAnalitico]   = useState<DashboardAnalytico   | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboardOperacional('month'),
      fetchDashboardAnalytico('month'),
    ])
      .then(([op, an]) => {
        setOperacional(op);
        setAnalitico(an);
      })
      .catch(() => setError('Não foi possível carregar os dados do dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={emptyStyle}>Carregando dashboard…</div>;
  if (error || !operacional || !analitico) {
    return <div style={{ ...emptyStyle, color: '#c0392b' }}>{error ?? 'Erro inesperado.'}</div>;
  }

  const origemBarData = Object.entries(operacional.byOrigin)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value], i) => ({
      name: cap(name),
      value,
      fill: ORIGIN_COLORS[name.toLowerCase()] ?? BAR_PALETTE[i % BAR_PALETTE.length],
    }));

  const origemPieData = Object.entries(operacional.byOrigin).map(([name, value]) => ({
    name: cap(name),
    value,
    color: ORIGIN_COLORS[name.toLowerCase()] ?? '#94a3b8',
  }));

  const atendenteData = analitico.byAtendente
    .sort((a, b) => b.count - a.count)
    .map((r, i) => ({ name: r.atendente, value: r.count, fill: BAR_PALETTE[i % BAR_PALETTE.length] }));

  const closingData = analitico.closingReasons
    .sort((a, b) => b.count - a.count)
    .map((r, i) => ({ name: r.motivo, value: r.count, fill: BAR_PALETTE[i % BAR_PALETTE.length] }));

  return (
    <>
      <Hero badge="Dashboard Admin" name={userName} subtitle="Visão completa do sistema — todas as lojas e equipes." />

      {/* Métricas operacionais vindas da API */}
      <div style={cardsGridStyle}>
        <StatCard label="Total Sistema"   value={operacional.total}   color="#c0392b" />
        <StatCard label="Fechados"        value={operacional.fechados} color="#10b981" />
        <StatCard label="Taxa Conversão"  value={operacional.conversao} color="#8b5cf6" />
        <StatCard
          label="Tempo Médio Atend."
          value={analitico.tempoMedioAtendimentoHoras ? `${analitico.tempoMedioAtendimentoHoras}h` : '—'}
          color="#f97316"
        />
      </div>

      {/* Gráficos de origem */}
      <div style={{ ...mainGridStyle, gridTemplateColumns: '1.3fr 1fr' }}>
        <BarSection title="Leads por Canal" subtitle="Distribuição de origem em todo o sistema" data={origemBarData} />
        <PieSection title="Distribuição por Origem" subtitle="Proporção de canais de captação" data={origemPieData} />
      </div>

      {/* Ranking de atendentes (analítico) */}
      {atendenteData.length > 0 && (
        <BarSection
          title="Ranking de Atendentes"
          subtitle="Leads por vendedor em todo o sistema"
          data={atendenteData}
        />
      )}

      {/* Motivos de fechamento */}
      {closingData.length > 0 && (
        <BarSection
          title="Motivos de Fechamento"
          subtitle="Por que as negociações foram encerradas"
          data={closingData}
        />
      )}

      <ConversionBanner
        value={analitico.taxaConversao}
        label="Percentual de leads convertidos em vendas no período."
      />
    </>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const role     = (localStorage.getItem('@LeadsCar:role') as Role) || 'ATENDENTE';
  const userName = localStorage.getItem('@LeadsCar:userName') || 'Colaborador';

  const [leads, setLeads] = useState<ApiLead[]>([]);

  useEffect(() => {
    // ADMIN usa exclusivamente os endpoints /api/dashboard e /api/dashboard/analytics.
    // Os demais perfis continuam usando /api/leads (filtrado pelo backend via RBAC).
    if (role === 'ADMIN') return;

    const load = async () => {
      try {
        const data = await fetchLeads();
        setLeads(data);
      } catch {
        setLeads([]);
      }
    };

    load();
    window.addEventListener('focus', load);
    document.addEventListener('visibilitychange', load);
    return () => {
      window.removeEventListener('focus', load);
      document.removeEventListener('visibilitychange', load);
    };
  }, [role]);

  return (
    <div style={pageStyle}>
      {role === 'ATENDENTE'    && <AtendenteDashboard   leads={leads} userName={userName} />}
      {role === 'LIDER_EQUIPE' && <LiderEquipeDashboard leads={leads} userName={userName} />}
      {role === 'GERENTE'      && <GerenteDashboard     leads={leads} userName={userName} />}
      {(role === 'ADMIN' || role === 'GERENTE_GERAL') && <AdminDashboard userName={userName} />}
    </div>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const pageStyle: CSSProperties = {
  minHeight: '100%',
  padding: '28px',
  background: '#f4f4f7',
  fontFamily: 'DM Sans, sans-serif',
};

const heroStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #1a0a08 0%, #2c0f0a 48%, #0f0f14 100%)',
  borderRadius: 24,
  padding: '32px',
  marginBottom: 24,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: '#fff',
  boxShadow: '0 24px 64px rgba(0,0,0,.12)',
};

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  background: '#fdecea',
  color: '#c0392b',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  padding: '6px 12px',
  borderRadius: 999,
  marginBottom: 14,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 34,
  fontWeight: 800,
  letterSpacing: '-.03em',
};

const subtitleStyle: CSSProperties = {
  margin: '8px 0 0',
  color: 'rgba(255,255,255,.62)',
  fontSize: 15,
};

const logoStyle: CSSProperties = {
  width: 140,
  filter: 'brightness(0) invert(1)',
};

const cardsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 18,
  marginBottom: 24,
};

const statCardStyle: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  background: '#fff',
  border: '1px solid #e4e4ea',
  borderRadius: 18,
  padding: 22,
  boxShadow: '0 12px 30px rgba(15,15,20,.06)',
};

const topLineStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 4,
};

const statLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: '#6b6b80',
  fontWeight: 700,
  marginBottom: 8,
};

const statValueStyle: CSSProperties = {
  display: 'block',
  fontSize: 34,
  color: '#1a1a2e',
  fontWeight: 800,
};

const mainGridStyle: CSSProperties = {
  display: 'grid',
  gap: 18,
  marginBottom: 24,
};

const chartCardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e4e4ea',
  borderRadius: 20,
  padding: 22,
  marginBottom: 24,
  boxShadow: '0 12px 30px rgba(15,15,20,.06)',
};

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 12,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: '#1a1a2e',
  fontSize: 17,
  fontWeight: 800,
};

const sectionSubtitleStyle: CSSProperties = {
  margin: '4px 0 0',
  color: '#6b6b80',
  fontSize: 13,
};

const leadItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  background: '#f9f9fb',
  border: '1px solid #e4e4ea',
  borderRadius: 14,
  padding: '12px 14px',
};

const originPillStyle: CSSProperties = {
  background: '#fdecea',
  color: '#c0392b',
  borderRadius: 999,
  padding: '5px 10px',
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: 'nowrap',
};

const emptyStyle: CSSProperties = {
  color: '#6b6b80',
  fontSize: 14,
  background: '#f9f9fb',
  borderRadius: 14,
  padding: 18,
  textAlign: 'center',
};

const conversionStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e4e4ea',
  borderRadius: 20,
  padding: 24,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 12px 30px rgba(15,15,20,.06)',
  marginBottom: 24,
};

const conversionValueStyle: CSSProperties = {
  color: '#c0392b',
  fontSize: 42,
  fontWeight: 900,
};

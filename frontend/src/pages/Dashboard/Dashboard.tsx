import { useEffect, useMemo, useState, CSSProperties } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { getStoredLeads } from '../Leads/data/mockLeadStorage';
import { Lead } from '../Leads/types';

type Role = 'ADMIN' | 'GERENTE' | 'LIDER';

const STAGE_LABELS: Record<string, string> = {
  novo_lead: 'Novos Leads',
  contato_realizado: 'Contato Realizado',
  agendamento_visita: 'Visita Agendada',
  proposta_enviada: 'Proposta Enviada',
  em_negociacao: 'Em Negociação',
  vendido: 'Vendido',
};

const STAGE_COLORS: Record<string, string> = {
  novo_lead: '#3b82f6',
  contato_realizado: '#8b5cf6',
  agendamento_visita: '#f59e0b',
  proposta_enviada: '#ec4899',
  em_negociacao: '#f97316',
  vendido: '#10b981',
};

const ORIGIN_COLORS: Record<string, string> = {
  instagram: '#d4395b',
  whatsapp: '#25d366',
  facebook: '#0857be',
  site: '#f6f03b',
  indicação: '#8b5cf6',
  outro: '#64748b',
  outros: '#64748b',
  'não informado': '#94a3b8',
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Dashboard() {
  const USER_ROLE = (localStorage.getItem('@LeadsCar:role') as Role) || 'LIDER';
  const USER_NAME = localStorage.getItem('@LeadsCar:userName') || 'Colaborador';

  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const loadLeads = () => {
      setLeads(getStoredLeads());
    };

    loadLeads();

    window.addEventListener('mock-leads-updated', loadLeads);
    window.addEventListener('focus', loadLeads);
    document.addEventListener('visibilitychange', loadLeads);

    return () => {
      window.removeEventListener('mock-leads-updated', loadLeads);
      window.removeEventListener('focus', loadLeads);
      document.removeEventListener('visibilitychange', loadLeads);
    };
  }, []);

  const totalLeads = leads.length;
  const novosLeads = leads.filter(lead => lead.stage === 'novo_lead').length;
  const emNegociacao = leads.filter(lead => lead.stage === 'em_negociacao').length;
  const vendas = leads.filter(lead => lead.stage === 'vendido').length;

  const taxaConversao = totalLeads > 0 ? Math.round((vendas / totalLeads) * 100) : 0;

  const origemData = useMemo(() => {
    const counts = leads.reduce<Record<string, number>>((acc, lead) => {
      const origin = formatLabel(lead.origin || 'Não informado');
      acc[origin] = (acc[origin] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: ORIGIN_COLORS[name.toLowerCase()] || '#94a3b8',
    }));
  }, [leads]);

  const funilData = useMemo(() => {
    const counts = leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([stage, value]) => ({
      name: STAGE_LABELS[stage] || formatLabel(stage),
      value,
      color: STAGE_COLORS[stage] || '#94a3b8',
    }));
  }, [leads]);

  const barData = useMemo(() => {
    return Object.keys(STAGE_LABELS).map(stage => ({
      name: STAGE_LABELS[stage],
      total: leads.filter(lead => lead.stage === stage).length,
      fill: STAGE_COLORS[stage],
    }));
  }, [leads]);

  const latestLeads = [...leads].slice(-5).reverse();

  return (
    <div style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <span style={badgeStyle}>Dashboard Operacional</span>
          <h1 style={titleStyle}>Olá, {USER_NAME.split('.')[0]}!</h1>
          <p style={subtitleStyle}>
            {USER_ROLE === 'ADMIN'
              ? 'Visão geral dos leads cadastrados no sistema.'
              : 'Acompanhamento dos leads da sua equipe e do funil comercial.'}
          </p>
        </div>

        <img src="/logo.png" alt="1000 Valle" style={logoStyle} />
      </section>

      <div style={cardsGridStyle}>
        <StatCard label="Total de Leads" value={totalLeads} color="#c0392b" />
        <StatCard label="Novos Leads" value={novosLeads} color="#3b82f6" />
        <StatCard label="Em Negociação" value={emNegociacao} color="#f97316" />
        <StatCard label="Vendas" value={vendas} color="#10b981" />
      </div>

      <div style={mainGridStyle}>
        <section style={chartCardStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Origem dos Leads</h2>
              <p style={sectionSubtitleStyle}>Canais que trouxeram novos interessados</p>
            </div>
          </div>

          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={origemData}
                  innerRadius={50}
                  outerRadius={76}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {origemData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
  formatter={(value) => (
    <span
      style={{
        color: '#111827',
        fontWeight: 400,
      }}
    >
      {formatLabel(String(value))}
    </span>
  )}
/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section style={chartCardStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Status do Funil</h2>
              <p style={sectionSubtitleStyle}>Distribuição entre novos leads e negociações</p>
            </div>
          </div>

          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funilData}
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {funilData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
  formatter={(value) => (
    <span
      style={{
        color: '#111827',
        fontWeight: 400,
      }}
    >
      {formatLabel(String(value))}
    </span>
  )}
/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div style={secondaryGridStyle}>
        <section style={chartCardStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Leads por Etapa</h2>
              <p style={sectionSubtitleStyle}>Quantidade de leads em cada coluna do Kanban</p>
            </div>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section style={latestCardStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Últimas Leads</h2>
              <p style={sectionSubtitleStyle}>Novos interesses recebidos pelo formulário</p>
            </div>
          </div>

          {latestLeads.length === 0 ? (
            <div style={emptyStyle}>Nenhuma lead cadastrada ainda.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {latestLeads.map(lead => (
                <div key={lead.id} style={leadItemStyle}>
                  <div>
                    <strong style={{ color: '#1a1a2e', fontSize: 14 }}>
                      {lead.name}
                    </strong>
                    <p style={{ color: '#6b6b80', fontSize: 12, margin: '3px 0 0' }}>
                      {lead.leadNumber} • {lead.car || 'Veículo não informado'}
                    </p>
                  </div>

                  <span style={originPillStyle}>
                    {formatLabel(lead.origin || 'Sem origem')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section style={conversionStyle}>
        <div>
          <h2 style={sectionTitleStyle}>Taxa de Conversão</h2>
          <p style={sectionSubtitleStyle}>
            Percentual de leads que chegaram até a etapa de venda.
          </p>
        </div>

        <strong style={conversionValueStyle}>{taxaConversao}%</strong>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={statCardStyle}>
      <div style={{ ...topLineStyle, backgroundColor: color }} />
      <span style={statLabelStyle}>{label}</span>
      <strong style={statValueStyle}>{value}</strong>
    </div>
  );
}

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
  gridTemplateColumns: '1fr 1fr',
  gap: 18,
  marginBottom: 24,
};

const secondaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.35fr .85fr',
  gap: 18,
  marginBottom: 24,
};

const chartCardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e4e4ea',
  borderRadius: 20,
  padding: 22,
  boxShadow: '0 12px 30px rgba(15,15,20,.06)',
};

const latestCardStyle: CSSProperties = {
  ...chartCardStyle,
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
};

const conversionValueStyle: CSSProperties = {
  color: '#c0392b',
  fontSize: 42,
  fontWeight: 900,
};
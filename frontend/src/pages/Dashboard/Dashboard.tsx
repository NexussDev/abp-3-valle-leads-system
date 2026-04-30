import React, { useState, CSSProperties, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// ============================================================
// 1. DADOS DE ORIGEM
// ============================================================
const MOCK_LEADS_DATABASE = [
  { id: 1, origin: 'WhatsApp', status: 'Venda' },
  { id: 2, origin: 'Instagram', status: 'Novo' },
  { id: 3, origin: 'Instagram', status: 'Venda' },
  { id: 4, origin: 'Site', status: 'Novo' },
  { id: 5, origin: 'WhatsApp', status: 'Negociação' },
  { id: 6, origin: 'Facebook', status: 'Novo' },
  { id: 7, origin: 'WhatsApp', status: 'Venda' },
  { id: 8, origin: 'Instagram', status: 'Negociação' },
];

const COLORS: { [key: string]: string } = {
  Instagram: '#E1306C',
  WhatsApp: '#25D366',
  Facebook: '#1877F2',
  Site: '#3b82f6',
};

// ============================================================
// 2. COMPONENTE DE GRÁFICOS
// ============================================================
const LeadCharts = ({ leads }: { leads: any[] }) => {
  const dataOrigem = useMemo(() => {
    const counts = leads.reduce((acc: any, lead) => {
      acc[lead.origin] = (acc[lead.origin] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
      color: COLORS[key] || '#cbd5e1'
    }));
  }, [leads]);

  const dataConversao = useMemo(() => {
    const origins = ['Instagram', 'WhatsApp', 'Facebook', 'Site'];
    return origins.map(origin => {
      const leadsDaOrigem = leads.filter(l => l.origin === origin);
      const vendas = leadsDaOrigem.filter(l => l.status === 'Venda').length;
      const taxa = leadsDaOrigem.length > 0 ? (vendas / leadsDaOrigem.length) * 100 : 0;
      return { name: origin, conversao: Math.round(taxa) };
    });
  }, [leads]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
      <div style={chartCardStyle}>
        <h4 style={chartTitleStyle}>Origem dos Leads (Real Time)</h4>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dataOrigem} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {dataOrigem.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={chartCardStyle}>
        <h4 style={chartTitleStyle}>Taxa de Vendas por Origem (%)</h4>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataConversao}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
              <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="conversao" fill="#38a169" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 3. COMPONENTE PRINCIPAL DASHBOARD (CORRIGIDO)
// ============================================================
export default function Dashboard() {
  const [leads] = useState(MOCK_LEADS_DATABASE);

  const totalLeads = leads.length;
  const emNegociacao = leads.filter(l => l.status === 'Negociação').length;
  const vendas = leads.filter(l => l.status === 'Venda').length;

  return (
    <> {/* Removido a div flex e a Sidebar que causavam duplicidade */}
      <section style={bannerStyle}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '4px' }}>Gestão de performance em tempo real.</p>
        </div>
        <img src="/logo.png" alt="Carro" style={{ width: '180px' }} />
      </section>

      <LeadCharts leads={leads} />

      <div style={gridStyle}>
        <StatCard label="Total Leads" value={totalLeads.toString()} trend="Atualizado" color="#3b82f6" icon="👥" />
        <StatCard label="Em Negociação" value={emNegociacao.toString()} trend="Ativos" color="#f59e0b" icon="🤝" />
        <StatCard label="Vendas" value={vendas.toString()} trend="Concluídas" color="#10b981" icon="💰" />
      </div>
    </>
  );
}

// ============================================================
// COMPONENTES AUXILIARES E ESTILOS
// ============================================================
const StatCard = ({ label, value, trend, color, icon }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      style={{...cardStyle, transform: isHovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: isHovered ? '0 12px 24px -10px rgba(0,0,0,0.15)' : '0 4px 6px -1px rgba(0,0,0,0.05)'}}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ ...topLineStyle, backgroundColor: color }} />
      <div style={contentWrapper}>
        <div style={textSection}>
          <span style={labelStyle}>{label}</span>
          <strong style={valueStyle}>{value}</strong>
          <span style={{ ...trendStyle, color: color }}>{trend}</span>
        </div>
        <div style={{ ...iconCircle, backgroundColor: `${color}15`, color: color }}>{icon}</div>
      </div>
    </div>
  );
};

const bannerStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' };
const gridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' };
const cardStyle: CSSProperties = { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' };
const topLineStyle: CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, height: '4px' };
const contentWrapper: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const textSection: CSSProperties = { display: 'flex', flexDirection: 'column' };
const labelStyle: CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#64748b' };
const valueStyle: CSSProperties = { fontSize: '32px', fontWeight: 800, color: '#1e293b' };
const trendStyle: CSSProperties = { fontSize: '12px', fontWeight: 700 };
const iconCircle: CSSProperties = { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const chartCardStyle: CSSProperties = { backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const chartTitleStyle: CSSProperties = { fontSize: '16px', fontWeight: 700, color: '#475569', marginBottom: '20px' };
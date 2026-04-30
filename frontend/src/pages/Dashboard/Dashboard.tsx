import React, { useState, CSSProperties, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Tipagem dos perfis
type Role = 'ADMIN' | 'GERENTE' | 'LIDER';

// ============================================================
// 1. DADOS DE ORIGEM (MOCK)
// ============================================================
const MOCK_LEADS_DATABASE = [
  { id: 1, origin: 'WhatsApp', status: 'Venda', equipe: 'Norte' },
  { id: 2, origin: 'Instagram', status: 'Novo', equipe: 'Sul' },
  { id: 3, origin: 'Instagram', status: 'Venda', equipe: 'Norte' },
  { id: 4, origin: 'Site', status: 'Novo', equipe: 'Geral' },
  { id: 5, origin: 'WhatsApp', status: 'Negociação', equipe: 'Sul' },
  { id: 6, origin: 'Facebook', status: 'Novo', equipe: 'Norte' },
  { id: 7, origin: 'WhatsApp', status: 'Venda', equipe: 'Geral' },
  { id: 8, origin: 'Instagram', status: 'Negociação', equipe: 'Norte' },
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
const LeadCharts = ({ leads, role }: { leads: any[], role: Role }) => {
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
    <div style={{ display: 'grid', gridTemplateColumns: role === 'LIDER' ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
      <div style={chartCardStyle}>
        <h4 style={chartTitleStyle}>Origem dos Leads ({role === 'ADMIN' ? 'Geral' : 'Equipe'})</h4>
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

      {role !== 'LIDER' && (
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
      )}
    </div>
  );
};

// ============================================================
// 3. COMPONENTE PRINCIPAL DASHBOARD
// ============================================================
export default function Dashboard() {
  // ✅ DINÂMICO: Lê o cargo que salvamos no Login
  const USER_ROLE = (localStorage.getItem('@LeadsCar:role') as Role) || 'LIDER';
  const USER_NAME = localStorage.getItem('@LeadsCar:userName') || 'Colaborador';

  const [allLeads] = useState(MOCK_LEADS_DATABASE);

  const filteredLeads = useMemo(() => {
    if (USER_ROLE === 'ADMIN') return allLeads;
    // Gerente e Líder veem apenas a equipe "Norte"
    return allLeads.filter(l => l.equipe === 'Norte');
  }, [allLeads, USER_ROLE]);

  const totalLeads = filteredLeads.length;
  const emNegociacao = filteredLeads.filter(l => l.status === 'Negociação').length;
  const vendas = filteredLeads.filter(l => l.status === 'Venda').length;

  // ✅ Estilo do Badge movido para cá para evitar erro de tipos no TS
  const roleBadgeStyle: CSSProperties = {
    backgroundColor: USER_ROLE === 'ADMIN' ? '#dcfce7' : '#f1f5f9',
    color: USER_ROLE === 'ADMIN' ? '#166534' : '#475569',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  return (
    <div style={{ padding: '20px' }}>
      <section style={bannerStyle}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
               Olá, {USER_NAME.split('.')[0]}
             </h1>
             <span style={roleBadgeStyle}>{USER_ROLE}</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '4px' }}>
            {USER_ROLE === 'ADMIN' ? 'Visão global da operação.' : 'Visão limitada aos dados da sua equipe.'}
          </p>
        </div>
        <img src="/logo.png" alt="Logo" style={{ width: '150px' }} />
      </section>

      <LeadCharts leads={filteredLeads} role={USER_ROLE} />

      <div style={gridStyle}>
        <StatCard label={USER_ROLE === 'ADMIN' ? "Total Leads Geral" : "Leads Equipe"} value={totalLeads.toString()} trend="Sincronizado" color="#3b82f6" icon="👥" />
        <StatCard label="Em Negociação" value={emNegociacao.toString()} trend="Ativos" color="#f59e0b" icon="🤝" />
        <StatCard label="Vendas" value={vendas.toString()} trend="Concluídas" color="#10b981" icon="💰" />
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
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

// Estilos base
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
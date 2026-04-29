import React, { useState, CSSProperties } from 'react';

// 1. Definição do Componente StatCard (O "segundo" código)
// Colocamos ele aqui em cima ou em um arquivo separado para organizar
interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  color: string;
  icon: string;
}

const StatCard = ({ label, value, trend, color, icon }: StatCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{
        ...cardStyle,
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 12px 24px -10px rgba(0,0,0,0.15)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ ...topLineStyle, backgroundColor: color }} />
      <div style={contentWrapper}>
        <div style={textSection}>
          <span style={labelStyle}>{label}</span>
          <strong style={valueStyle}>{value}</strong>
          <span style={{ ...trendStyle, color: color }}>{trend}</span>
        </div>
        <div style={{ ...iconCircle, backgroundColor: `${color}15`, color: color }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

// 2. O Componente Principal do Dashboard
export default function Dashboard() {
  return (
    <div style={containerStyle}>
      {/* Banner Principal com a Logo e o Carro */}
      <section style={bannerStyle}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '4px' }}>
            Bem-vindo ao sistema de gestão LeadsCar.
          </p>
        </div>
        
        {/* Aqui você insere o caminho da sua logo ou imagem de carro */}
        <img 
          src="/logo-leadscar.png" 
          alt="Carro" 
          style={{ width: '180px', filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.1))' }} 
        />
      </section>

      {/* Grid onde os StatCards aparecem */}
      <div style={gridStyle}>
        <StatCard label="Total Leads" value="13" trend="↑ 12%" color="#3b82f6" icon="👥" />
        <StatCard label="Em Negociação" value="2" trend="→ 0%" color="#f59e0b" icon="🤝" />
        <StatCard label="Vendas" value="2" trend="↑ 8%" color="#10b981" icon="💰" />
      </div>
    </div>
  );
}

// --- ESTILOS COMPLEMENTARES ---
const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const bannerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#fff',
  padding: '32px',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px'
};

// (Copie aqui também os estilos cardStyle, labelStyle, etc., que passei na resposta anterior)
const cardStyle: CSSProperties = { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer' };
const topLineStyle: CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, height: '4px' };
const contentWrapper: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const textSection: CSSProperties = { display: 'flex', flexDirection: 'column' };
const labelStyle: CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' };
const valueStyle: CSSProperties = { fontSize: '32px', fontWeight: 800, color: '#1e293b' };
const trendStyle: CSSProperties = { fontSize: '12px', fontWeight: 700 };
const iconCircle: CSSProperties = { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
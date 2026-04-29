export default function Sidebar() {
  return (
    <aside style={sidebarStyle}>
      <div style={logoArea}>
        <span style={{ fontSize: '22px' }}>🏎️</span>
        <strong style={{ fontSize: '20px', color: '#fff' }}>LeadsCar</strong>
      </div>
      
      <nav style={navStyle}>
        <a href="/dashboard" style={navItemActive}>Dashboard</a>
        <a href="/leads" style={navItem}>Leads (Kanban)</a>
      </nav>
    </aside>
  );
}

const sidebarStyle: React.CSSProperties = {
  width: '260px',
  backgroundColor: '#0f172a',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px'
};

const logoArea: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '40px',
  paddingLeft: '12px'
};

const navStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
// Melhore o navItemActive no seu Sidebar.tsx
const navItemActive: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#fff',
  backgroundColor: '#3b82f6', // Um azul mais vivo
  padding: '12px 16px',
  borderRadius: '10px',
  textDecoration: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', // Efeito de brilho
};

const navItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#94a3b8',
  padding: '12px 16px',
  borderRadius: '10px',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
};
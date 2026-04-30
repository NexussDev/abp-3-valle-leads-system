export default function Header() {
  return (
    <header style={headerStyle}>
      <div style={{ color: '#64748b' }}>Sistema de Gestão de Leads</div>
      <div style={userBadge}>
        <span style={{ fontWeight: 600 }}>Olá, João</span>
        <div style={avatar}>J</div>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  height: '80px', // Um pouco mais alto para respirar
  backgroundColor: '#fff',
  borderBottom: '1px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 40px',
};

const userBadge: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#f8fafc',
  padding: '6px 14px',
  borderRadius: '50px', // Badge arredondado
  border: '1px solid #e2e8f0',
};

const avatar: React.CSSProperties = { width: '35px', height: '35px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
import React, { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 1. Definimos a interface para o TypeScript parar de dar erro
interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

// 2. Aplicamos a interface nas propriedades do componente
export const Sidebar = ({ isExpanded, toggleSidebar }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      style={{
        ...sidebarContainer, 
        width: isExpanded ? '260px' : '80px'
      }}
    >
      {/* Botão de Expandir/Recolher */}
      <div onClick={toggleSidebar} style={toggleButtonStyle}>
        {isExpanded ? '◀' : '▶'}
      </div>

      {/* Logo Section */}
      <div style={{...logoSection, justifyContent: isExpanded ? 'flex-start' : 'center'}}>
        <div style={logoIcon}>🚗</div>
        {isExpanded && <span style={logoText}>LeadsCar</span>}
      </div>

      {/* Navigation Links */}
      <nav style={navStyle}>
        <div 
          onClick={() => navigate('/dashboard')}
          style={isActive('/dashboard') ? activeLinkStyle : linkStyle}
        >
          <span>📊</span>
          {isExpanded && <span style={{ marginLeft: '12px' }}>Dashboard</span>}
        </div>
        
        <div 
          onClick={() => navigate('/leads')}
          style={isActive('/leads') ? activeLinkStyle : linkStyle}
        >
          <span>📋</span>
          {isExpanded && <span style={{ marginLeft: '12px' }}>Leads (Kanban)</span>}
        </div>
      </nav>
    </div>
  );
};

// --- ESTILOS MANTIDOS ---
const sidebarContainer: CSSProperties = {
  height: '100vh',
  backgroundColor: '#111827',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 12px',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 1000,
  transition: 'width 0.3s ease',
  overflow: 'hidden'
};

const toggleButtonStyle: CSSProperties = {
  position: 'absolute',
  right: '10px',
  top: '20px',
  cursor: 'pointer',
  backgroundColor: '#374151',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px'
};

const logoSection: CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', height: '40px' };
const logoIcon: CSSProperties = { fontSize: '24px' };
const logoText: CSSProperties = { fontSize: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' };
const navStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };

const baseLink: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: '0.2s',
  whiteSpace: 'nowrap'
};

const activeLinkStyle: CSSProperties = { ...baseLink, backgroundColor: '#3b82f6', color: '#fff' };
const linkStyle: CSSProperties = { ...baseLink, color: '#9ca3af' };
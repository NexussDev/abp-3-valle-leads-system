console.log('HEADER CARREGADO');
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aqui você pode limpar tokens de autenticação se houver
    console.log("Saindo da conta...");
    navigate('/login'); // Redireciona para a área de login do colaborador
  };

  return (
    <header style={headerStyle}>
      <div style={{ color: '#64748b', fontWeight: 500 }}>Sistema de Gestão de Leads</div>
      
      <div style={{ position: 'relative' }}>
        <div 
          style={userBadge} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>Olá, João</span>
          <div style={avatar}>J</div>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div style={dropdownStyle}>
            <button 
              style={menuItemStyle} 
              onClick={() => console.log("Configurações clicado (não funcional)")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Configurações
            </button>
            
            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
            
            <button 
              style={{ ...menuItemStyle, color: '#e53e3e' }} 
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Estilos
const headerStyle: React.CSSProperties = {
  height: '80px',
  backgroundColor: '#fff',
  borderBottom: '1px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 40px',
  flexShrink: 0,
};

const userBadge: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#f8fafc',
  padding: '6px 14px',
  borderRadius: '50px',
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const avatar: React.CSSProperties = { 
  width: '35px', 
  height: '35px', 
  backgroundColor: '#3b82f6', 
  color: '#fff', 
  borderRadius: '50%', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 'bold'
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '110%',
  right: '0',
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  border: '1px solid #f1f5f9',
  minWidth: '180px',
  padding: '8px',
  zIndex: 100,
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '10px 12px',
  border: 'none',
  background: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  textAlign: 'left',
  color: '#475569',
  transition: 'background 0.2s',
};
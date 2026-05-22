import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const rawName = localStorage.getItem('@LeadsCar:userName') || 'Usuário';
  const displayName = rawName.split('.')[0];
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('@LeadsCar:role');
    localStorage.removeItem('@LeadsCar:userName');
    navigate('/colaborador');
  };

  const handleSettings = () => {
    setIsMenuOpen(false);
    navigate('/perfil');
  };

  return (
    <header style={headerStyle}>
      <div style={{ color: '#64748b', fontWeight: 500, fontSize: 14 }}>
        1000 Valle — Gestão de Leads
      </div>

      <div style={{ position: 'relative' }}>
        <div
          style={userBadge}
          onClick={() => setIsMenuOpen(v => !v)}
        >
          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>
            Olá, {displayName}
          </span>
          <div style={avatar}>{initial}</div>
        </div>

        {isMenuOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 99 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <div style={dropdownStyle}>
              <button style={menuItemStyle} onClick={handleSettings}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Configurações
              </button>

              <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

              <button style={{ ...menuItemStyle, color: '#e53e3e' }} onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  height: 64,
  backgroundColor: '#fff',
  borderBottom: '1px solid #f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 32px',
  flexShrink: 0,
};

const userBadge: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  backgroundColor: '#f8fafc',
  padding: '6px 12px',
  borderRadius: 50,
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'background 0.2s',
  userSelect: 'none',
};

const avatar: React.CSSProperties = {
  width: 32,
  height: 32,
  backgroundColor: '#c0392b',
  color: '#fff',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 700,
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '110%',
  right: 0,
  backgroundColor: '#fff',
  borderRadius: 12,
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  border: '1px solid #f1f5f9',
  minWidth: 180,
  padding: 8,
  zIndex: 100,
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '10px 12px',
  border: 'none',
  background: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
  textAlign: 'left',
  color: '#475569',
  transition: 'background 0.2s',
};

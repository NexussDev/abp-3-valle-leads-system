import React, { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isExpanded: boolean;
}

// 1. Valores de role alinhados com os que o backend retorna (ex: 'ADMIN', não 'Admin')
const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    allowedRoles: ['ATENDENTE', 'LIDER_EQUIPE', 'GERENTE', 'GERENTE_GERAL', 'ADMIN'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: '/leads',
    label: 'Pipeline',
    allowedRoles: ['ATENDENTE', 'LIDER_EQUIPE', 'GERENTE', 'GERENTE_GERAL', 'ADMIN'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    path: '/perfil',
    label: 'Perfil',
    allowedRoles: ['ATENDENTE', 'LIDER_EQUIPE', 'GERENTE', 'GERENTE_GERAL', 'ADMIN'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    path: '/publicar-veiculo',
    label: 'Publicar Veículo',
    allowedRoles: ['ATENDENTE', 'LIDER_EQUIPE', 'GERENTE', 'GERENTE_GERAL', 'ADMIN'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
        <path d="M12 3v4M10 5h4" />
      </svg>
    ),
  },
  {
    path: '/moderar-vitrine',
    label: 'Moderar Vitrine',
    allowedRoles: ['GERENTE', 'GERENTE_GERAL', 'ADMIN'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    path: '/repescagem',
    label: 'Repescagem',
    allowedRoles: ['ATENDENTE', 'LIDER_EQUIPE', 'GERENTE', 'GERENTE_GERAL', 'ADMIN'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    ),
  },
  {
    path: '/usuarios',
    label: 'Usuários',
    allowedRoles: ['ADMIN'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    path: '/logs',
    label: 'Logs',
    allowedRoles: ['ADMIN', 'GERENTE_GERAL', 'GERENTE'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
];

export const Sidebar = ({ isExpanded }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // 2. Chave corrigida para '@LeadsCar:role' — mesma usada pelo Login ao salvar
  const userRole = localStorage.getItem('@LeadsCar:role') || 'ATENDENTE';

  // 3. Filtramos a lista de navegação antes de renderizar na tela
  const visibleItems = NAV_ITEMS.filter(item => item.allowedRoles.includes(userRole));

  return (
    <div style={{ ...sidebarContainer, width: isExpanded ? '260px' : '72px' }}>
      {/* Logo */}
      <div style={{ ...logoSection, justifyContent: isExpanded ? 'flex-start' : 'center', overflow: 'hidden' }}>
        <img
          src="/logo.png"
          alt="1000 Valle"
          style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {isExpanded && (
          <span style={logoText}>1000 Valle</span>
        )}
      </div>

      <div style={divider} />

      {/* Nav Dinâmica e Condicional */}
      <nav style={navStyle}>
        {visibleItems.map(item => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            title={!isExpanded ? item.label : undefined}
            style={{
              ...baseLink,
              ...(isActive(item.path) ? activeLinkExtra : inactiveLinkExtra),
              justifyContent: isExpanded ? 'flex-start' : 'center',
            }}
          >
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </span>
            {isExpanded && <span style={{ marginLeft: 12, whiteSpace: 'nowrap' }}>{item.label}</span>}
          </div>
        ))}
      </nav>
    </div>
  );
};

// --- Estilos originais preservados ---
const sidebarContainer: CSSProperties = {
  height: '100vh',
  backgroundColor: '#0f172a',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 10px',
  transition: 'width 0.25s ease',
  overflow: 'hidden',
  boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
};

const logoSection: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 16,
  height: 40,
  paddingLeft: 4,
};

const logoText: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  color: '#f8fafc',
  letterSpacing: '-0.3px',
};

const divider: CSSProperties = {
  height: 1,
  background: 'rgba(255,255,255,0.08)',
  marginBottom: 16,
  marginLeft: -10,
  marginRight: -10,
};

const navStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const baseLink: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  borderRadius: 10,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontSize: 14,
  fontWeight: 500,
};

const activeLinkExtra: CSSProperties = {
  backgroundColor: '#c0392b',
  color: '#fff',
};

const inactiveLinkExtra: CSSProperties = {
  color: '#94a3b8',
};
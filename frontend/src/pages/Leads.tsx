import { useState, useEffect, CSSProperties } from 'react';
import { fetchLeads, ApiLead } from '../services/leadsApi';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  novo_lead:    { bg: '#dbeafe', color: '#1d4ed8' },
  negociacao:   { bg: '#fef9c3', color: '#a16207' },
  venda:        { bg: '#dcfce7', color: '#166534' },
  perdido:      { bg: '#fee2e2', color: '#991b1b' },
};

function statusLabel(s: string | null) {
  const map: Record<string, string> = {
    novo_lead: 'Novo Lead', negociacao: 'Negociação',
    venda: 'Venda', perdido: 'Perdido',
  };
  return map[s ?? ''] ?? s ?? '—';
}

export default function Leads() {
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(() => setErro('Erro ao carregar leads.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = leads.filter(l =>
    (l.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (l.phone ?? '').includes(search)
  );

  if (loading) return <div style={centerStyle}>Carregando leads...</div>;
  if (erro)    return <div style={{ ...centerStyle, color: '#ef4444' }}>{erro}</div>;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>
            Leads
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            {leads.length} lead{leads.length !== 1 ? 's' : ''} cadastrado{leads.length !== 1 ? 's' : ''}
          </p>
        </div>
        <input
          style={searchStyle}
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <div style={emptyStyle}>
          <span style={{ fontSize: '48px' }}>📋</span>
          <p style={{ color: '#64748b', marginTop: '12px' }}>
            {leads.length === 0 ? 'Nenhum lead cadastrado ainda.' : 'Nenhum lead encontrado.'}
          </p>
        </div>
      ) : (
        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {['Nome', 'Telefone', 'Origem', 'Status', 'Criado em'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const st = STATUS_COLORS[lead.status ?? ''] ?? { bg: '#f1f5f9', color: '#475569' };
                return (
                  <tr key={lead.id} style={trStyle}>
                    <td style={tdStyle}>{lead.name ?? '—'}</td>
                    <td style={tdStyle}>{lead.phone ?? '—'}</td>
                    <td style={tdStyle}>{lead.origin ?? '—'}</td>
                    <td style={tdStyle}>
                      <span style={{ ...badgeStyle, backgroundColor: st.bg, color: st.color }}>
                        {statusLabel(lead.status)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const centerStyle: CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', fontSize: '16px', color: '#64748b' };
const headerStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' };
const searchStyle: CSSProperties = { padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', width: '280px', outline: 'none' };
const tableWrapStyle: CSSProperties = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: CSSProperties = { padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
const tdStyle: CSSProperties = { padding: '14px 20px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9' };
const trStyle: CSSProperties = { transition: 'background 0.15s' };
const badgeStyle: CSSProperties = { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 };
const emptyStyle: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' };
import { useEffect, useState, CSSProperties } from 'react';
import { useKanbanBoard } from './hooks/useKanbanBoard';
import { fetchLeads } from '../../services/leadsApi';
import { apiLeadsToColumns } from './data/leadsAdapter';
import { createLead } from '../../services/leads';
import { Lead, KanbanCol } from './types';
import { STAGE_ORDER, LeadStage } from './utils/leadStageValidator';

// ─── COLUNAS INICIAIS ────────────────────────────────────────────────────────
const INITIAL_COLUMNS: KanbanCol[] = [
  { id: 'novo_lead',          title: 'Novo Lead',            totalValue: 0, headerColor: '#3b82f6', leads: [] },
  { id: 'contato_realizado',  title: 'Contato Realizado',    totalValue: 0, headerColor: '#8b5cf6', leads: [] },
  { id: 'agendamento_visita', title: 'Agendamento da Visita',totalValue: 0, headerColor: '#f59e0b', leads: [] },
  { id: 'proposta_enviada',   title: 'Proposta Enviada',     totalValue: 0, headerColor: '#ec4899', leads: [] },
  { id: 'em_negociacao',      title: 'Em Negociação',        totalValue: 0, headerColor: '#f97316', leads: [] },
  { id: 'vendido',            title: 'Vendido',              totalValue: 0, headerColor: '#10b981', leads: [] },
];

const ORIGIN_OPTIONS = ['WhatsApp', 'Instagram', 'Facebook', 'Site', 'Indicação', 'Outro'];

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const colors = ['#3b82f6','#8b5cf6','#ec4899','#f97316','#10b981','#f59e0b'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── LEAD CARD ───────────────────────────────────────────────────────────────
function LeadCard({ lead, onMove, stages }: {
  lead: Lead;
  onMove: (id: string, from: LeadStage, to: LeadStage) => void;
  stages: readonly LeadStage[];
}) {
  const [hovered, setHovered] = useState(false);
  const currentIdx = stages.indexOf(lead.stage);
  const nextStage = currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 10,
        border: '1px solid #e2e8f0',
        boxShadow: hovered ? '0 8px 24px -8px rgba(0,0,0,0.12)' : '0 2px 8px -4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header do card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Avatar name={lead.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lead.name}
          </div>
          {lead.timeAgo && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{lead.timeAgo}</div>
          )}
        </div>
      </div>

      {/* Origem */}
      {lead.origin && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 600, color: '#64748b',
          background: '#f1f5f9', borderRadius: 6, padding: '3px 8px', marginBottom: 10,
        }}>
          📍 {lead.origin}
        </div>
      )}

      {/* Avançar estágio */}
      {nextStage && (
        <button
          onClick={() => onMove(lead.id, lead.stage, nextStage)}
          style={{
            width: '100%', padding: '7px 0', border: 'none',
            borderRadius: 8, background: '#f8fafc', color: '#475569',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#e2e8f0'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#f8fafc'; }}
        >
          Avançar →
        </button>
      )}
      {!nextStage && (
        <div style={{ textAlign: 'center', fontSize: 12, color: '#10b981', fontWeight: 700, padding: '6px 0' }}>
          ✓ Concluído
        </div>
      )}
    </div>
  );
}

// ─── KANBAN COLUMN ───────────────────────────────────────────────────────────
function KanbanColumn({ col, onMove }: { col: KanbanCol; onMove: (id: string, from: LeadStage, to: LeadStage) => void }) {
  return (
    <div style={{
      minWidth: 260, maxWidth: 260,
      background: '#f8fafc',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 160px)',
    }}>
      {/* Header da coluna */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #e2e8f0',
        borderRadius: '16px 16px 0 0',
        background: '#fff',
        borderTop: `4px solid ${col.headerColor}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{col.title}</span>
          <span style={{
            background: col.headerColor + '20', color: col.headerColor,
            borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700,
          }}>
            {col.leads.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '12px 12px', overflowY: 'auto', flex: 1 }}>
        {col.leads.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 13, padding: '24px 0' }}>
            Nenhum lead
          </div>
        ) : (
          col.leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onMove={onMove} stages={STAGE_ORDER} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── MODAL NOVO LEAD ─────────────────────────────────────────────────────────
function NovoLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (lead: any) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', origin: 'WhatsApp' });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErro('Nome é obrigatório.'); return; }
    setLoading(true);
    setErro('');
    try {
      const novo = await createLead({ name: form.name, phone: form.phone, origin: form.origin, status: 'novo_lead' });
      onSave(novo);
      onClose();
    } catch {
      setErro('Erro ao criar lead. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' }}>Novo Lead</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {/* Campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nome *</label>
            <input
              style={inputStyle}
              placeholder="Nome do lead"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Telefone</label>
            <input
              style={inputStyle}
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label style={labelStyle}>Origem</label>
            <select
              style={inputStyle}
              value={form.origin}
              onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
            >
              {ORIGIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {erro && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12 }}>{erro}</p>}

        {/* Botões */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={btnPrimaryStyle}>
            {loading ? 'Salvando...' : 'Criar Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPAL ───────────────────────────────────────────────────────────
export default function LeadsPage() {
  const { columns, setColumns, moveLead } = useKanbanBoard<KanbanCol>(INITIAL_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetchLeads()
      .then(data => setColumns(apiLeadsToColumns(data, INITIAL_COLUMNS)))
      .catch(() => setErro('Erro ao carregar leads.'))
      .finally(() => setLoading(false));
  }, [setColumns]);

  const handleMove = (leadId: string, from: LeadStage, to: LeadStage) => {
    const result = moveLead(leadId, from, to);
    if (!result.success) alert(result.error);
  };

  const handleNovoLead = (novoLead: any) => {
    fetchLeads()
      .then(data => setColumns(apiLeadsToColumns(data, INITIAL_COLUMNS)))
      .catch(() => {});
  };

  const totalLeads = columns.reduce((sum, col) => sum + col.leads.length, 0);

  return (
    <div style={{ padding: '20px 24px', height: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b' }}>Pipeline de Leads</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
            {totalLeads} lead{totalLeads !== 1 ? 's' : ''} no funil
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: '#3b82f6', color: '#fff', fontSize: 14,
            fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#2563eb'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#3b82f6'; }}
        >
          + Novo Lead
        </button>
      </div>

      {/* Erro */}
      {erro && <p style={{ color: '#ef4444', marginBottom: 16 }}>{erro}</p>}

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#94a3b8', fontSize: 16 }}>
          Carregando leads...
        </div>
      ) : (
        /* Kanban Board */
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
          {columns.map(col => (
            <KanbanColumn key={col.id} col={col} onMove={handleMove} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <NovoLeadModal onClose={() => setShowModal(false)} onSave={handleNovoLead} />
      )}
    </div>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const overlayStyle: CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, backdropFilter: 'blur(4px)',
};
const modalStyle: CSSProperties = {
  background: '#fff', borderRadius: 20, padding: 32,
  width: '100%', maxWidth: 440, boxShadow: '0 24px 64px -12px rgba(0,0,0,0.25)',
};
const labelStyle: CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#475569', marginBottom: 6,
};
const inputStyle: CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid #e2e8f0', fontSize: 14, color: '#1e293b',
  outline: 'none', boxSizing: 'border-box', background: '#f8fafc',
};
const btnPrimaryStyle: CSSProperties = {
  flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
  background: '#3b82f6', color: '#fff', fontSize: 14,
  fontWeight: 700, cursor: 'pointer',
};
const btnSecondaryStyle: CSSProperties = {
  flex: 1, padding: '11px 0', borderRadius: 10,
  border: '1px solid #e2e8f0', background: '#fff',
  color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
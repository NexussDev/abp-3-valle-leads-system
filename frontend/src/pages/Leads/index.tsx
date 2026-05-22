import { useEffect, useState, CSSProperties } from 'react';
import styles from './Leads.module.css';
import { useKanbanBoard } from './hooks/useKanbanBoard';
import { fetchLeads } from '../../services/leadsApi';
import { apiLeadsToColumns } from './data/leadsAdapter';
import { createLead, updateLead } from '../../services/leads';
import { Lead, KanbanCol } from './types';
import { STAGE_ORDER, LeadStage } from './utils/leadStageValidator';
import { getStoredLeads, updateStoredLeadStage } from './data/mockLeadStorage';

// ─── COLUNAS ─────────────────────────────────────────────────────────────────
const INITIAL_COLUMNS: KanbanCol[] = [
  { id: 'novo_lead',  title: 'Novo Lead',  totalValue: 0, headerColor: '#3b82f6', leads: [] },
  { id: 'contato',    title: 'Contato',    totalValue: 0, headerColor: '#8b5cf6', leads: [] },
  { id: 'proposta',   title: 'Proposta',   totalValue: 0, headerColor: '#f59e0b', leads: [] },
  { id: 'negociacao', title: 'Negociação', totalValue: 0, headerColor: '#f97316', leads: [] },
  { id: 'fechado',    title: 'Fechado',    totalValue: 0, headerColor: '#10b981', leads: [] },
];

const ORIGIN_OPTIONS = ['WhatsApp', 'Instagram', 'Facebook', 'Site', 'Indicação', 'Outro'];

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const palette = ['#3b82f6','#8b5cf6','#ec4899','#f97316','#10b981','#f59e0b','#06b6d4'];
  const color = palette[name.charCodeAt(0) % palette.length];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
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
  const currentIdx = stages.indexOf(lead.stage);
  const nextStage = currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      padding: '10px 12px',
      marginBottom: 8,
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Linha 1: avatar + nome + tempo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Avatar name={lead.name} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 13, color: '#1e293b',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {lead.name}
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
            {lead.leadNumber && <span>{lead.leadNumber}</span>}
            {lead.timeAgo && <span>{lead.timeAgo}</span>}
          </div>
        </div>
      </div>

      {/* Linha 2: infos compactas */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px', marginBottom: 2 }}>
        {lead.phone && (
          <span style={{ fontSize: 11, color: '#64748b' }}>📞 {lead.phone}</span>
        )}
        {lead.car && (
          <span style={{ fontSize: 11, color: '#64748b' }}>🚗 {lead.car}</span>
        )}
        {lead.origin && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#64748b',
            background: '#f1f5f9', borderRadius: 4, padding: '2px 6px',
          }}>
            {lead.origin}
          </span>
        )}
      </div>

      {/* Ação */}
      {nextStage ? (
        <button
          className={styles.advBtn}
          onClick={() => onMove(lead.id, lead.stage, nextStage)}
        >
          Avançar →
        </button>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 11, color: '#10b981', fontWeight: 700, paddingTop: 6 }}>
          ✓ Concluído
        </div>
      )}
    </div>
  );
}

// ─── KANBAN COLUMN ───────────────────────────────────────────────────────────
function KanbanColumn({ col, onMove }: {
  col: KanbanCol;
  onMove: (id: string, from: LeadStage, to: LeadStage) => void;
}) {
  return (
    <div style={{
      flex: '1 1 0',
      minWidth: 180,
      background: '#f8fafc',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderTop: `3px solid ${col.headerColor}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid #f1f5f9',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#334155', letterSpacing: '.01em' }}>
          {col.title}
        </span>
        <span style={{
          background: col.headerColor + '18',
          color: col.headerColor,
          borderRadius: 20,
          padding: '1px 8px',
          fontSize: 11,
          fontWeight: 700,
        }}>
          {col.leads.length}
        </span>
      </div>

      {/* Cards — scrollbar oculta */}
      <div className={styles.colBody}>
        {col.leads.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 12, padding: '20px 0' }}>
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
      const novo = await createLead({ name: form.name, phone: form.phone, origin: form.origin });
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Novo Lead</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nome *</label>
            <input style={inputStyle} placeholder="Nome do lead" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Telefone</label>
            <input style={inputStyle} placeholder="(11) 99999-9999" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Origem</label>
            <select style={inputStyle} value={form.origin}
              onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}>
              {ORIGIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {erro && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 10 }}>{erro}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={btnPrimaryStyle}>
            {loading ? 'Salvando...' : 'Criar Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function addMockLeadsToColumns(columns: KanbanCol[], include: boolean): KanbanCol[] {
  if (!include) return columns;
  const storedLeads = getStoredLeads();
  return columns.map(col => {
    const existingIds = new Set(col.leads.map(l => l.id));
    const fromStorage = storedLeads.filter(l => l.stage === col.id && !existingIds.has(l.id));
    return { ...col, leads: [...fromStorage, ...col.leads] };
  });
}

function uniqueBy<T>(items: T[], key: (i: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter(i => { const k = key(i); if (seen.has(k)) return false; seen.add(k); return true; });
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const USER_ROLE     = localStorage.getItem('@LeadsCar:role') ?? '';
  const isAdmin       = USER_ROLE === 'ADMIN';
  const isGerente     = USER_ROLE === 'GERENTE';
  const isLiderEquipe = USER_ROLE === 'LIDER_EQUIPE';

  const { columns, setColumns, moveLead } = useKanbanBoard<KanbanCol>(INITIAL_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStore, setFilterStore] = useState('');
  const [filterTeam,  setFilterTeam]  = useState('');
  const [filterUser,  setFilterUser]  = useState('');

  useEffect(() => {
    fetchLeads()
      .then(data => setColumns(addMockLeadsToColumns(apiLeadsToColumns(data, INITIAL_COLUMNS), isAdmin)))
      .catch(() => setColumns(prev => addMockLeadsToColumns(prev, isAdmin)))
      .finally(() => setLoading(false));

    const sync = () => setColumns(prev => addMockLeadsToColumns(prev, isAdmin));
    window.addEventListener('mock-leads-updated', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('mock-leads-updated', sync);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [setColumns, isAdmin]);

  const handleMove = async (leadId: string, from: LeadStage, to: LeadStage) => {
    const result = moveLead(leadId, from, to);
    if (!result.success) { alert(result.error); return; }
    updateStoredLeadStage(leadId, to);
    try {
      await updateLead(leadId, { status: to });
    } catch {
      // Reverte o estado local se o backend rejeitar
      moveLead(leadId, to, from);
      updateStoredLeadStage(leadId, from);
      alert('Erro ao salvar a alteração. Tente novamente.');
    }
  };

  const handleNovoLead = () => {
    fetchLeads()
      .then(data => setColumns(addMockLeadsToColumns(apiLeadsToColumns(data, INITIAL_COLUMNS), isAdmin)))
      .catch(() => setColumns(prev => addMockLeadsToColumns(prev, isAdmin)));
  };

  // ── Opções dos filtros derivadas dos dados
  const allLeads = columns.flatMap(c => c.leads);
  const storeOptions = uniqueBy(allLeads.filter(l => l.storeId).map(l => ({ id: l.storeId!, name: l.storeName ?? l.storeId! })), o => o.id);
  const teamOptions  = uniqueBy(allLeads.filter(l => l.teamId).map(l => ({ id: l.teamId!,  name: l.teamName  ?? l.teamId!  })), o => o.id);
  const userOptions  = uniqueBy(allLeads.filter(l => l.userId).map(l => ({ id: l.userId!,  name: l.userName  ?? l.userId!  })), o => o.id);
  const hasFilter = filterStore || filterTeam || filterUser;

  const filteredColumns = columns.map(col => ({
    ...col,
    leads: col.leads.filter(l => {
      if (filterStore && l.storeId !== filterStore) return false;
      if (filterTeam  && l.teamId  !== filterTeam)  return false;
      if (filterUser  && l.userId  !== filterUser)   return false;
      return true;
    }),
  }));

  const totalLeads = filteredColumns.reduce((sum, c) => sum + c.leads.length, 0);

  return (
    <div style={{ padding: '12px 16px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0, gap: 8 }}>

        {/* Título + filtros inline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              Pipeline de Leads
            </h1>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 11 }}>
              {totalLeads} lead{totalLeads !== 1 ? 's' : ''} no funil
              {hasFilter && <span style={{ color: '#3b82f6', marginLeft: 4 }}>· filtrado</span>}
            </p>
          </div>

          {/* Separador visual */}
          {(isAdmin || isGerente || isLiderEquipe) && (
            <div style={{ width: 1, height: 28, background: '#e2e8f0', flexShrink: 0 }} />
          )}

          {/* Filtros */}
          {[
            isAdmin && { label: 'Loja',     value: filterStore, set: setFilterStore, opts: storeOptions },
            (isAdmin || isGerente || isLiderEquipe) && { label: 'Equipe',   value: filterTeam, set: setFilterTeam, opts: teamOptions },
            (isAdmin || isGerente || isLiderEquipe) && { label: 'Vendedor', value: filterUser, set: setFilterUser, opts: userOptions },
          ].filter(Boolean).map((f: any) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {f.label}
              </span>
              <select
                value={f.value}
                onChange={e => f.set(e.target.value)}
                className={`${styles.filterSelect} ${f.value ? styles.filterSelectActive : ''}`}
              >
                <option value="">Todos</option>
                {f.opts.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          ))}

          {hasFilter && (
            <button className={styles.clearBtn}
              onClick={() => { setFilterStore(''); setFilterTeam(''); setFilterUser(''); }}>
              ✕
            </button>
          )}
        </div>

        {/* Botão novo lead — sempre à direita */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#3b82f6', color: '#fff', fontSize: 13,
            fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
          }}
          onMouseEnter={e => { (e.currentTarget.style.background = '#2563eb'); }}
          onMouseLeave={e => { (e.currentTarget.style.background = '#3b82f6'); }}
        >
          + Novo Lead
        </button>
      </div>

      {/* ── KANBAN ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#cbd5e1', fontSize: 14 }}>
          Carregando leads…
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', flex: 1, minHeight: 0, paddingBottom: 4 }}>
          {filteredColumns.map(col => (
            <KanbanColumn key={col.id} col={col} onMove={handleMove} />
          ))}
        </div>
      )}

      {showModal && (
        <NovoLeadModal onClose={() => setShowModal(false)} onSave={handleNovoLead} />
      )}
    </div>
  );
}

// ─── ESTILOS MODAL ────────────────────────────────────────────────────────────
const overlayStyle: CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, backdropFilter: 'blur(4px)',
};
const modalStyle: CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 28,
  width: '100%', maxWidth: 420, boxShadow: '0 20px 60px -12px rgba(0,0,0,0.2)',
};
const labelStyle: CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5,
};
const inputStyle: CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', fontSize: 13, color: '#1e293b',
  outline: 'none', boxSizing: 'border-box', background: '#f8fafc',
};
const btnPrimaryStyle: CSSProperties = {
  flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
  background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
};
const btnSecondaryStyle: CSSProperties = {
  flex: 1, padding: '10px 0', borderRadius: 8,
  border: '1px solid #e2e8f0', background: '#fff',
  color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

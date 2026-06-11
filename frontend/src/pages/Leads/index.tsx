import { useEffect, useState, CSSProperties } from 'react';
import styles from './Leads.module.css';
import { useKanbanBoard } from './hooks/useKanbanBoard';
import { fetchLeads, updateLead } from '../../services/leadsApi';
import { apiLeadsToColumns } from './data/leadsAdapter';
import { createLead } from '../../services/leads';
import { Lead, KanbanCol } from './types';
import { STAGE_ORDER, LeadStage } from './utils/leadStageValidator';
import { getStoredLeads, updateStoredLeadStage } from './data/mockLeadStorage';
import CloseLeadModal from '../../components/CloseLeadModal/CloseLeadModal';

// ─── ESTILOS AUXILIARES ──────────────────────────────────────────────────────
const overlayStyle: CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalStyle: CSSProperties = { background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };
const closeBtnStyle: CSSProperties = { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8', lineHeight: 1 };
const labelStyle: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 };
const inputStyle: CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', outline: 'none' };
const btnPrimaryStyle: CSSProperties = { flex: 1, padding: '10px 16px', borderRadius: 8, background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.2s' };
const btnSecondaryStyle: CSSProperties = { flex: 1, padding: '10px 16px', borderRadius: 8, background: '#f1f5f9', color: '#475569', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.2s' };
const menuItemStyle: CSSProperties = { display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#334155', cursor: 'pointer', borderRadius: 6 };

// ─── COLUNAS ─────────────────────────────────────────────────────────────────
const INITIAL_COLUMNS: KanbanCol[] = [
  { id: 'novo_lead',  title: 'Novo Lead',  totalValue: 0, headerColor: '#3b82f6', leads: [] },
  { id: 'contato',    title: 'Contato',    totalValue: 0, headerColor: '#8b5cf6', leads: [] },
  { id: 'proposta',   title: 'Proposta',   totalValue: 0, headerColor: '#f59e0b', leads: [] },
  { id: 'negociacao', title: 'Negociação', totalValue: 0, headerColor: '#f97316', leads: [] },
  { id: 'fechado',    title: 'Fechado',    totalValue: 0, headerColor: '#10b981', leads: [] },
];

const STAGE_NAMES: Record<string, string> = {
  novo_lead: 'Novo Lead',
  contato: 'Contato',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado'
};

const ORIGIN_OPTIONS = ['WhatsApp', 'Instagram', 'Facebook', 'Site', 'Indicação', 'Outro'];
const PLATFORM_OPTIONS = ['Webmotors', 'OLX', 'Mercado Livre', 'Instagram', 'Facebook Marketplace', 'Chaves na Mão'];
const IMPORTANCE_OPTIONS = [
  { value: 'frio', label: '❄️ Frio' },
  { value: 'morno', label: '🔥 Morno' },
  { value: 'quente', label: '❤️ Quente' }
];

const TEMPERATURE_COLORS: Record<string, string> = {
  frio: '#3b82f6',
  morno: '#eab308',
  quente: '#ef4444',
};

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
function LeadCard({
  lead,
  onMove,
  stages,
  onEdit,
}: {
  lead: Lead;
  onMove: (id: string, from: LeadStage, to: LeadStage) => void;
  stages: readonly LeadStage[];
  onEdit: (lead: Lead) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const currentIdx = stages.indexOf(lead.stage);
  const nextStage = currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;
  const previousStage = currentIdx > 0 ? stages[currentIdx - 1] : null;

  const indicatorColor = TEMPERATURE_COLORS[lead.temperatura || 'morno'];

  return (
    <div style={{
      position: 'relative',
      background: '#fff',
      borderRadius: 10,
      padding: '10px 12px 10px 16px',
      marginBottom: 8,
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 10, bottom: 10, width: 4,
        borderRadius: '0 4px 4px 0', backgroundColor: indicatorColor,
      }} />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        style={{
          position: 'absolute', top: 8, right: 10, border: 'none',
          background: 'transparent', color: '#94a3b8', fontSize: 18,
          fontWeight: 700, cursor: 'pointer', padding: 0, lineHeight: 1,
        }}
      >
        ⋮
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute', top: 34, right: 10, zIndex: 50,
          width: 190, background: '#fff', borderRadius: 12, padding: 8,
          border: '1px solid #eef2f7', boxShadow: '0 16px 35px rgba(15, 23, 42, 0.14)',
        }}>
          <button
            type="button"
            onClick={() => { setMenuOpen(false); onEdit(lead); }}
            style={menuItemStyle}
            onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            Editar lead
          </button>
          {previousStage && (
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onMove(lead.id, lead.stage, previousStage); }}
              style={menuItemStyle}
              onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              Retornar estágio
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Avatar name={lead.name} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lead.name}
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 11, color: '#94a3b8', marginTop: 1, alignItems: 'center' }}>
            {lead.leadNumber && <span>{lead.leadNumber}</span>}
            {lead.timeAgo && <span>{lead.timeAgo}</span>}
            <span style={{ color: indicatorColor, fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>
              · {lead.temperatura || 'morno'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px', marginBottom: 2 }}>
        {lead.phone && <span style={{ fontSize: 11, color: '#64748b' }}>📞 {lead.phone}</span>}
        {lead.car && <span style={{ fontSize: 11, color: '#64748b' }}>🚗 {lead.car}</span>}
        {lead.origin && (
          <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f1f5f9', borderRadius: 4, padding: '2px 6px' }}>
            {lead.origin}
          </span>
        )}
      </div>

      {lead.closingReason && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>📝 {lead.closingReason}</div>}

      {lead.stage === 'fechado' && (
        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: lead.converted ? '#10b981' : '#ef4444' }}>
          {lead.converted ? '✓ Venda realizada' : '✗ Não convertido'}
        </div>
      )}

      {nextStage ? (
        <button
          className={styles.advBtn}
          onClick={() => onMove(lead.id, lead.stage, nextStage)}
          style={{ width: '100%', padding: '6px', marginTop: 10, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 11, fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
        >
          {nextStage === 'fechado' ? 'Fechar Lead →' : 'Avançar →'}
        </button>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 11, color: '#10b981', fontWeight: 700, paddingTop: 6 }}>✓ Concluído</div>
      )}
    </div>
  );
}

// ─── KANBAN COLUMN ───────────────────────────────────────────────────────────
function KanbanColumn({
  col,
  onMove,
  onEdit,
}: {
  col: KanbanCol;
  onMove: (id: string, from: LeadStage, to: LeadStage) => void;
  onEdit: (lead: Lead) => void;
}) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 260, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', borderTop: `3px solid ${col.headerColor}`, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: '#334155', letterSpacing: '.01em' }}>{col.title}</span>
        <span style={{ background: col.headerColor + '18', color: col.headerColor, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>{col.leads.length}</span>
      </div>
      <div className={styles.colBody} style={{ padding: 10, overflowY: 'auto', flex: 1 }}>
        {col.leads.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 12, padding: '20px 0' }}>Nenhum lead</div>
        ) : (
          col.leads.map(lead => <LeadCard key={lead.id} lead={lead} onMove={onMove} stages={STAGE_ORDER} onEdit={onEdit} />)
        )}
      </div>
    </div>
  );
}

// ─── MODAL NOVO LEAD ─────────────────────────────────────────────────────────
function NovoLeadModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: '', phone: '', origin: 'WhatsApp', collaboratorName: '', state: '', city: '', car: '', price: '', importance: 'morno', status: 'aberta', platforms: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handlePlatformChange = (platform: string) => {
    setForm(f => {
      const isSelected = f.platforms.includes(platform);
      return { ...f, platforms: isSelected ? f.platforms.filter(p => p !== platform) : [...f.platforms, platform] };
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErro('Nome do lead é obrigatório.'); return; }
    if (!form.collaboratorName.trim()) { setErro('Nome do colaborador é obrigatório.'); return; }
    if (!form.car.trim()) { setErro('O veículo a ser vendido é obrigatório.'); return; }
    setLoading(true);
    setErro('');
    try {
      await createLead({
        name: form.name, phone: form.phone, origin: form.origin, collaboratorName: form.collaboratorName, state: form.state, city: form.city, car: form.car, price: form.price, importance: form.importance, negotiationStatus: form.status, platforms: form.platforms,
      } as any);
      onSave(); onClose();
    } catch {
      setErro('Erro ao criar negociação/lead. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Nova Negociação de Lead</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>Dados do Cliente</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nome do Lead *</label>
              <input style={inputStyle} placeholder="Nome do cliente" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp (Lead)</label>
              <input style={inputStyle} placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Origem</label>
            <select style={inputStyle} value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}>
              {ORIGIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginTop: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>Detalhes da Venda</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nome do Colaborador *</label>
              <input style={inputStyle} placeholder="Seu nome" value={form.collaboratorName} onChange={e => setForm(f => ({ ...f, collaboratorName: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Veículo *</label>
              <input style={inputStyle} placeholder="Ex: Corolla 2023" value={form.car} onChange={e => setForm(f => ({ ...f, car: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Estado</label>
              <input style={inputStyle} placeholder="Ex: SP" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input style={inputStyle} placeholder="Ex: São Paulo" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Preço (R$)</label>
              <input style={inputStyle} type="number" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Status Inicial</label>
              <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="aberta">Aberta</option>
                <option value="fechada">Fechada</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Importância</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              {IMPORTANCE_OPTIONS.map(opt => {
                const isSelected = form.importance === opt.value;
                return (
                  <button
                    key={opt.value} type="button"
                    onClick={() => setForm(f => ({ ...f, importance: opt.value }))}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '6px',
                      border: isSelected ? `1px solid ${TEMPERATURE_COLORS[opt.value]}` : '1px solid #e2e8f0',
                      background: isSelected ? `${TEMPERATURE_COLORS[opt.value]}10` : '#fff',
                      color: isSelected ? TEMPERATURE_COLORS[opt.value] : '#475569',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Lançar nas Plataformas</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginTop: 4 }}>
              {PLATFORM_OPTIONS.map(platform => {
                const isChecked = form.platforms.includes(platform);
                return (
                  <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#1e293b', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isChecked} onChange={() => handlePlatformChange(platform)} style={{ cursor: 'pointer' }} />
                    {platform}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {erro && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 10 }}>{erro}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={btnPrimaryStyle}>{loading ? 'Salvando...' : 'Criar Negociação'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL EDITAR LEAD ────────────────────────────────────────────────────────
function EditLeadModal({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: () => void; }) {
  const [form, setForm] = useState({ name: lead.name ?? '', phone: lead.phone ?? '', origin: lead.origin ?? 'WhatsApp', car: lead.car ?? '', stage: lead.stage });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErro('Nome é obrigatório.'); return; }
    setLoading(true); setErro('');
    try {
      await updateLead(lead.id, { name: form.name, phone: form.phone, origin: form.origin, car: form.car, status: form.stage } as any);
      onSave(); onClose();
    } catch {
      setErro('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Editar lead</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nome completo *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input style={inputStyle} placeholder="(00) 00000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Veículo de interesse</label>
            <input style={inputStyle} placeholder="Ex: Honda HR-V..." value={form.car} onChange={e => setForm(f => ({ ...f, car: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Como nos conheceu?</label>
            <select style={inputStyle} value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}>
              {ORIGIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Estágio</label>
            <select style={inputStyle} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as LeadStage }))}>
              {INITIAL_COLUMNS.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
            </select>
          </div>
        </div>

        {erro && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 10 }}>{erro}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={btnPrimaryStyle}>{loading ? 'Salvando...' : 'Salvar alterações'}</button>
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
    // Correção: Type assertion para lidar com campos de mock que diferem da interface oficial.
    return { ...col, leads: [...(fromStorage as unknown as Lead[]), ...col.leads] };
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
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [closingLead, setClosingLead] = useState<{ id: string; name: string; from: LeadStage } | null>(null);
  const [filterStore, setFilterStore] = useState('');
  const [filterTeam,  setFilterTeam]  = useState('');
  const [filterUser,  setFilterUser]  = useState('');

  // Mantive apenas um useState do pendingMove para não dar erro de redeclaração
  const [pendingMove, setPendingMove] = useState<{ leadId: string; from: LeadStage; to: LeadStage } | null>(null);

  const reloadLeads = () => {
    fetchLeads()
      .then(data => setColumns(addMockLeadsToColumns(apiLeadsToColumns(data, INITIAL_COLUMNS), isAdmin)))
      .catch(() => setColumns(addMockLeadsToColumns(INITIAL_COLUMNS, isAdmin)));
  };

  useEffect(() => {
    fetchLeads()
      .then(data => setColumns(addMockLeadsToColumns(apiLeadsToColumns(data, INITIAL_COLUMNS), isAdmin)))
      .catch(() => setColumns(addMockLeadsToColumns(INITIAL_COLUMNS, isAdmin)))
      .finally(() => setLoading(false));

    const sync = () => {
      fetchLeads()
        .then(data => setColumns(addMockLeadsToColumns(apiLeadsToColumns(data, INITIAL_COLUMNS), isAdmin)))
        .catch(() => setColumns(addMockLeadsToColumns(INITIAL_COLUMNS, isAdmin)));
    };
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
    if (to === 'fechado') {
      const lead = columns.flatMap(c => c.leads).find(l => l.id === leadId);
      setClosingLead({ id: leadId, name: lead?.name ?? '', from });
      return;
    }
    setPendingMove({ leadId, from, to });
  };

  const executeMoveLead = async () => {
    if (!pendingMove) return;
    const { leadId, from, to } = pendingMove;
    setPendingMove(null);

    const result = moveLead(leadId, from, to);
    if (!result.success) {
      alert(result.error); return;
    }

    moveLead(leadId, to, from); // Otimista

    try {
      await updateLead(leadId, { status: to });
      moveLead(leadId, from, to);
      updateStoredLeadStage(leadId, to);
    } catch (err: any) {
      moveLead(leadId, to, from);
      updateStoredLeadStage(leadId, from);
      const status = err?.response?.status;
      if (status === 403) alert('Você não tem permissão para mover este lead.');
      else if (status === 404) alert('Lead não encontrado. Recarregue a página.');
      else alert('Erro ao salvar a alteração. Tente novamente.');
    }
  };

  const handleCloseLeadSuccess = () => {
    setClosingLead(null);
    fetchLeads().then(data => setColumns(addMockLeadsToColumns(apiLeadsToColumns(data, INITIAL_COLUMNS), isAdmin))).catch(() => {});
  };

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
      if (filterUser  && l.userId  !== filterUser)  return false;
      return true;
    }),
  }));

  const totalLeads = filteredColumns.reduce((sum, c) => sum + c.leads.length, 0);

  return (
    <div style={{ padding: '12px 16px', height: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>Pipeline de Leads</h1>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 11 }}>
              {totalLeads} lead{totalLeads !== 1 ? 's' : ''} no funil
              {hasFilter && <span style={{ color: '#3b82f6', marginLeft: 4 }}>· filtrado</span>}
            </p>
          </div>

          {(isAdmin || isGerente || isLiderEquipe) && <div style={{ width: 1, height: 28, background: '#e2e8f0', flexShrink: 0 }} />}

          {[
            isAdmin && { label: 'Loja',     value: filterStore, set: setFilterStore, opts: storeOptions },
            (isAdmin || isGerente || isLiderEquipe) && { label: 'Equipe',   value: filterTeam, set: setFilterTeam, opts: teamOptions },
            (isAdmin || isGerente || isLiderEquipe) && { label: 'Vendedor', value: filterUser, set: setFilterUser, opts: userOptions },
          ].filter(Boolean).map((f: any) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' }}>{f.label}</span>
              <select value={f.value} onChange={e => f.set(e.target.value)} className={`${styles.filterSelect} ${f.value ? styles.filterSelectActive : ''}`}>
                <option value="">Todos</option>
                {f.opts.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          ))}

          {hasFilter && <button className={styles.clearBtn} onClick={() => { setFilterStore(''); setFilterTeam(''); setFilterUser(''); }}>✕</button>}
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.35)' }}
          onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
          onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
        >
          + Novo Lead
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#cbd5e1', fontSize: 14 }}>Carregando leads…</div>
      ) : (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', flex: 1, minHeight: 0, paddingBottom: 4 }}>
          {filteredColumns.map(col => <KanbanColumn key={col.id} col={col} onMove={handleMove} onEdit={setEditingLead} />)}
        </div>
      )}

      {closingLead && <CloseLeadModal leadId={closingLead.id} leadName={closingLead.name} onClose={() => setClosingLead(null)} onSuccess={handleCloseLeadSuccess} />}
      {showModal && <NovoLeadModal onClose={() => setShowModal(false)} onSave={reloadLeads} />}
      {editingLead && <EditLeadModal lead={editingLead} onClose={() => setEditingLead(null)} onSave={reloadLeads} />}

      {pendingMove && (
        <div style={overlayStyle} onClick={() => setPendingMove(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Confirmar Avanço</h2>
              <button onClick={() => setPendingMove(null)} style={closeBtnStyle}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 24, lineHeight: 1.5 }}>
              Você tem certeza que deseja mover este lead para o estágio <strong>{STAGE_NAMES[pendingMove.to] || pendingMove.to}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPendingMove(null)} style={btnSecondaryStyle}>Cancelar</button>
              <button onClick={executeMoveLead} style={btnPrimaryStyle}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
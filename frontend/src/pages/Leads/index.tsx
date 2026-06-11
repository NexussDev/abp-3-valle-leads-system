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
import LeadHistoryTimeline from '../../components/LeadHistory/LeadHistoryTimeline';

// ─── ESTILOS GERAIS ─────────────────────────────────────────────────────────
const overlayStyle: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-in-out' };
const modalStyle: CSSProperties = { background: '#ffffff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 540, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', border: '1px solid #f1f5f9', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' };
const labelStyle: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle: CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'all 0.2s' };
const closeBtnStyle: CSSProperties = { border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#64748b', display: 'flex', padding: 8, borderRadius: 8, transition: 'background-color 0.2s' };
const btnPrimaryStyle: CSSProperties = { padding: '12px 28px', borderRadius: 12, border: 'none', background: '#2563eb', color: '#ffffff', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' };
const btnSecondaryStyle: CSSProperties = { padding: '12px 28px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' };
const menuItemStyle: CSSProperties = { width: '100%', border: 'none', outline: 'none', background: 'transparent', textAlign: 'left', padding: '12px 16px', borderRadius: 8, fontSize: 14, color: '#334155', cursor: 'pointer', fontWeight: 500, transition: 'background-color 0.15s' };

const INITIAL_COLUMNS: KanbanCol[] = [
  { id: 'novo_lead', title: 'Novo Lead', totalValue: 0, headerColor: '#2563eb', leads: [] },
  { id: 'contato', title: 'Contato', totalValue: 0, headerColor: '#7c3aed', leads: [] },
  { id: 'proposta', title: 'Proposta', totalValue: 0, headerColor: '#d97706', leads: [] },
  { id: 'negociacao', title: 'Negociação', totalValue: 0, headerColor: '#ea580c', leads: [] },
  { id: 'fechado', title: 'Fechado', totalValue: 0, headerColor: '#059669', leads: [] },
];

const ORIGIN_OPTIONS = ['WhatsApp', 'Instagram', 'Facebook', 'Site', 'Indicação', 'Outro'];
const PLATFORM_OPTIONS = ['Webmotors', 'OLX', 'Mercado Livre', 'Instagram', 'Facebook Marketplace', 'Chaves na Mão'];
const IMPORTANCE_OPTIONS = [
  { value: 'frio', label: '❄️ Frio' },
  { value: 'morno', label: '🔥 Morno' },
  { value: 'quente', label: '❤️ Quente' }
];

const TEMPERATURE_COLORS: Record<string, string> = {
  frio: '#2563eb',
  morno: '#d97706',
  quente: '#dc2626',
};

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const palette = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669', '#d97706', '#0891b2'];
  const color = palette[name.charCodeAt(0) % palette.length];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function LeadCard({
  lead,
  onMove,
  stages,
  onEdit,
  onViewHistory,
}: {
  lead: Lead;
  onMove: (id: string, from: LeadStage, to: LeadStage) => void;
  stages: readonly LeadStage[];
  onEdit: (lead: Lead) => void;
  onViewHistory: (lead: Lead) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const currentIdx = stages.indexOf(lead.stage);
  const nextStage = currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;
  const previousStage = currentIdx > 0 ? stages[currentIdx - 1] : null;

  const indicatorColor = TEMPERATURE_COLORS[lead.temperatura || 'morno'];

  return (
    <div style={{ position: 'relative', background: '#ffffff', borderRadius: 12, padding: '14px 16px', marginBottom: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
      <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 4, borderRadius: '0 4px 4px 0', backgroundColor: indicatorColor }} />

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
        style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', padding: 0, zIndex: 20 }}
      >
        <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#94a3b8' }} />
        <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#94a3b8' }} />
        <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#94a3b8' }} />
      </button>

      {menuOpen && (
        <div style={{ position: 'absolute', top: 40, right: 10, zIndex: 50, width: 180, background: '#ffffff', borderRadius: 12, padding: 6, border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
          <button type="button" onClick={() => { setMenuOpen(false); onEdit(lead); }} style={menuItemStyle} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Editar lead</button>
          <button type="button" onClick={() => { setMenuOpen(false); onViewHistory(lead); }} style={menuItemStyle} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Ver histórico</button>
          {previousStage && (
            <button type="button" onClick={() => { setMenuOpen(false); onMove(lead.id, lead.stage, previousStage); }} style={menuItemStyle} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Retornar estágio</button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingRight: 32 }}>
        <Avatar name={lead.name} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
          <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#64748b', marginTop: 2, alignItems: 'center' }}>
            {lead.leadNumber && <span>{lead.leadNumber}</span>}
            {lead.timeAgo && <span>{lead.timeAgo}</span>}
            <span style={{ color: indicatorColor, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>· {lead.temperatura || 'morno'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginBottom: 4 }}>
        {lead.phone && <span style={{ fontSize: 12, color: '#475569' }}>📞 {lead.phone}</span>}
        {lead.car && <span style={{ fontSize: 12, color: '#475569' }}>🚗 {lead.car}</span>}
        {lead.origin && <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', background: '#f1f5f9', borderRadius: 6, padding: '3px 8px' }}>{lead.origin}</span>}
      </div>

      {lead.closingReason && <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontStyle: 'italic' }}>📝 {lead.closingReason}</div>}

      {lead.stage === 'fechado' && (
        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: lead.converted ? '#059669' : '#dc2626' }}>{lead.converted ? '✓ Venda realizada' : '✗ Não convertido'}</div>
      )}

      {nextStage ? (
        <button onClick={() => onMove(lead.id, lead.stage, nextStage)} style={{ width: '100%', padding: '8px', marginTop: 12, borderRadius: 8, border: '1px solid #cbd5e1', background: '#ffffff', fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer', transition: 'background-color 0.15s' }}>
          {nextStage === 'fechado' ? 'Fechar Lead →' : 'Avançar →'}
        </button>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 12, color: '#059669', fontWeight: 700, paddingTop: 10 }}>✓ Concluído</div>
      )}
    </div>
  );
}

function KanbanColumn({ col, onMove, onEdit, onViewHistory }: { col: KanbanCol; onMove: (id: string, from: LeadStage, to: LeadStage) => void; onEdit: (lead: Lead) => void; onViewHistory: (lead: Lead) => void; }) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 280, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', borderTop: `4px solid ${col.headerColor}`, overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', letterSpacing: '.02em' }}>{col.title}</span>
        <span style={{ background: col.headerColor + '15', color: col.headerColor, borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 800 }}>{col.leads.length}</span>
      </div>
      <div style={{ padding: 12, overflowY: 'auto', flex: 1 }}>
        {col.leads.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '32px 0' }}>Nenhum lead</div>
        ) : (
          col.leads.map(lead => <LeadCard key={lead.id} lead={lead} onMove={onMove} stages={STAGE_ORDER} onEdit={onEdit} onViewHistory={onViewHistory} />)
        )}
      </div>
    </div>
  );
}

// ─── MODAL NOVO LEAD ────────────────────────────────────────────────────────
function NovoLeadModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', origin: 'WhatsApp', collaboratorName: '', state: '', city: '', car: '', price: '', importance: 'morno', status: 'aberta', platforms: [] as string[] });
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
    setLoading(true); setErro('');

    try {
      await createLead({ name: form.name, phone: form.phone, origin: form.origin, collaboratorName: form.collaboratorName, state: form.state, city: form.city, car: form.car, price: form.price, importance: form.importance, negotiationStatus: form.status, platforms: form.platforms } as any);
      onSave(); onClose();
    } catch {
      setErro('Erro ao criar negociação/lead. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Nova Negociação</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Dados do Cliente</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nome do Lead *</label>
                <input style={inputStyle} placeholder="Nome do cliente" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp (Lead)</label>
                <input style={inputStyle} placeholder="(11) 99999-9999" type="tel" maxLength={15} value={form.phone} onChange={e => { const maskedValue = maskPhone(e.target.value); e.target.value = maskedValue; setForm(f => ({ ...f, phone: maskedValue })); }} />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Origem</label>
            <select style={{ ...inputStyle, height: 46, cursor: 'pointer', background: '#fff' }} value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}>
              {ORIGIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Detalhes da Venda</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nome do Colaborador *</label>
                  <input style={inputStyle} placeholder="Seu nome" value={form.collaboratorName} onChange={e => setForm(f => ({ ...f, collaboratorName: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Veículo *</label>
                  <input style={inputStyle} placeholder="Ex: Corolla 2023" value={form.car} onChange={e => setForm(f => ({ ...f, car: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <input style={inputStyle} placeholder="Ex: SP" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Cidade</label>
                  <input style={inputStyle} placeholder="Ex: São Paulo" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Preço (R$)</label>
                <input style={inputStyle} type="number" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Status Inicial</label>
                <select style={{ ...inputStyle, height: 46, cursor: 'pointer', background: '#fff' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="aberta">Aberta</option>
                  <option value="fechada">Fechada</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Importância</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {IMPORTANCE_OPTIONS.map(opt => {
                const isSelected = form.importance === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, importance: opt.value }))} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: isSelected ? `2px solid ${TEMPERATURE_COLORS[opt.value]}` : '1px solid #cbd5e1', background: isSelected ? `${TEMPERATURE_COLORS[opt.value]}0a` : '#ffffff', color: isSelected ? '#0f172a' : '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Lançar nas Plataformas</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginTop: 6, background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              {PLATFORM_OPTIONS.map(platform => {
                const isChecked = form.platforms.includes(platform);
                return (
                  <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isChecked} onChange={() => handlePlatformChange(platform)} style={{ cursor: 'pointer', width: 16, height: 16 }} /> {platform}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {erro && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 16, fontWeight: 600 }}>{erro}</p>}
        <div style={{ display: 'flex', gap: 16, marginTop: 32, borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
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
      <div style={{ ...modalStyle, maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Editar lead</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nome completo *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input style={inputStyle} placeholder="(00) 00000-0000" type="tel" maxLength={15} value={form.phone} onChange={e => { const maskedValue = maskPhone(e.target.value); e.target.value = maskedValue; setForm(f => ({ ...f, phone: maskedValue })); }} />
          </div>
          <div>
            <label style={labelStyle}>Veículo de interesse</label>
            <input style={inputStyle} placeholder="Ex: Honda HR-V..." value={form.car} onChange={e => setForm(f => ({ ...f, car: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Como nos conheceu?</label>
            <select style={{ ...inputStyle, height: 46, cursor: 'pointer', background: '#fff' }} value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}>
              {ORIGIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Estágio</label>
            <select style={{ ...inputStyle, height: 46, cursor: 'pointer', background: '#fff' }} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as LeadStage }))}>
              {INITIAL_COLUMNS.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
            </select>
          </div>
        </div>

        {erro && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 16, fontWeight: 600 }}>{erro}</p>}
        <div style={{ display: 'flex', gap: 16, marginTop: 32, borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={btnPrimaryStyle}>{loading ? 'Salvando...' : 'Salvar alterações'}</button>
        </div>
      </div>
    </div>
  );
}

function uniqueBy<T>(items: T[], key: (i: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter(i => {
    const k = key(i);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function LeadsPage() {
  const USER_ROLE = localStorage.getItem('@LeadsCar:role') ?? '';
  const isAdmin = USER_ROLE === 'ADMIN';
  const isGerente = USER_ROLE === 'GERENTE';
  const isLiderEquipe = USER_ROLE === 'LIDER_EQUIPE';

  const { columns: rawColumns, setColumns: setRawColumns } = useKanbanBoard<KanbanCol>(INITIAL_COLUMNS);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [closingLead, setClosingLead] = useState<{ id: string; name: string; from: LeadStage } | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [historyLead, setHistoryLead] = useState<Lead | null>(null);

  // Estados dos Filtros Ativos
  const [timeFilter, setTimeFilter] = useState<'semana' | 'mes' | 'ano' | 'custom'>('mes');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filterStore, setFilterStore] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterTemperature, setFilterTemperature] = useState('');

  // Carregar dados da API
  const reloadLeads = () => {
    fetchLeads()
      .then(data => {
        const loadedCols = apiLeadsToColumns(data, INITIAL_COLUMNS);
        const allLoaded = isAdmin ? addMockLeads(loadedCols) : loadedCols;
        setRawColumns(allLoaded);
      })
      .catch(() => {
        setRawColumns(isAdmin ? addMockLeads(INITIAL_COLUMNS) : INITIAL_COLUMNS);
      })
      .finally(() => setLoading(false));
  };

  const addMockLeads = (cols: KanbanCol[]) => {
    const storedLeads = getStoredLeads();
    return cols.map(col => {
      const existingIds = new Set(col.leads.map(l => l.id));
      const fromStorage = storedLeads.filter(l => l.stage === col.id && !existingIds.has(l.id));
      return { ...col, leads: [...(fromStorage as unknown as Lead[]), ...col.leads] };
    });
  };

  useEffect(() => {
    reloadLeads();
    const sync = () => reloadLeads();

    window.addEventListener('mock-leads-updated', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);

    return () => {
      window.removeEventListener('mock-leads-updated', sync);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [setRawColumns, isAdmin]);

  const handleMove = async (leadId: string, from: LeadStage, to: LeadStage) => {
    try {
      await updateLead(leadId, { status: to });
      updateStoredLeadStage(leadId, to);
      reloadLeads();
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      alert('Erro ao salvar a alteração. Tente novamente.');
    }
  };

  const handleCloseLeadSuccess = () => {
    setClosingLead(null);
    reloadLeads();
  };

  // ─── LÓGICA DE FILTRAGEM TOLERANTE A CAMPOS VAZIOS ─────────────────────────
  const getFilteredLeads = (leads: Lead[]) => {
    return leads.filter(lead => {
      // Só filtra por Loja se um valor foi selecionado no dropdown
      if (filterStore && lead.storeId !== filterStore) return false;
      
      // Só filtra por Equipe se um valor foi selecionado
      if (filterTeam && lead.teamId !== filterTeam) return false;
      
      // Só filtra por Atendente se um valor foi selecionado
      if (filterUser && lead.userId !== filterUser) return false;

      // Só filtra por Temperatura acessando o campo correto via negotiation
      if (filterTemperature) {
  const leadTemp = ((lead as any).negotiation?.importance || '').toLowerCase();
  console.log('filterTemperature:', filterTemperature, '| leadTemp:', leadTemp, '| lead:', (lead as any).negotiation);
  if (leadTemp !== filterTemperature.toLowerCase()) return false;
}

      // Filtragem de Período Temporal (Ignora se o período for customizado sem datas preenchidas)
      const createdAt = (lead as any).createdAt;
      if (timeFilter !== 'custom' && createdAt) {
        const leadDate = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - leadDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (timeFilter === 'semana' && diffDays > 7) return false;
        if (timeFilter === 'mes' && diffDays > 30) return false;
        if (timeFilter === 'ano' && diffDays > 365) return false;
      } else if (timeFilter === 'custom' && customStartDate && customEndDate && createdAt) {
        const leadDateStr = createdAt.split('T')[0];
        if (leadDateStr < customStartDate || leadDateStr > customEndDate) return false;
      }

      return true;
    });
  };

  const displayedColumns = rawColumns.map(col => ({
    ...col,
    leads: getFilteredLeads(col.leads)
  }));

  const allRawLeads = rawColumns.flatMap(c => c.leads);
  const storeOptions = uniqueBy(allRawLeads.filter(l => l.storeId).map(l => ({ id: l.storeId!, name: l.storeName ?? l.storeId! })), o => o.id);
  const teamOptions = uniqueBy(allRawLeads.filter(l => l.teamId).map(l => ({ id: l.teamId!, name: l.teamName ?? l.teamId! })), o => o.id);
  const userOptions = uniqueBy(allRawLeads.filter(l => l.userId).map(l => ({ id: l.userId!, name: l.userName ?? l.userId! })), o => o.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', padding: 32, background: '#f1f5f9', boxSizing: 'border-box' }}>

      {/* ─── CABEÇALHO ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>Pipeline de Leads</h1>
        <button
          onClick={() => setShowModal(true)}
          style={btnPrimaryStyle}
        >
          + Adicionar Lead
        </button>
      </div>

      {/* ─── BARRA DE FILTROS MODERNA ─── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 32, padding: '20px 28px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', alignItems: 'flex-end' }}>

        {/* Período */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Período de Análise</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {(['semana', 'mes', 'ano', 'custom'] as const).map(t => {
              const labels: Record<string, string> = { semana: 'Semana', mes: 'Mês', ano: 'Ano', custom: 'Customizado' };
              const isSelected = timeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  style={{
                    padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: isSelected ? '#2563eb' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: 'none', transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {labels[t]}
                </button>
              );
            })}

            {/* Custom Inputs */}
            {timeFilter === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 6, animation: 'fadeIn 0.2s' }}>
                <input
                  type="date"
                  style={{ ...inputStyle, padding: '8px 12px', width: 'auto', background: '#ffffff' }}
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                />
                <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>até</span>
                <input
                  type="date"
                  style={{ ...inputStyle, padding: '8px 12px', width: 'auto', background: '#ffffff' }}
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ width: 1, height: 44, background: '#e2e8f0', flexShrink: 0 }} />

        {/* Dropdowns de Filtragem */}
        <div style={{ display: 'flex', flex: 1, gap: 20, minWidth: 460 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Loja</span>
            <select style={{ ...inputStyle, background: '#ffffff', cursor: 'pointer', height: 44 }} value={filterStore} onChange={e => setFilterStore(e.target.value)}>
              <option value="">Todas as lojas</option>
              {storeOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Equipe</span>
            <select style={{ ...inputStyle, background: '#ffffff', cursor: 'pointer', height: 44 }} value={filterTeam} onChange={e => setFilterTeam(e.target.value)} disabled={!isAdmin && !isGerente}>
              <option value="">Todas as equipes</option>
              {teamOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Atendente</span>
            <select style={{ ...inputStyle, background: '#ffffff', cursor: 'pointer', height: 44 }} value={filterUser} onChange={e => setFilterUser(e.target.value)} disabled={!isAdmin && !isGerente && !isLiderEquipe}>
              <option value="">Todos os atendentes</option>
              {userOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Temperatura</span>
            <select style={{ ...inputStyle, background: '#ffffff', cursor: 'pointer', height: 44 }} value={filterTemperature} onChange={e => setFilterTemperature(e.target.value)}>
              <option value="">Todas</option>
              {IMPORTANCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label.replace('❄️ ', '').replace('🔥 ', '').replace('❤️ ', '')}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ─── COLUNAS DO KANBAN ─── */}
      <div style={{ display: 'flex', gap: 20, flex: 1, overflowX: 'auto', paddingBottom: 10 }}>
        {displayedColumns.map(col => (
          <KanbanColumn
            key={col.id}
            col={col}
            onMove={handleMove}
            onEdit={setEditingLead}
            onViewHistory={setHistoryLead}
          />
        ))}
      </div>

      {/* ─── MODAIS ─── */}
      {showModal && <NovoLeadModal onClose={() => setShowModal(false)} onSave={reloadLeads} />}
      {editingLead && <EditLeadModal lead={editingLead} onClose={() => setEditingLead(null)} onSave={reloadLeads} />}

      {closingLead && (
        <CloseLeadModal
          leadId={closingLead.id}
          leadName={closingLead.name}
          onClose={() => setClosingLead(null)}
          onSuccess={handleCloseLeadSuccess}
        />
      )}

      {historyLead && (
        <div style={overlayStyle} onClick={() => setHistoryLead(null)}>
          <div style={{ ...modalStyle, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                Histórico: <span style={{ color: '#2563eb' }}>{historyLead.name}</span>
              </h2>
              <button onClick={() => setHistoryLead(null)} style={closeBtnStyle}>✕</button>
            </div>

            <LeadHistoryTimeline history={(historyLead as any).history || []} />
          </div>
        </div>
      )}
    </div>
  );
}
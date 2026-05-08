console.log('NOVO CODIGO CARREGADO');
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

type LeadStage =
  | 'novo_lead'
  | 'contato_realizado'
  | 'agendamento_visita'
  | 'proposta_enviada'
  | 'em_negociacao'
  | 'vendido';

interface Lead {
  id: string;
  name: string;
  avatar: string;
  car: string;
  carImage: string;
  price: number;
  stage: LeadStage;
  status: string;
  timeAgo: string;
  statusUpdatedAt: string;
  origin?: string;
  isVerified?: boolean;
  hasAlert?: boolean;
}

interface KanbanCol {
  id: LeadStage;
  title: string;
  totalValue: number;
  headerColor: string;
  leads: Lead[];
}

const COLUMNS: { id: LeadStage; title: string; headerColor: string }[] = [
  { id: 'novo_lead',          title: 'Novo Lead',             headerColor: '#c53030' },
  { id: 'contato_realizado',  title: 'Contato Realizado',     headerColor: '#2d3748' },
  { id: 'agendamento_visita', title: 'Agendamento da Visita', headerColor: '#2d3748' },
  { id: 'proposta_enviada',   title: 'Proposta Enviada',      headerColor: '#2d3748' },
  { id: 'em_negociacao',      title: 'Em Negociação',         headerColor: '#276749' },
  { id: 'vendido',            title: 'Vendido',               headerColor: '#276749' },
];

// Origens padrão usadas como fallback se a API não retornar
const DEFAULT_SOURCES: LeadSource[] = [
  { id: 'instagram',    name: 'Instagram' },
  { id: 'whatsapp',     name: 'WhatsApp' },
  { id: 'loja_fisica',  name: 'Loja Física' },
  { id: 'indicacao',    name: 'Indicação' },
  { id: 'site',         name: 'Site' },
  { id: 'facebook',     name: 'Facebook' },
  { id: 'outros',       name: 'Outros' },
];

const MOCK_DATA: KanbanCol[] = [
  { id: 'novo_lead', title: 'Novo Lead', totalValue: 120000, headerColor: '#c53030', leads: [
    { id: '1', name: 'Amanda Lopes', avatar: 'https://i.pravatar.cc/40?img=1', car: 'Ford Ka 2021', carImage: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=160&h=80&fit=crop&auto=format', price: 58000, stage: 'novo_lead', status: 'Novo Lead', timeAgo: '24min atrás', statusUpdatedAt: '20 ults · 3as' },
    { id: '2', name: 'Ricardo Oliveira', avatar: 'https://i.pravatar.cc/40?img=3', car: 'Hyundai HB20 2020', carImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=160&h=80&fit=crop&auto=format', price: 32000, stage: 'novo_lead', status: 'Novo Lead', timeAgo: 'Ontem', statusUpdatedAt: '2h atrás' },
    { id: '3', name: 'Gabriela Lima', avatar: 'https://i.pravatar.cc/40?img=5', car: 'Fiat Argo 2019', carImage: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=160&h=80&fit=crop&auto=format', price: 30000, stage: 'novo_lead', status: 'Novo Lead', timeAgo: '23min atrás', statusUpdatedAt: '2h atrás', isVerified: true },
  ]},
  { id: 'contato_realizado', title: 'Contato Realizado', totalValue: 129900, headerColor: '#2d3748', leads: [
    { id: '4', name: 'José Silva', avatar: 'https://i.pravatar.cc/40?img=7', car: 'Jeep Renegade 2021', carImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=160&h=80&fit=crop&auto=format', price: 70900, stage: 'contato_realizado', status: 'Contato Realizado', timeAgo: 'Ontem', statusUpdatedAt: '25min atrás', isVerified: true },
    { id: '5', name: 'Vanessa Ribeiro', avatar: 'https://i.pravatar.cc/40?img=9', car: 'Audi A3 2020', carImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=160&h=80&fit=crop&auto=format', price: 59000, stage: 'contato_realizado', status: 'Novo Lead', timeAgo: 'Ontem', statusUpdatedAt: 'Ontem · 12h', isVerified: true },
  ]},
  { id: 'agendamento_visita', title: 'Agendamento da Visita', totalValue: 224500, headerColor: '#2d3748', leads: [
    { id: '6', name: 'Fabricio Garcia', avatar: 'https://i.pravatar.cc/40?img=11', car: 'Chevrolet Onix 2020', carImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=160&h=80&fit=crop&auto=format', price: 112500, stage: 'agendamento_visita', status: 'Visita Agendada', timeAgo: '63min atrás', statusUpdatedAt: '5min atrás', isVerified: true },
    { id: '7', name: 'Matheus Almeida', avatar: 'https://i.pravatar.cc/40?img=13', car: 'Toyota Corolla 2019', carImage: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=160&h=80&fit=crop&auto=format', price: 112000, stage: 'agendamento_visita', status: 'Proposta Agendada', timeAgo: '23min atrás', statusUpdatedAt: '28min atrás', hasAlert: true },
  ]},
  { id: 'proposta_enviada', title: 'Proposta Enviada', totalValue: 286800, headerColor: '#2d3748', leads: [
    { id: '8', name: 'Marcos Souza', avatar: 'https://i.pravatar.cc/40?img=15', car: 'VW Voyage 2020', carImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=160&h=80&fit=crop&auto=format', price: 77900, stage: 'proposta_enviada', status: 'Visita Agendada', timeAgo: '16min atrás', statusUpdatedAt: '8min atrás', isVerified: true },
    { id: '9', name: 'Thiago Carvalho', avatar: 'https://i.pravatar.cc/40?img=17', car: 'VW Voyage 2020', carImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=160&h=80&fit=crop&auto=format', price: 209000, stage: 'proposta_enviada', status: 'Proposta Enviada', timeAgo: '23min atrás', statusUpdatedAt: '41min atrás', hasAlert: true },
  ]},
  { id: 'em_negociacao', title: 'Em Negociação', totalValue: 302700, headerColor: '#276749', leads: [
    { id: '10', name: 'Luciano Pereira', avatar: 'https://i.pravatar.cc/40?img=19', car: 'Mitsubishi Eclipse 2021', carImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=80&fit=crop&auto=format', price: 85500, stage: 'em_negociacao', status: 'Em Negociação', timeAgo: '28min atrás', statusUpdatedAt: '12min atrás', isVerified: true },
    { id: '11', name: 'Justin Rodrigues', avatar: 'https://i.pravatar.cc/40?img=21', car: 'Toyota Yaris 2019', carImage: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=160&h=80&fit=crop&auto=format', price: 79000, stage: 'em_negociacao', status: 'Vendido', timeAgo: '9h atrás', statusUpdatedAt: '2d atrás', isVerified: true },
  ]},
  { id: 'vendido', title: 'Vendido', totalValue: 198000, headerColor: '#276749', leads: [
    { id: '12', name: 'Bruno Alves', avatar: 'https://i.pravatar.cc/40?img=23', car: 'Hyundai Creta 2021', carImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=80&fit=crop&auto=format', price: 100000, stage: 'vendido', status: 'Entregue', timeAgo: '23min atrás', statusUpdatedAt: '', isVerified: true },
    { id: '13', name: 'Juliana Costa', avatar: 'https://i.pravatar.cc/40?img=25', car: 'Hyundai Creta 2021', carImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=80&fit=crop&auto=format', price: 100000, stage: 'vendido', status: 'Entregue', timeAgo: '2d atrás', statusUpdatedAt: '', isVerified: true },
  ]},
];

const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  'Novo Lead':         { bg: '#38a169', color: '#fff' },
  'Contato Realizado': { bg: '#3182ce', color: '#fff' },
  'Visita Agendada':   { bg: '#dd6b20', color: '#fff' },
  'Proposta Enviada':  { bg: '#e53e3e', color: '#fff' },
  'Proposta Agendada': { bg: '#319795', color: '#fff' },
  'Em Negociação':     { bg: '#38a169', color: '#fff' },
  'Vendido':           { bg: '#38a169', color: '#fff' },
  'Entregue':          { bg: '#2d3748', color: '#fff' },
};

// Ícones para origens
const SOURCE_ICONS: Record<string, string> = {
  'Instagram':    '📸',
  'WhatsApp':     '💬',
  'Loja Física':  '🏪',
  'Indicação':    '🤝',
  'Site':         '🌐',
  'Facebook':     '👥',
  'Outros':       '📋',
};

const statusToStage: Record<string, LeadStage> = {
  'Novo Lead':         'novo_lead',
  'Contato Realizado': 'contato_realizado',
  'Visita Agendada':   'agendamento_visita',
  'Proposta Enviada':  'proposta_enviada',
  'Em Negociação':     'em_negociacao',
  'Vendido':           'vendido',
  'Entregue':          'vendido',
};

const mapApiLeadToKanban = (lead: LeadFromAPI): Lead => ({
  id: lead.id,
  name: (lead.name as string) || (lead.client as { name?: string })?.name || 'Sem nome',
  avatar: `https://i.pravatar.cc/40?u=${lead.id}`,
  car: (lead.car as string) || 'Veículo não informado',
  carImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=160&h=80&fit=crop&auto=format',
  price: Number(lead.price) || 0,
  stage: statusToStage[(lead.status as string)] || 'novo_lead',
  status: (lead.status as string) || 'Novo Lead',
  origin: (lead.source as { name?: string })?.name || (lead.origin as string) || '',
  timeAgo: lead.createdAt ? new Date(lead.createdAt as string).toLocaleDateString('pt-BR') : '',
  statusUpdatedAt: '',
});

const groupLeadsIntoColumns = (leads: LeadFromAPI[]): KanbanCol[] => {
  return COLUMNS.map(col => {
    const colLeads = leads
      .filter(l => statusToStage[l.status as string] === col.id)
      .map(mapApiLeadToKanban);
    return {
      ...col,
      totalValue: colLeads.reduce((s, l) => s + l.price, 0),
      leads: colLeads,
    };
  });
};

// ============================================================
// LEAD CARD
// ============================================================
function LeadCard({ lead }: { lead: Lead }) {
  const st = STATUS_STYLES[lead.status] || { bg: '#718096', color: '#fff' };
  return (
    <div
      style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #edf2f7', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.13)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <img src={lead.avatar} alt={lead.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
          <div style={{ fontSize: 11, color: '#718096', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.car}</div>
        </div>
        {lead.isVerified && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="8" fill="#38a169" />
            <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {lead.hasAlert && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="8" fill="#e53e3e" />
            <rect x="7.5" y="4" width="1" height="5" rx="0.5" fill="white" />
            <circle cx="8" cy="11" r="0.75" fill="white" />
          </svg>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', letterSpacing: '-0.3px' }}>{fmt(lead.price)}</span>
        <span style={{ fontSize: 11, color: '#a0aec0' }}>{lead.timeAgo}</span>
      </div>

      <div style={{ width: '100%', height: 58, borderRadius: 6, overflow: 'hidden', marginBottom: 10, background: '#f7fafc' }}>
        <img src={lead.carImage} alt={lead.car} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
          {(lead.status === 'Vendido' || lead.status === 'Entregue') && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          {lead.status}
        </span>
        {lead.origin && (
          <span style={{ fontSize: 10, color: '#718096', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 6px' }}>
            {SOURCE_ICONS[lead.origin] || '📋'} {lead.origin}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// KANBAN COLUMN
// ============================================================
function KanbanColumn({ col }: { col: KanbanCol }) {
  const total = col.leads.reduce((s, l) => s + l.price, 0);
  return (
    <div style={{ minWidth: 235, width: 235, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRadius: 8, overflow: 'hidden', background: '#f7fafc', border: '1px solid #e2e8f0' }}>
      <div style={{ padding: '12px 14px', background: col.headerColor }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{col.title}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>{fmt(col.totalValue)}</div>
      </div>
      <div style={{ padding: '8px 12px 4px', background: '#fff', borderBottom: '1px solid #edf2f7' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568' }}>{col.title}</div>
      </div>
      <div style={{ padding: '4px 12px 8px', background: '#fff', borderBottom: '2px solid #edf2f7' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#2d3748' }}>{fmt(total)}</span>
        <span style={{ fontSize: 11, color: '#a0aec0' }}> — {col.leads.length} leads</span>
      </div>
      <div style={{ padding: '10px 8px', overflowY: 'auto', flex: 1, maxHeight: 'calc(100vh - 290px)' }}>
        {col.leads.length === 0
          ? <div style={{ textAlign: 'center', color: '#a0aec0', fontSize: 12, padding: '20px 0' }}>Nenhum lead</div>
          : col.leads.map(lead => <LeadCard key={lead.id} lead={lead} />)
        }
      </div>
    </div>
  );
}

// ============================================================
// CREATE LEAD MODAL
// ============================================================
interface CreateLeadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  sources: LeadSource[];
}

function CreateLeadModal({ onClose, onSuccess, sources }: CreateLeadModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', status: 'Novo Lead', sourceId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, color: '#2d3748', background: '#f7fafc', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600 as const, color: '#4a5568', marginBottom: 6 };

  const selectedSource = sources.find(s => s.id === form.sourceId);

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Nome é obrigatório'); return; }
    if (!form.sourceId) { setError('Selecione uma origem'); return; }
    setLoading(true);
    setError('');
    try {
      await createLead({
        name: form.name,
        phone: form.phone,
        status: form.status,
        origin: selectedSource?.name || '',
        sourceId: form.sourceId,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 460, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a202c' }}>Nova Oportunidade</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Preencha os dados do lead</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nome do cliente *</label>
            <input style={inputStyle} placeholder="Ex: João Silva" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onFocus={e => (e.target.style.borderColor = '#38a169')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>

          <div>
            <label style={labelStyle}>Telefone</label>
            <input style={inputStyle} placeholder="Ex: (11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} onFocus={e => (e.target.style.borderColor = '#38a169')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>

          {/* Origem — grid de botões */}
          <div>
            <label style={labelStyle}>Origem do lead *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {sources.map(source => (
                <button
                  key={source.id}
                  onClick={() => setForm(f => ({ ...f, sourceId: source.id }))}
                  style={{
                    padding: '10px 8px',
                    border: `2px solid ${form.sourceId === source.id ? '#38a169' : '#e2e8f0'}`,
                    borderRadius: 8,
                    background: form.sourceId === source.id ? '#f0fff4' : '#fff',
                    color: form.sourceId === source.id ? '#276749' : '#4a5568',
                    fontSize: 12,
                    fontWeight: form.sourceId === source.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{SOURCE_ICONS[source.name] || '📋'}</span>
                  <span>{source.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Status inicial</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option>Novo Lead</option>
              <option>Contato Realizado</option>
              <option>Visita Agendada</option>
              <option>Proposta Enviada</option>
              <option>Em Negociação</option>
              <option>Vendido</option>
            </select>
          </div>

          {error && <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#c53030' }}>{error}</div>}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#4a5568', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 6, background: loading ? '#9ae6b4' : '#38a169', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Salvando...' : '+ Criar Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function LeadsPage() {
  const [columns] = useState<KanbanCol[]>(MOCK_DATA);
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#edf2f7', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
  
  <button
  onClick={() => navigate("/dashboard")}
  style={{
    width: 40,
    height: 40,
    background: 'red',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18
  }}
>
  D
</button>

  {/* BOTÃO ORIGINAL */}
  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Oportunidade
          </button>
          {usingMock && <span style={{ fontSize: 11, color: '#dd6b20', background: '#fffaf0', border: '1px solid #f6ad55', borderRadius: 4, padding: '3px 8px' }}>⚠ Dados mock — API offline</span>}
          {loading && <span style={{ fontSize: 11, color: '#3182ce' }}>Carregando leads...</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Últimos 30 dias', 'Filtro'].map(label => (
            <button key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #e2e8f0', borderRadius: 20, background: '#fff', color: '#4a5568', padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              {label}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, height: '100%', minWidth: 'max-content' }}>
          {columns.map(col => <KanbanColumn key={col.id} col={col} />)}
        </div>
      </div>

      <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '10px 24px', display: 'flex', justifyContent: 'flex-end', gap: 24, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#4a5568' }}>Resultado <strong style={{ color: '#1a202c' }}>R$0</strong></span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#38a169' }}>Conversão <strong>0%</strong></span>
      </div>
    </div>
  );
}
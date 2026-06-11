import { LeadStage, STAGE_ORDER } from '../utils/leadStageValidator';
import { Lead, LeadStatus, KanbanCol } from '../types';
import { ApiLead } from '../../../services/leadsApi';

const STAGE_TO_STATUS: Record<LeadStage, LeadStatus> = {
  novo_lead:  'Novo Lead',
  contato:    'Contato',
  proposta:   'Proposta',
  negociacao: 'Negociação',
  fechado:    'Fechado',
};

function isStage(value: unknown): value is LeadStage {
  return (
    typeof value === 'string' &&
    (STAGE_ORDER as readonly string[]).includes(value)
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return '';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Ontem' : `${days}d atrás`;
}

export function toLead(api: ApiLead): Lead {
  const stage: LeadStage = isStage(api.status) ? api.status : 'novo_lead';
  return {
    id: api.id,
    name: api.client?.name ?? api.name ?? 'Sem nome',
    avatar: `https://i.pravatar.cc/40?u=${api.id}`,
    car: '',
    carImage: '',
    price: 0,
    stage,
    status: STAGE_TO_STATUS[stage],
    timeAgo: timeAgo(api.createdAt),
    statusUpdatedAt: '',
    storeId:      api.store?.id,
    storeName:    api.store?.name,
    teamId:       api.team?.id,
    teamName:     api.team?.name,
    userId:       api.user?.id,
    userName:     api.user?.name,
    origin:       api.origin,
    phone:        api.phone ?? undefined,
    closingReason: api.closingReason ?? undefined,  // linha nova
    converted:     api.converted ?? undefined,       // linha nova
    temperatura: (['frio', 'morno', 'quente'].includes((api as any).negotiation?.importance ?? '')
  ? (api as any).negotiation?.importance
  : undefined) as 'frio' | 'morno' | 'quente' | undefined,
  };
}

export function apiLeadsToColumns(
  apiLeads: ApiLead[],
  template: KanbanCol[],
): KanbanCol[] {
  const grouped = new Map<LeadStage, Lead[]>();
  for (const api of apiLeads) {
    const lead = toLead(api);
    const existing = grouped.get(lead.stage) ?? [];
    existing.push(lead);
    grouped.set(lead.stage, existing);
  }

  return template.map(col => {
    const leads = grouped.get(col.id) ?? [];
    const totalValue = leads.reduce((sum, l) => sum + l.price, 0);
    return { ...col, leads, totalValue };
  });
}

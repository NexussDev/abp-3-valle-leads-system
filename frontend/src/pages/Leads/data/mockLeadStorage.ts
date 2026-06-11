import { Lead } from '../../../types/Lead';
import { HistoryLog } from '../../../types/Lead';

const STORAGE_KEY = 'mock_kanban_leads';

export interface ClientLeadFormData {
  name: string;
  phone: string;
  city?: string;
  car: string;
  origin: string;
}

function getNextLeadNumber(): string {
  const leads = getStoredLeads();
  const nextNumber = leads.length + 1;

  return `LD-${String(nextNumber).padStart(3, '0')}`;
}

// Mapa de etapas antigas → novas (remoção de agendamento_visita, renomeações)
const STAGE_MIGRATION: Record<string, Lead['stage']> = {
  contato_realizado:  'contato',
  agendamento_visita: 'contato',
  proposta_enviada:   'proposta',
  em_negociacao:      'negociacao',
  vendido:            'fechado',
};

// Função auxiliar para gerar datas formatadas no padrão brasileiro (DD/MM/AAAA HH:MM)
function formatCurrentDate(): string {
  const now = new Date();
  return now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Dicionário auxiliar para converter id de estágio em nome legível para o log
const STAGE_LABELS: Record<string, string> = {
  novo_lead: 'Novo Lead',
  contato: 'Contato',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
};

export function getStoredLeads(): Lead[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const leads = JSON.parse(raw) as Lead[];
    return leads.map(lead => {
      const migrated = STAGE_MIGRATION[lead.stage as string];
      return migrated ? { ...lead, stage: migrated } : lead;
    });
  } catch {
    return [];
  }
}

export function saveClientLead(data: ClientLeadFormData): Lead {
  const leads = getStoredLeads();
  const leadNumber = getNextLeadNumber();
  const currentTimeStr = formatCurrentDate();

  // Criando o log inicial de criação
  const initialLog: HistoryLog = {
    id: crypto.randomUUID(),
    field: 'create',
    newValue: data.car,
    updatedAt: currentTimeStr,
    responsibleName: 'Sistema Automático',
  };

const newLead: Lead = {
  id: crypto.randomUUID(),
  leadNumber,
  name: data.name,
  avatar: `https://i.pravatar.com/40?u=${leadNumber}`,
  car: data.car,
  image: '', // 👈 MUDADO DE carImage PARA image PARA ALINHAR COM O Lead.ts
  price: 0,
  stage: 'novo_lead',
  status: 'Novo Lead',
  time: 'agora',
  date: new Date().toLocaleDateString('pt-BR'),
    statusUpdatedAt: new Date().toISOString(),
    origin: data.origin,
    phone: data.phone,
    city: data.city,
 history: [] // 👈 JÁ INICIALIZA O HISTÓRICO COMO UM ARRAY VAZIO COBERTO PELO REQUISITO!
};

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...leads, newLead]));

  window.dispatchEvent(new Event('mock-leads-updated'));

  return newLead;
}

export function updateStoredLeadStage(leadId: string, stage: Lead['stage']) {
  const leads = getStoredLeads();
  
  // 1. Criamos uma variável para rastrear o log gerado
  let logGerado: HistoryLog | null = null;

  const updatedLeads = leads.map(lead => {
    if (lead.id === leadId) {
      // Captura o estágio antigo diretamente do lead atual
      const oldStage = lead.stage || 'novo_lead';
      const newStage = stage;

      // Só gera o log se o estágio realmente mudou
      if (oldStage !== newStage) {
        logGerado = {
          id: crypto.randomUUID(),
          field: 'stage',
          oldValue: STAGE_LABELS[oldStage] || oldStage,
          newValue: STAGE_LABELS[newStage] || newStage,
          updatedAt: new Date().toLocaleString('pt-BR'),
          responsibleName: 'João' // Usuário logado
        };
      }

      // Retorna o lead atualizado com o novo estágio, novo status textual e histórico atualizado
      return {
        ...lead,
        stage,
        status:
          stage === 'novo_lead' ? 'Novo Lead' :
          stage === 'contato'   ? 'Contato' :
          stage === 'proposta'  ? 'Proposta' :
          stage === 'negociacao'? 'Negociação' :
          'Fechado',
        statusUpdatedAt: new Date().toISOString(),
        // Garante que o histórico exista e adiciona o novo log no início da lista (mais recente primeiro)
        history: logGerado ? [logGerado, ...(lead.history || [])] : (lead.history || [])
      };
    }
    
    return lead;
  });

  // 2. Salva a lista inteira atualizada no localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));

  // 3. Dispara o evento global para atualizar as telas em tempo real
  window.dispatchEvent(new Event('mock-leads-updated'));
}
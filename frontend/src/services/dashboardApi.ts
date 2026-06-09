import { client } from './leadsApi';

export interface DashboardOperacional {
  total: number;
  fechados: number;
  conversao: string;
  byStage: Record<string, number>;
  byOrigin: Record<string, number>;
  byStore: { store: string; count: number }[];
  byImportance: Record<string, number>;
  tempoMedioAtendimentoHoras: string | null;
  leadsSemAtendimento: number;
  leadsParaRepescar: number;
  repescagemDias: number;
}

export interface DashboardAnalytico {
  total: number;
  fechados: number;
  naoConvertidos: number;
  taxaConversao: string;
  byAtendente: { atendente: string; count: number }[];
  byEquipe: { equipe: string; count: number }[];
  byImportance: Record<string, number>;
  closingReasons: { motivo: string; count: number }[];
  tempoMedioAtendimentoHoras: string | null;
  leadsSemAtendimento: number;
  leadsParaRepescar: number;
  repescagemDias: number;
}

export type DashboardPeriod = 'week' | 'month' | 'year';

export async function fetchDashboardOperacional(
  period: DashboardPeriod = 'month',
): Promise<DashboardOperacional> {
  const { data } = await client.get<DashboardOperacional>('/dashboard', {
    params: { period },
  });
  return data;
}

export async function fetchDashboardAnalytico(
  period: DashboardPeriod = 'month',
): Promise<DashboardAnalytico> {
  const { data } = await client.get<DashboardAnalytico>('/dashboard/analytics', {
    params: { period },
  });
  return data;
}
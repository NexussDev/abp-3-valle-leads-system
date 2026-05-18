import { AppError } from '../../shared/errors/AppError';

export const LEAD_STAGES = ['novo_lead', 'contato', 'proposta', 'negociacao', 'fechado'] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const STAGE_LABELS: Record<LeadStage, string> = {
  novo_lead: 'Novo Lead',
  contato: 'Contato',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
};

export function validateStageTransition(
  currentStage: string | null | undefined,
  newStage: string,
  closingReason?: string,
): void {
  const current = (currentStage ?? 'novo_lead') as LeadStage;

  if (!LEAD_STAGES.includes(newStage as LeadStage)) {
    throw new AppError(`Etapa inválida: "${newStage}". Valores aceitos: ${LEAD_STAGES.join(', ')}`, 400);
  }

  const currentIdx = LEAD_STAGES.indexOf(current);
  const newIdx = LEAD_STAGES.indexOf(newStage as LeadStage);

  if (newIdx <= currentIdx) {
    throw new AppError(
      `Não é permitido retroceder etapas. Etapa atual: "${STAGE_LABELS[current]}"`,
      422,
    );
  }

  if (newIdx - currentIdx > 1) {
    const next = LEAD_STAGES[currentIdx + 1];
    throw new AppError(
      `Não é permitido pular etapas. Próxima etapa obrigatória: "${STAGE_LABELS[next]}"`,
      422,
    );
  }

  if (newStage === 'fechado') {
    if (current !== 'negociacao') {
      throw new AppError('Lead só pode ser fechado a partir da etapa "Negociação"', 422);
    }
    if (!closingReason || closingReason.trim().length === 0) {
      throw new AppError('Motivo de fechamento é obrigatório ao fechar um lead', 422);
    }
  }
}

export function isValidStage(value: unknown): value is LeadStage {
  return LEAD_STAGES.includes(value as LeadStage);
}

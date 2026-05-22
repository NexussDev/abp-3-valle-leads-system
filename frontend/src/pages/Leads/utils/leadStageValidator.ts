export const STAGE_ORDER = [
  'novo_lead',
  'contato',
  'proposta',
  'negociacao',
  'fechado',
] as const;

export type LeadStage = typeof STAGE_ORDER[number];

export const STAGE_LABEL: Record<LeadStage, string> = {
  novo_lead:  'Novo Lead',
  contato:    'Contato',
  proposta:   'Proposta',
  negociacao: 'Negociação',
  fechado:    'Fechado',
};

export const CLOSING_STAGE: LeadStage = 'fechado';
export const REQUIRED_PREVIOUS_STAGE: LeadStage = 'negociacao';

export type MoveValidation =
  | { allowed: true }
  | { allowed: false; reason: string };

export function validateStageMove(from: LeadStage, to: LeadStage): MoveValidation {
  if (from === to) return { allowed: true };

  const fromIdx = STAGE_ORDER.indexOf(from);
  const toIdx   = STAGE_ORDER.indexOf(to);

  if (toIdx < fromIdx) {
    return {
      allowed: false,
      reason: `Não é permitido retroceder etapas. O lead está em "${STAGE_LABEL[from]}" e não pode voltar para "${STAGE_LABEL[to]}".`,
    };
  }

  if (toIdx - fromIdx > 1) {
    const next = STAGE_ORDER[fromIdx + 1];
    return {
      allowed: false,
      reason: `Não é permitido pular etapas. De "${STAGE_LABEL[from]}", o próximo passo obrigatório é "${STAGE_LABEL[next]}".`,
    };
  }

  return { allowed: true };
}

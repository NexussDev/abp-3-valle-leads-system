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
  const toIdx = STAGE_ORDER.indexOf(to);

  if (fromIdx === -1 || toIdx === -1) {
    return {
      allowed: false,
      reason: 'Estágio inválido.',
    };
  }

  const diff = toIdx - fromIdx;

  if (diff > 1) {
    const next = STAGE_ORDER[fromIdx + 1];

    return {
      allowed: false,
      reason: `Não é permitido pular etapas. De "${STAGE_LABEL[from]}", o próximo passo obrigatório é "${STAGE_LABEL[next]}".`,
    };
  }

  if (diff < -1) {
    const previous = STAGE_ORDER[fromIdx - 1];

    return {
      allowed: false,
      reason: `Não é permitido retroceder mais de uma etapa por vez. De "${STAGE_LABEL[from]}", o retorno permitido é para "${STAGE_LABEL[previous]}".`,
    };
  }

  return { allowed: true };
}
import { AppError } from '../../shared/errors/AppError';

export const STAGE_ORDER = [
  'novo_lead',
  'contato',
  'proposta',
  'negociacao',
  'fechado',
] as const;

export type LeadStage = typeof STAGE_ORDER[number];

export function validateStageTransition(
  currentStage: string,
  nextStage: string,
  closingReason?: string,
): void {
  if (currentStage === nextStage) return;

  const currentIndex = STAGE_ORDER.indexOf(currentStage as LeadStage);
  const nextIndex = STAGE_ORDER.indexOf(nextStage as LeadStage);

  if (currentIndex === -1 || nextIndex === -1) {
    throw new AppError('Status inválido.', 400);
  }

  const diff = nextIndex - currentIndex;

  if (diff > 1) {
    throw new AppError('Não é permitido pular etapas.', 400);
  }

  if (diff < -1) {
    throw new AppError('Não é permitido retroceder mais de uma etapa por vez.', 400);
  }

  if (nextStage === 'fechado' && !closingReason) {
    throw new AppError('Informe o motivo de fechamento.', 400);
  }
}

export function isValidStage(value: string): value is LeadStage {
  return STAGE_ORDER.includes(value as LeadStage);
}
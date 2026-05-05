// Etapas em ordem do funil. Alterar aqui se o funil mudar.
export const STAGE_ORDER = [
    'novo_lead',
    'contato_realizado',
    'agendamento_visita',
    'proposta_enviada',
    'em_negociacao',
    'vendido',
  ] as const;
  
  export type LeadStage = typeof STAGE_ORDER[number];
  
  const STAGE_LABEL: Record<LeadStage, string> = {
    novo_lead: 'Novo Lead',
    contato_realizado: 'Contato Realizado',
    agendamento_visita: 'Agendamento da Visita',
    proposta_enviada: 'Proposta Enviada',
    em_negociacao: 'Em Negociação',
    vendido: 'Vendido',
  };
  
  export const CLOSING_STAGE: LeadStage = 'vendido';
  export const REQUIRED_PREVIOUS_STAGE: LeadStage = 'em_negociacao';
  
  export type MoveValidation =
    | { allowed: true }
    | { allowed: false; reason: string };
  
  /**
   * Regra: para fechar (mover para "vendido"), o lead precisa estar em "em_negociacao".
   * Demais movimentações são livres (compatível com o board atual sem drag-and-drop completo).
   */
  export function validateStageMove(
    from: LeadStage,
    to: LeadStage,
  ): MoveValidation {
    if (from === to) return { allowed: true };
  
    if (to === CLOSING_STAGE && from !== REQUIRED_PREVIOUS_STAGE) {
      return {
        allowed: false,
        reason:
          `Não é possível fechar o lead direto a partir de "${STAGE_LABEL[from]}". ` +
          `O lead precisa estar em "${STAGE_LABEL[REQUIRED_PREVIOUS_STAGE]}" antes de ser movido para "${STAGE_LABEL[CLOSING_STAGE]}".`,
      };
    }
  
    return { allowed: true };
  }
  
import { validateStageTransition, LEAD_STAGES } from '../domain/entities/LeadStage';
import { AppError } from '../shared/errors/AppError';

describe('LeadStage — validateStageTransition', () => {
  describe('transições válidas', () => {
    it('deve aceitar novo_lead → contato', () => {
      expect(() => validateStageTransition('novo_lead', 'contato')).not.toThrow();
    });
    it('deve aceitar contato → proposta', () => {
      expect(() => validateStageTransition('contato', 'proposta')).not.toThrow();
    });
    it('deve aceitar proposta → negociacao', () => {
      expect(() => validateStageTransition('proposta', 'negociacao')).not.toThrow();
    });
    it('deve aceitar negociacao → fechado com motivo', () => {
      expect(() =>
        validateStageTransition('negociacao', 'fechado', 'Cliente comprou o veículo')
      ).not.toThrow();
    });
  });

  describe('proibição de pular etapas', () => {
    it('deve rejeitar novo_lead → proposta', () => {
      expect(() => validateStageTransition('novo_lead', 'proposta')).toThrow(AppError);
    });
    it('deve rejeitar novo_lead → negociacao', () => {
      expect(() => validateStageTransition('novo_lead', 'negociacao')).toThrow(AppError);
    });
    it('deve rejeitar novo_lead → fechado', () => {
      expect(() => validateStageTransition('novo_lead', 'fechado')).toThrow(AppError);
    });
    it('deve rejeitar contato → negociacao', () => {
      expect(() => validateStageTransition('contato', 'negociacao')).toThrow(AppError);
    });
    it('deve rejeitar proposta → fechado sem passar por negociacao', () => {
      expect(() => validateStageTransition('proposta', 'fechado')).toThrow(AppError);
    });
  });

  describe('proibição de retrocesso', () => {
    it('deve rejeitar negociacao → proposta', () => {
      expect(() => validateStageTransition('negociacao', 'proposta')).toThrow(AppError);
    });
    it('deve rejeitar proposta → contato', () => {
      expect(() => validateStageTransition('proposta', 'contato')).toThrow(AppError);
    });
    it('deve rejeitar contato → novo_lead', () => {
      expect(() => validateStageTransition('contato', 'novo_lead')).toThrow(AppError);
    });
  });

  describe('regra de fechamento', () => {
    it('deve rejeitar fechamento sem motivo', () => {
      expect(() => validateStageTransition('negociacao', 'fechado')).toThrow(AppError);
    });
    it('deve rejeitar fechamento com motivo vazio', () => {
      expect(() => validateStageTransition('negociacao', 'fechado', '   ')).toThrow(AppError);
    });
    it('deve rejeitar fechamento a partir de contato', () => {
      expect(() =>
        validateStageTransition('contato', 'fechado', 'motivo qualquer')
      ).toThrow(AppError);
    });
  });

  describe('etapas inválidas', () => {
    it('deve rejeitar etapa desconhecida', () => {
      expect(() => validateStageTransition('novo_lead', 'stage_inexistente')).toThrow(AppError);
    });
  });
});

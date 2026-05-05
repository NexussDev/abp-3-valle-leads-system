import { describe, it, expect } from "vitest";
import {
  validateStageMove,
  STAGE_ORDER,
  CLOSING_STAGE,
  REQUIRED_PREVIOUS_STAGE,
  LeadStage,
} from "./leadStageValidator";

describe("validateStageMove", () => {
  it("permite manter o lead na mesma etapa", () => {
    for (const stage of STAGE_ORDER) {
      expect(validateStageMove(stage, stage)).toEqual({ allowed: true });
    }
  });

  it("permite movimentações entre etapas que não sejam o fechamento", () => {
    expect(
      validateStageMove("novo_lead", "contato_realizado"),
    ).toEqual({ allowed: true });
    expect(
      validateStageMove("proposta_enviada", "novo_lead"),
    ).toEqual({ allowed: true });
  });

  it("permite fechar o lead quando vem de em_negociacao", () => {
    expect(
      validateStageMove(REQUIRED_PREVIOUS_STAGE, CLOSING_STAGE),
    ).toEqual({ allowed: true });
  });

  it("bloqueia o fechamento quando vem de qualquer etapa anterior à negociação", () => {
    const blockedStages: LeadStage[] = STAGE_ORDER.filter(
      s => s !== REQUIRED_PREVIOUS_STAGE && s !== CLOSING_STAGE,
    );

    for (const from of blockedStages) {
      const result = validateStageMove(from, CLOSING_STAGE);
      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.reason).toMatch(/Em Negociação/);
        expect(result.reason).toMatch(/Vendido/);
      }
    }
  });

  it("a mensagem de bloqueio inclui o nome legível da etapa atual", () => {
    const result = validateStageMove("novo_lead", "vendido");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toContain("Novo Lead");
    }
  });
});

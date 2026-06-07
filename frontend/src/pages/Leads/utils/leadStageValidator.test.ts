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

  it("permite avançar uma etapa por vez", () => {
    expect(validateStageMove("novo_lead",  "contato")).toEqual({ allowed: true });
    expect(validateStageMove("contato",    "proposta")).toEqual({ allowed: true });
    expect(validateStageMove("proposta",   "negociacao")).toEqual({ allowed: true });
    expect(validateStageMove("negociacao", "fechado")).toEqual({ allowed: true });
  });

  it("permite fechar o lead quando vem de negociacao", () => {
    expect(validateStageMove(REQUIRED_PREVIOUS_STAGE, CLOSING_STAGE)).toEqual({ allowed: true });
  });

  it("bloqueia pular etapas", () => {
    const result = validateStageMove("novo_lead", "proposta");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toContain("Contato");
    }
  });

  it("bloqueia retroceder etapas", () => {
    const result = validateStageMove("negociacao", "contato");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toContain("retroceder");
    }
  });

  it("bloqueia o fechamento a partir de qualquer etapa que não seja negociacao", () => {
    const blocked: LeadStage[] = STAGE_ORDER.filter(
      s => s !== REQUIRED_PREVIOUS_STAGE && s !== CLOSING_STAGE,
    );

    for (const from of blocked) {
      const result = validateStageMove(from, CLOSING_STAGE);
      expect(result.allowed).toBe(false);
    }
  });

  it("a mensagem de bloqueio inclui o nome legível da etapa atual", () => {
    const result = validateStageMove("novo_lead", "negociacao");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toContain("Novo Lead");
    }
  });
});

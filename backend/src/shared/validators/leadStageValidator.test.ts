import { describe, it, expect } from "vitest";
import {
  validateStageMove,
  isValidStage,
  STAGE_ORDER,
  CLOSING_STAGE,
  REQUIRED_PREVIOUS_STAGE,
  LeadStage,
} from "./leadStageValidator";

describe("isValidStage", () => {
  it("aceita todas as etapas conhecidas", () => {
    for (const stage of STAGE_ORDER) {
      expect(isValidStage(stage)).toBe(true);
    }
  });

  it("rejeita strings desconhecidas", () => {
    expect(isValidStage("foo")).toBe(false);
    expect(isValidStage("")).toBe(false);
    expect(isValidStage("VENDIDO")).toBe(false);
  });

  it("rejeita valores não-string", () => {
    expect(isValidStage(null)).toBe(false);
    expect(isValidStage(undefined)).toBe(false);
    expect(isValidStage(42)).toBe(false);
    expect(isValidStage({})).toBe(false);
  });
});

describe("validateStageMove", () => {
  it("permite manter o lead na mesma etapa (inclusive vendido→vendido)", () => {
    for (const stage of STAGE_ORDER) {
      expect(validateStageMove(stage, stage)).toEqual({ allowed: true });
    }
  });

  it("permite movimentações que não sejam fechamento", () => {
    expect(
      validateStageMove("novo_lead", "contato_realizado"),
    ).toEqual({ allowed: true });
    expect(
      validateStageMove("agendamento_visita", "novo_lead"),
    ).toEqual({ allowed: true });
  });

  it("permite fechar o lead quando ele está em em_negociacao", () => {
    expect(
      validateStageMove(REQUIRED_PREVIOUS_STAGE, CLOSING_STAGE),
    ).toEqual({ allowed: true });
  });

  it("bloqueia o fechamento a partir de qualquer etapa anterior à negociação", () => {
    const blockedFrom: LeadStage[] = STAGE_ORDER.filter(
      s => s !== REQUIRED_PREVIOUS_STAGE && s !== CLOSING_STAGE,
    );
    for (const from of blockedFrom) {
      const result = validateStageMove(from, CLOSING_STAGE);
      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.reason).toMatch(/Em Negociação/);
        expect(result.reason).toMatch(/Vendido/);
      }
    }
  });

  it("bloqueia também quando o status atual é null/undefined (lead recém-criado sem stage)", () => {
    const fromNull = validateStageMove(null, CLOSING_STAGE);
    expect(fromNull.allowed).toBe(false);
    if (!fromNull.allowed) {
      expect(fromNull.reason).toContain("estado desconhecido");
    }

    const fromUndef = validateStageMove(undefined, CLOSING_STAGE);
    expect(fromUndef.allowed).toBe(false);
  });

  it("a mensagem traz o rótulo legível da etapa atual", () => {
    const result = validateStageMove("novo_lead", "vendido");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toContain("Novo Lead");
    }
  });
});

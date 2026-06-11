import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useKanbanBoard } from "./useKanbanBoard";
import { LeadStage } from "../utils/leadStageValidator";

interface TestLead {
  id: string;
  stage: LeadStage;
  name: string;
}
interface TestColumn {
  id: LeadStage;
  title: string;
  leads: TestLead[];
}

const seed = (): TestColumn[] => [
  {
    id: "novo_lead",
    title: "Novo Lead",
    leads: [{ id: "L1", stage: "novo_lead", name: "Ana" }],
  },
  {
    id: "contato",
    title: "Contato",
    leads: [],
  },
  {
    id: "negociacao",
    title: "Negociação",
    leads: [{ id: "L2", stage: "negociacao", name: "Bruno" }],
  },
  {
    id: "fechado",
    title: "Fechado",
    leads: [],
  },
];

describe("useKanbanBoard", () => {
  it("inicializa com as colunas recebidas", () => {
    const { result } = renderHook(() => useKanbanBoard(seed()));
    expect(result.current.columns).toHaveLength(4);
    expect(result.current.columns[0].leads[0].id).toBe("L1");
  });

  it("move o lead entre colunas quando a transição é permitida", () => {
    const { result } = renderHook(() => useKanbanBoard(seed()));

    let outcome: ReturnType<typeof result.current.moveLead> | undefined;
    act(() => {
      outcome = result.current.moveLead("L1", "novo_lead", "contato");
    });

    expect(outcome).toEqual({ success: true });
    expect(
      result.current.columns.find(c => c.id === "novo_lead")?.leads,
    ).toHaveLength(0);
    const dest = result.current.columns.find(c => c.id === "contato");
    expect(dest?.leads).toHaveLength(1);
    expect(dest?.leads[0]).toMatchObject({
      id: "L1",
      stage: "contato",
      name: "Ana",
    });
  });

  it("permite fechar o lead quando ele está em negociacao", () => {
    const { result } = renderHook(() => useKanbanBoard(seed()));

    let outcome: ReturnType<typeof result.current.moveLead> | undefined;
    act(() => {
      outcome = result.current.moveLead("L2", "negociacao", "fechado");
    });

    expect(outcome).toEqual({ success: true });
    expect(
      result.current.columns.find(c => c.id === "fechado")?.leads,
    ).toHaveLength(1);
  });

  it("bloqueia a transição direta para fechado e não altera o estado", () => {
    const { result } = renderHook(() => useKanbanBoard(seed()));
    const before = result.current.columns;

    let outcome: ReturnType<typeof result.current.moveLead> | undefined;
    act(() => {
      outcome = result.current.moveLead("L1", "novo_lead", "fechado");
    });

    expect(outcome?.success).toBe(false);
    if (outcome && !outcome.success) {
      expect(outcome.error).toMatch(/pular etapas/);
    }
    expect(result.current.columns).toBe(before);
  });

  it("setColumns substitui completamente o board (uso típico do fetch da API)", () => {
    const { result } = renderHook(() => useKanbanBoard(seed()));

    const next: TestColumn[] = [
      {
        id: "fechado",
        title: "Fechado",
        leads: [{ id: "X", stage: "fechado", name: "Carla" }],
      },
    ];

    act(() => {
      result.current.setColumns(next);
    });

    expect(result.current.columns).toEqual(next);
  });
});

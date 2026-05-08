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
    id: "contato_realizado",
    title: "Contato Realizado",
    leads: [],
  },
  {
    id: "em_negociacao",
    title: "Em Negociação",
    leads: [{ id: "L2", stage: "em_negociacao", name: "Bruno" }],
  },
  {
    id: "vendido",
    title: "Vendido",
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
      outcome = result.current.moveLead("L1", "novo_lead", "contato_realizado");
    });

    expect(outcome).toEqual({ success: true });
    expect(
      result.current.columns.find(c => c.id === "novo_lead")?.leads,
    ).toHaveLength(0);
    const dest = result.current.columns.find(c => c.id === "contato_realizado");
    expect(dest?.leads).toHaveLength(1);
    expect(dest?.leads[0]).toMatchObject({
      id: "L1",
      stage: "contato_realizado",
      name: "Ana",
    });
  });

  it("permite fechar o lead quando ele está em em_negociacao", () => {
    const { result } = renderHook(() => useKanbanBoard(seed()));

    let outcome: ReturnType<typeof result.current.moveLead> | undefined;
    act(() => {
      outcome = result.current.moveLead("L2", "em_negociacao", "vendido");
    });

    expect(outcome).toEqual({ success: true });
    expect(
      result.current.columns.find(c => c.id === "vendido")?.leads,
    ).toHaveLength(1);
  });

  it("bloqueia a transição direta para vendido e não altera o estado", () => {
    const { result } = renderHook(() => useKanbanBoard(seed()));
    const before = result.current.columns;

    let outcome: ReturnType<typeof result.current.moveLead> | undefined;
    act(() => {
      outcome = result.current.moveLead("L1", "novo_lead", "vendido");
    });

    expect(outcome?.success).toBe(false);
    if (outcome && !outcome.success) {
      expect(outcome.error).toMatch(/Em Negociação/);
    }
    expect(result.current.columns).toBe(before);
  });

  it("setColumns substitui completamente o board (uso típico do fetch da API)", () => {
    const { result } = renderHook(() => useKanbanBoard(seed()));

    const next: TestColumn[] = [
      {
        id: "vendido",
        title: "Vendido",
        leads: [{ id: "X", stage: "vendido", name: "Carla" }],
      },
    ];

    act(() => {
      result.current.setColumns(next);
    });

    expect(result.current.columns).toEqual(next);
  });
});

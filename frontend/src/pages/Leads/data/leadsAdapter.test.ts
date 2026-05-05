import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toLead, apiLeadsToColumns } from "./leadsAdapter";
import { ApiLead } from "../../../services/leadsApi";
import { KanbanCol } from "../types";

const TEMPLATE: KanbanCol[] = [
  { id: "novo_lead", title: "Novo Lead", totalValue: 0, headerColor: "#000", leads: [] },
  { id: "contato_realizado", title: "Contato Realizado", totalValue: 0, headerColor: "#000", leads: [] },
  { id: "em_negociacao", title: "Em Negociação", totalValue: 0, headerColor: "#000", leads: [] },
  { id: "vendido", title: "Vendido", totalValue: 0, headerColor: "#000", leads: [] },
];

const apiLead = (over: Partial<ApiLead> = {}): ApiLead => ({
  id: "abc-123",
  name: "Lead da API",
  phone: null,
  status: "novo_lead",
  origin: "site",
  createdAt: null,
  client: null,
  ...over,
});

describe("toLead", () => {
  it("usa o nome do client quando presente, senão o name do lead", () => {
    expect(
      toLead(apiLead({ client: { id: "c1", name: "Cliente Real" }, name: "Backup" })).name,
    ).toBe("Cliente Real");
    expect(toLead(apiLead({ name: "Só Nome" })).name).toBe("Só Nome");
    expect(
      toLead(apiLead({ name: null, client: null })).name,
    ).toBe("Sem nome");
  });

  it("mapeia status válido para a stage correspondente", () => {
    expect(toLead(apiLead({ status: "em_negociacao" })).stage).toBe("em_negociacao");
    expect(toLead(apiLead({ status: "vendido" })).stage).toBe("vendido");
  });

  it("usa novo_lead como default quando o status é desconhecido ou nulo", () => {
    expect(toLead(apiLead({ status: null })).stage).toBe("novo_lead");
    expect(toLead(apiLead({ status: "fora_do_funil" })).stage).toBe("novo_lead");
  });

  it("preenche o status legível compatível com a stage", () => {
    expect(toLead(apiLead({ status: "em_negociacao" })).status).toBe("Em Negociação");
    expect(toLead(apiLead({ status: "vendido" })).status).toBe("Vendido");
  });
});

describe("toLead.timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-05T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna string vazia quando createdAt é null", () => {
    expect(toLead(apiLead({ createdAt: null })).timeAgo).toBe("");
  });

  it('retorna "agora" para diferenças menores que um minuto', () => {
    expect(
      toLead(apiLead({ createdAt: "2026-05-05T11:59:30Z" })).timeAgo,
    ).toBe("agora");
  });

  it("retorna minutos para até uma hora atrás", () => {
    expect(
      toLead(apiLead({ createdAt: "2026-05-05T11:30:00Z" })).timeAgo,
    ).toBe("30min atrás");
  });

  it("retorna horas para até um dia atrás", () => {
    expect(
      toLead(apiLead({ createdAt: "2026-05-05T09:00:00Z" })).timeAgo,
    ).toBe("3h atrás");
  });

  it('retorna "Ontem" para exatamente 1 dia', () => {
    expect(
      toLead(apiLead({ createdAt: "2026-05-04T12:00:00Z" })).timeAgo,
    ).toBe("Ontem");
  });

  it("retorna dias para mais de 1 dia", () => {
    expect(
      toLead(apiLead({ createdAt: "2026-05-02T12:00:00Z" })).timeAgo,
    ).toBe("3d atrás");
  });
});

describe("apiLeadsToColumns", () => {
  it("retorna o template com colunas vazias quando a API retorna lista vazia", () => {
    const result = apiLeadsToColumns([], TEMPLATE);
    expect(result).toHaveLength(TEMPLATE.length);
    for (const col of result) {
      expect(col.leads).toHaveLength(0);
      expect(col.totalValue).toBe(0);
    }
  });

  it("agrupa leads pela stage correspondente", () => {
    const apiLeads: ApiLead[] = [
      apiLead({ id: "1", status: "novo_lead" }),
      apiLead({ id: "2", status: "novo_lead" }),
      apiLead({ id: "3", status: "em_negociacao" }),
    ];

    const result = apiLeadsToColumns(apiLeads, TEMPLATE);
    expect(result.find(c => c.id === "novo_lead")?.leads).toHaveLength(2);
    expect(result.find(c => c.id === "em_negociacao")?.leads).toHaveLength(1);
    expect(result.find(c => c.id === "vendido")?.leads).toHaveLength(0);
  });

  it("preserva os metadados do template (title, headerColor)", () => {
    const customTemplate: KanbanCol[] = [
      { id: "novo_lead", title: "Custom Title", totalValue: 999, headerColor: "#abc", leads: [] },
    ];
    const result = apiLeadsToColumns([apiLead()], customTemplate);
    expect(result[0].title).toBe("Custom Title");
    expect(result[0].headerColor).toBe("#abc");
  });

  it("recalcula totalValue a partir dos leads (no nosso fluxo, sempre 0 vindo da API)", () => {
    const apiLeads: ApiLead[] = [apiLead({ id: "1" }), apiLead({ id: "2" })];
    const result = apiLeadsToColumns(apiLeads, TEMPLATE);
    for (const col of result) {
      expect(col.totalValue).toBe(0);
    }
  });

  it("ignora stages desconhecidas mandando o lead para novo_lead", () => {
    const apiLeads: ApiLead[] = [apiLead({ id: "1", status: "stage_inexistente" })];
    const result = apiLeadsToColumns(apiLeads, TEMPLATE);
    expect(result.find(c => c.id === "novo_lead")?.leads).toHaveLength(1);
  });
});

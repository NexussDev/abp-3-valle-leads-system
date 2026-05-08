import { describe, it, expect, beforeEach, vi } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../../infrastructure/repositories/LeadRepository", () => ({
  default: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByTeamId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import leadRepository from "../../infrastructure/repositories/LeadRepository";
import leadRoutes from "./leadRoutes";
import { errorHandler } from "../../infrastructure/middleware/errorHandler";

const mockedRepo = leadRepository as unknown as Record<
  string,
  ReturnType<typeof vi.fn>
>;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/leads", leadRoutes);
  app.use(errorHandler);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /leads", () => {
  it("retorna 400 quando origin está faltando", async () => {
    const app = buildApp();
    const res = await request(app).post("/leads").send({
      clientId: "c",
      userId: "u",
      teamId: "t",
      storeId: "s",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/origin/);
    expect(mockedRepo.create).not.toHaveBeenCalled();
  });

  it("retorna 400 quando o body está vazio (req.body undefined seria 500 sem o ?? {})", async () => {
    const app = buildApp();
    const res = await request(app).post("/leads");
    expect(res.status).toBe(400);
  });

  it("retorna 201 quando o body é válido", async () => {
    mockedRepo.create.mockResolvedValueOnce({
      id: "lead-uuid",
      origin: "site",
    });
    const app = buildApp();

    const res = await request(app).post("/leads").send({
      origin: "site",
      clientId: "c",
      userId: "u",
      teamId: "t",
      storeId: "s",
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe("lead-uuid");
  });
});

describe("PATCH /leads/:id/stage", () => {
  it("retorna 400 para stage desconhecida", async () => {
    const app = buildApp();
    const res = await request(app)
      .patch("/leads/lead-uuid/stage")
      .send({ stage: "fora_do_funil" });
    expect(res.status).toBe(400);
  });

  it("retorna 404 quando o lead não existe", async () => {
    mockedRepo.findById.mockResolvedValueOnce(null);
    const app = buildApp();
    const res = await request(app)
      .patch("/leads/nope/stage")
      .send({ stage: "contato_realizado" });
    expect(res.status).toBe(404);
  });

  it("retorna 422 quando tenta fechar lead que não está em em_negociacao", async () => {
    mockedRepo.findById.mockResolvedValueOnce({
      id: "lead-uuid",
      status: "novo_lead",
    });
    const app = buildApp();
    const res = await request(app)
      .patch("/leads/lead-uuid/stage")
      .send({ stage: "vendido" });

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/Em Negociação/);
    expect(mockedRepo.update).not.toHaveBeenCalled();
  });

  it("retorna 200 e atualiza quando o fechamento é válido", async () => {
    mockedRepo.findById.mockResolvedValueOnce({
      id: "lead-uuid",
      status: "em_negociacao",
    });
    mockedRepo.update.mockResolvedValueOnce({
      id: "lead-uuid",
      status: "vendido",
    });
    const app = buildApp();

    const res = await request(app)
      .patch("/leads/lead-uuid/stage")
      .send({ stage: "vendido" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("vendido");
    expect(mockedRepo.update).toHaveBeenCalledWith("lead-uuid", {
      status: "vendido",
    });
  });
});

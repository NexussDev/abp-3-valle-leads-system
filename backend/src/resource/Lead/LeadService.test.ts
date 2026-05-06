import { describe, it, expect, beforeEach, vi } from "vitest";
import { AppError } from "../../shared/errors/AppError";

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
import leadService from "./LeadService";

const mockedRepo = leadRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;

const validCreateData = {
  origin: "site",
  clientId: "client-uuid",
  userId: "user-uuid",
  teamId: "team-uuid",
  storeId: "store-uuid",
};

const fakeLead = (over: Record<string, unknown> = {}) => ({
  id: "lead-uuid",
  status: null,
  origin: "site",
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LeadService.create", () => {
  it("rejeita quando origin está ausente", async () => {
    await expect(
      leadService.create({ ...validCreateData, origin: "" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("origin"),
    });
    expect(mockedRepo.create).not.toHaveBeenCalled();
  });

  it("rejeita quando clientId está só com espaços", async () => {
    await expect(
      leadService.create({ ...validCreateData, clientId: "   " }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockedRepo.create).not.toHaveBeenCalled();
  });

  it.each(["userId", "teamId", "storeId"] as const)(
    "rejeita quando %s está vazio",
    async field => {
      await expect(
        leadService.create({ ...validCreateData, [field]: "" }),
      ).rejects.toBeInstanceOf(AppError);
    },
  );

  it("repassa para o repositório quando todos os campos obrigatórios estão presentes", async () => {
    mockedRepo.create.mockResolvedValueOnce(fakeLead());

    const result = await leadService.create(validCreateData);

    expect(mockedRepo.create).toHaveBeenCalledTimes(1);
    expect(mockedRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: "site",
        client: { connect: { id: "client-uuid" } },
        user: { connect: { id: "user-uuid" } },
        team: { connect: { id: "team-uuid" } },
        store: { connect: { id: "store-uuid" } },
      }),
    );
    expect(result).toMatchObject({ id: "lead-uuid" });
  });

  it("aceita name e phone opcionais e os repassa para o repositório", async () => {
    mockedRepo.create.mockResolvedValueOnce(fakeLead());

    await leadService.create({
      ...validCreateData,
      name: "Cliente X",
      phone: "11999999999",
    });

    expect(mockedRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Cliente X", phone: "11999999999" }),
    );
  });
});

describe("LeadService.updateStage", () => {
  it("rejeita stage inválida com 400 e não toca no banco", async () => {
    await expect(
      leadService.updateStage("lead-uuid", "fechadissimo"),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("fechadissimo"),
    });
    expect(mockedRepo.findById).not.toHaveBeenCalled();
    expect(mockedRepo.update).not.toHaveBeenCalled();
  });

  it("rejeita quando o lead não existe (findById retorna null)", async () => {
    mockedRepo.findById.mockResolvedValueOnce(null);

    await expect(
      leadService.updateStage("nope", "contato_realizado"),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(mockedRepo.update).not.toHaveBeenCalled();
  });

  it("bloqueia o fechamento (422) quando o lead não está em em_negociacao", async () => {
    mockedRepo.findById.mockResolvedValueOnce(
      fakeLead({ status: "novo_lead" }),
    );

    await expect(
      leadService.updateStage("lead-uuid", "vendido"),
    ).rejects.toMatchObject({
      statusCode: 422,
      message: expect.stringContaining("Em Negociação"),
    });
    expect(mockedRepo.update).not.toHaveBeenCalled();
  });

  it("permite fechar quando o lead está em em_negociacao", async () => {
    mockedRepo.findById.mockResolvedValueOnce(
      fakeLead({ status: "em_negociacao" }),
    );
    mockedRepo.update.mockResolvedValueOnce(
      fakeLead({ status: "vendido" }),
    );

    const result = await leadService.updateStage("lead-uuid", "vendido");

    expect(mockedRepo.update).toHaveBeenCalledWith("lead-uuid", {
      status: "vendido",
    });
    expect(result).toMatchObject({ status: "vendido" });
  });

  it("permite transições intermediárias (não-fechamento) sem restrição", async () => {
    mockedRepo.findById.mockResolvedValueOnce(
      fakeLead({ status: "novo_lead" }),
    );
    mockedRepo.update.mockResolvedValueOnce(
      fakeLead({ status: "contato_realizado" }),
    );

    await leadService.updateStage("lead-uuid", "contato_realizado");

    expect(mockedRepo.update).toHaveBeenCalledWith("lead-uuid", {
      status: "contato_realizado",
    });
  });
});

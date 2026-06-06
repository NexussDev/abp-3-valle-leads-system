jest.mock('../infrastructure/database/prisma', () => ({
  __esModule: true,
  default: {
    team: { findFirst: jest.fn() },
    store: { findFirst: jest.fn() },
    user: { findFirst: jest.fn() },
    client: { create: jest.fn() },
    lead: { create: jest.fn() },
    negotiation: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import prisma from '../infrastructure/database/prisma';
import publicLeadService from '../application/services/PublicLeadService';
import { AppError } from '../shared/errors/AppError';

const prismaMock = prisma as unknown as {
  team: { findFirst: jest.Mock };
  store: { findFirst: jest.Mock };
  user: { findFirst: jest.Mock };
  client: { create: jest.Mock };
  lead: { create: jest.Mock };
  negotiation: { create: jest.Mock };
  $transaction: jest.Mock;
};

async function captureError(p: Promise<unknown>): Promise<AppError | undefined> {
  try { await p; } catch (e) { return e as AppError; }
  return undefined;
}

const team = { id: 'team-1', name: 'Equipe' };
const store = { id: 'store-1', name: 'Loja' };
const atendente = { id: 'atendente-1', role: 'ATENDENTE', teamId: 'team-1' };

function wireHappyPath() {
  prismaMock.team.findFirst.mockResolvedValue(team);
  prismaMock.store.findFirst.mockResolvedValue(store);
  prismaMock.user.findFirst.mockResolvedValue(atendente);

  // Simula a transação executando o callback com um "tx" que reflete o prisma
  prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => any) => fn(prismaMock));

  prismaMock.client.create.mockResolvedValue({ id: 'client-1', name: 'Teo' });
  prismaMock.lead.create.mockResolvedValue({
    id: 'lead-1',
    name: 'Teo - HR-V',
    status: 'novo_lead',
    origin: 'Site',
  });
  prismaMock.negotiation.create.mockResolvedValue({ id: 'neg-1' });
}

describe('PublicLeadService.registerLead', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('validação de entrada', () => {
    it('rejeita nome ausente com 400', async () => {
      const err = await captureError(
        publicLeadService.registerLead({ nome: '', whatsapp: '11999999999' } as any),
      );
      expect(err?.statusCode).toBe(400);
      expect(prismaMock.team.findFirst).not.toHaveBeenCalled();
    });

    it('rejeita whatsapp ausente com 400', async () => {
      const err = await captureError(
        publicLeadService.registerLead({ nome: 'Teo', whatsapp: '   ' } as any),
      );
      expect(err?.statusCode).toBe(400);
    });
  });

  describe('configuração do sistema', () => {
    it('retorna 503 quando não há equipe configurada', async () => {
      prismaMock.team.findFirst.mockResolvedValue(null);
      prismaMock.store.findFirst.mockResolvedValue(store);

      const err = await captureError(
        publicLeadService.registerLead({ nome: 'Teo', whatsapp: '11999999999' }),
      );
      expect(err?.statusCode).toBe(503);
    });

    it('retorna 503 quando não há atendente disponível', async () => {
      prismaMock.team.findFirst.mockResolvedValue(team);
      prismaMock.store.findFirst.mockResolvedValue(store);
      prismaMock.user.findFirst.mockResolvedValue(null);

      const err = await captureError(
        publicLeadService.registerLead({ nome: 'Teo', whatsapp: '11999999999' }),
      );
      expect(err?.statusCode).toBe(503);
    });
  });

  describe('caminho feliz — persistência real', () => {
    beforeEach(wireHappyPath);

    it('cria cliente, lead e negociação dentro de transação', async () => {
      await publicLeadService.registerLead({
        nome: ' Teo ',
        whatsapp: '11999999999',
        veiculo: 'HR-V',
        origem: 'instagram',
      });

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.client.create).toHaveBeenCalledWith({
        data: { name: 'Teo', phone: '11999999999' },
      });
      expect(prismaMock.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Teo - HR-V',
            phone: '11999999999',
            status: 'novo_lead',
            origin: 'Instagram',
            userId: 'atendente-1',
            teamId: 'team-1',
            storeId: 'store-1',
            clientId: 'client-1',
          }),
        }),
      );
      expect(prismaMock.negotiation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          leadId: 'lead-1',
          status: 'aberta',
          stage: 'novo_lead',
          importance: 'morno',
          active: true,
        }),
      });
    });

    it('default origin = Site quando origem não é informada', async () => {
      await publicLeadService.registerLead({ nome: 'Teo', whatsapp: '11999999999' });
      expect(prismaMock.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ origin: 'Site' }),
        }),
      );
    });

    it('origem inválida cai para Site (whitelist)', async () => {
      await publicLeadService.registerLead({
        nome: 'Teo',
        whatsapp: '11999999999',
        origem: 'tiktok-xpto',
      });
      expect(prismaMock.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ origin: 'Site' }),
        }),
      );
    });

    it('lead.name omite "- veiculo" quando veiculo não é informado', async () => {
      await publicLeadService.registerLead({ nome: 'Teo', whatsapp: '11999999999' });
      expect(prismaMock.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Teo' }),
        }),
      );
    });
  });
});

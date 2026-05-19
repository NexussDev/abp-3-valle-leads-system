jest.mock('../infrastructure/repositories/NegotiationRepository');

import negotiationRepo from '../infrastructure/repositories/NegotiationRepository';
import negotiationService from '../application/services/NegotiationService';

const mockRepo = negotiationRepo as jest.Mocked<typeof negotiationRepo>;

const mockNegotiation = {
  id: 'neg-1',
  leadId: 'lead-1',
  status: 'aberta',
  stage: 'novo_lead',
  importance: 'morno',
  active: true,
  createdAt: new Date(),
  history: [],
};

describe('NegotiationService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve lançar erro se negociação já existe', async () => {
      mockRepo.findByLeadId.mockResolvedValue(mockNegotiation as any);
      await expect(negotiationService.create('lead-1', {})).rejects.toThrow(
        'Negociação já existe para este lead'
      );
    });

    it('deve criar com defaults quando dados não fornecidos', async () => {
      mockRepo.findByLeadId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockNegotiation as any);
      await negotiationService.create('lead-1', {});
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'aberta', stage: 'novo_lead', importance: 'morno', active: true })
      );
    });
  });

  describe('update', () => {
    it('deve lançar erro se negociação não existe', async () => {
      mockRepo.findByLeadId.mockResolvedValue(null);
      await expect(negotiationService.update('lead-x', { status: 'em_andamento' })).rejects.toThrow(
        'Negociação não encontrada'
      );
    });

    it('deve registrar histórico quando status muda', async () => {
      mockRepo.findByLeadId.mockResolvedValue(mockNegotiation as any);
      mockRepo.update.mockResolvedValue({ ...mockNegotiation, status: 'em_andamento' } as any);
      mockRepo.createHistory.mockResolvedValue({} as any);
      await negotiationService.update('lead-1', { status: 'em_andamento' });
      expect(mockRepo.createHistory).toHaveBeenCalledWith(
        expect.objectContaining({ oldStatus: 'aberta', newStatus: 'em_andamento' })
      );
    });

    it('não deve registrar histórico quando apenas importance muda', async () => {
      mockRepo.findByLeadId.mockResolvedValue(mockNegotiation as any);
      mockRepo.update.mockResolvedValue(mockNegotiation as any);
      await negotiationService.update('lead-1', { importance: 'quente' });
      expect(mockRepo.createHistory).not.toHaveBeenCalled();
    });
  });
});

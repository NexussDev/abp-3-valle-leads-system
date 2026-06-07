import negotiationRepository from '../../infrastructure/repositories/NegotiationRepository';
import { AppError } from '../../shared/errors/AppError';

const CLOSING_STATUSES = ['fechado', 'perdido', 'cancelado'];

class NegotiationService {
  async findByLeadId(leadId: string) {
    const negotiation = await negotiationRepository.findByLeadId(leadId);
    if (!negotiation) throw new AppError('Negociação não encontrada', 404);
    return negotiation;
  }

  async create(leadId: string, data: { status?: string; stage?: string; importance?: string }) {
    // Regra: apenas 1 negociação ativa por lead
    const existing = await negotiationRepository.findByLeadId(leadId);
    if (existing && existing.active) {
      throw new AppError('Já existe uma negociação ativa para este lead', 409);
    }

    return negotiationRepository.create({
      lead: { connect: { id: leadId } },
      status: data.status ?? 'aberta',
      stage: data.stage ?? 'novo_lead',
      importance: data.importance ?? 'morno',
      active: true,
    });
  }

  async update(
    leadId: string,
    data: {
      status?: string;
      stage?: string;
      importance?: string;
      closingReason?: string;
    },
  ) {
    const existing = await negotiationRepository.findByLeadId(leadId);
    if (!existing) throw new AppError('Negociação não encontrada', 404);

    // Regra: closingReason obrigatório ao fechar a negociação
    const isClosing = data.status && CLOSING_STATUSES.includes(data.status);
    if (isClosing && !data.closingReason?.trim()) {
      throw new AppError('O motivo de fechamento (closingReason) é obrigatório ao encerrar uma negociação', 422);
    }

    const historyPayload: {
      oldStatus?: string | null;
      newStatus?: string;
      oldStage?: string | null;
      newStage?: string;
    } = {};

    if (data.status && data.status !== existing.status) {
      historyPayload.oldStatus = existing.status;
      historyPayload.newStatus = data.status;
    }

    // Registrar NegotiationHistory ao avançar de estágio
    if (data.stage && data.stage !== existing.stage) {
      historyPayload.oldStage = existing.stage;
      historyPayload.newStage = data.stage;
    }

    const updated = await negotiationRepository.update(existing.id, {
      ...(data.status     && { status: data.status }),
      ...(data.stage      && { stage: data.stage }),
      ...(data.importance && { importance: data.importance }),
      // Marcar negociação como inativa ao fechar
      ...(isClosing       && { active: false }),
    });

    // Persistir histórico sempre que status ou estágio mudar
    if (historyPayload.oldStatus !== undefined || historyPayload.oldStage !== undefined) {
      await negotiationRepository.createHistory({
        negotiation: { connect: { id: existing.id } },
        ...historyPayload,
      });
    }

    return updated;
  }
}

export default new NegotiationService();
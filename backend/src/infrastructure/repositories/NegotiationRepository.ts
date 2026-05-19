import prisma from '../database/prisma';
import { Prisma } from '@prisma/client';

class NegotiationRepository {
  async findByLeadId(leadId: string) {
    return prisma.negotiation.findUnique({
      where: { leadId },
      include: {
        history: { orderBy: { changedAt: 'desc' } },
      },
    });
  }

  async create(data: Prisma.NegotiationCreateInput) {
    return prisma.negotiation.create({ data });
  }

  async update(id: string, data: Prisma.NegotiationUpdateInput) {
    return prisma.negotiation.update({ where: { id }, data });
  }

  async createHistory(data: Prisma.NegotiationHistoryCreateInput) {
    return prisma.negotiationHistory.create({ data });
  }
}

export default new NegotiationRepository();

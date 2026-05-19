import prisma from '../database/prisma';
import { Lead, Prisma } from '@prisma/client';

const LEAD_INCLUDE = {
  client: true,
  user: { select: { id: true, name: true, email: true, role: true } },
  team: true,
  store: true,
  negotiation: true,
};

export interface LeadFilter {
  userId?: string;
  teamId?: string;
  startDate?: Date;
  endDate?: Date;
}

class LeadRepository {
  async findAll(filter: LeadFilter = {}): Promise<Lead[]> {
    const where: Prisma.LeadWhereInput = {};
    if (filter.userId) where.userId = filter.userId;
    if (filter.teamId) where.teamId = filter.teamId;
    if (filter.startDate || filter.endDate) {
      where.createdAt = {
        ...(filter.startDate && { gte: filter.startDate }),
        ...(filter.endDate && { lte: filter.endDate }),
      };
    }
    return prisma.lead.findMany({ where, include: LEAD_INCLUDE });
  }

  async findById(id: string): Promise<Lead | null> {
    return prisma.lead.findUnique({ where: { id }, include: LEAD_INCLUDE });
  }

  async findByUserId(userId: string): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: { userId },
      include: { client: true, store: true, negotiation: true },
    });
  }

  async findByTeamId(teamId: string): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: { teamId },
      include: LEAD_INCLUDE,
    });
  }

  async create(data: Prisma.LeadCreateInput): Promise<Lead> {
    return prisma.lead.create({ data });
  }

  async update(id: string, data: Prisma.LeadUpdateInput): Promise<Lead> {
    return prisma.lead.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Lead> {
    return prisma.lead.delete({ where: { id } });
  }
}

export default new LeadRepository();

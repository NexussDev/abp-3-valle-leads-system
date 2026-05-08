import prisma from '../database/prisma';
import { Lead, Prisma } from '@prisma/client';

class LeadRepository {
  async findAll(): Promise<Lead[]> {
    return prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
      }
    });
  }

  async findById(id: string): Promise<Lead | null> {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        client: true,
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        team: true,
        store: true,
        negotiation: true,
      }
    });
  }

  async findByUserId(userId: string): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: { userId },
      include: {
        client: true,
        store: true,
        negotiation: true,
      }
    });
  }

  async findByTeamId(teamId: string): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: { teamId },
      include: {
        client: true,
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        store: true,
        negotiation: true,
      }
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

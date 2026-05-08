import prisma from '../database/prisma';
import { LeadSource } from '@prisma/client';

class LeadSourceRepository {
  async findAll(): Promise<LeadSource[]> {
    return prisma.leadSource.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<LeadSource | null> {
    return prisma.leadSource.findUnique({ where: { id } });
  }

  async create(data: { name: string }): Promise<LeadSource> {
    return prisma.leadSource.create({ data });
  }

  async update(id: string, data: { name: string }): Promise<LeadSource> {
    return prisma.leadSource.update({ where: { id }, data });
  }

  async delete(id: string): Promise<LeadSource> {
    return prisma.leadSource.delete({ where: { id } });
  }
}

export default new LeadSourceRepository();
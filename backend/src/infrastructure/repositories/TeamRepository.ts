import prisma from '../database/prisma';
import { Team, Prisma } from '@prisma/client';

class TeamRepository {
  async findAll(): Promise<Team[]> {
    return prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { users: true, leads: true } } },
    });
  }

  async findById(id: string): Promise<Team | null> {
    return prisma.team.findUnique({
      where: { id },
      include: { users: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async create(data: Prisma.TeamCreateInput): Promise<Team> {
    return prisma.team.create({ data });
  }

  async update(id: string, data: Prisma.TeamUpdateInput): Promise<Team> {
    return prisma.team.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Team> {
    return prisma.team.delete({ where: { id } });
  }
}

export default new TeamRepository();

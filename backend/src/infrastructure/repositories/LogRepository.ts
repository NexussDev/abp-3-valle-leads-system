import prisma from '../database/prisma';

class LogRepository {
  async create(data: { userId: string; action: string; entity: string; entityId?: string }) {
    return prisma.systemLog.create({ data });
  }

  async findAll(options: { limit?: number; offset?: number } = {}) {
    return prisma.systemLog.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit ?? 100,
      skip: options.offset ?? 0,
    });
  }

  async count() {
    return prisma.systemLog.count();
  }
}

export default new LogRepository();

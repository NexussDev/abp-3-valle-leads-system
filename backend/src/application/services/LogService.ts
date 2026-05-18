import logRepository from '../../infrastructure/repositories/LogRepository';

class LogService {
  async log(userId: string, action: string, entity: string, entityId?: string): Promise<void> {
    try {
      await logRepository.create({ userId, action, entity, entityId });
    } catch {
      // Silent — log failure must never break the main operation
    }
  }

  async findAll(options: { limit?: number; offset?: number } = {}) {
    const [logs, total] = await Promise.all([
      logRepository.findAll(options),
      logRepository.count(),
    ]);
    return { logs, total };
  }
}

export default new LogService();

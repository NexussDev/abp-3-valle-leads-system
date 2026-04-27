import leadSourceRepository from '../../infrastructure/repositories/LeadSourceRepository';
import { AppError } from '../../shared/errors/AppError';
import { LeadSource } from '@prisma/client';

class LeadSourceService {
  async findAll(): Promise<LeadSource[]> {
    return leadSourceRepository.findAll();
  }

  async findById(id: string): Promise<LeadSource> {
    const source = await leadSourceRepository.findById(id);
    if (!source) {
      throw new AppError('Origem não encontrada', 404);
    }
    return source;
  }

  async create(data: { name: string }): Promise<LeadSource> {
    if (!data.name?.trim()) {
      throw new AppError('Nome da origem é obrigatório', 400);
    }
    return leadSourceRepository.create({ name: data.name.trim() });
  }

  async update(id: string, data: { name: string }): Promise<LeadSource> {
    await this.findById(id);
    if (!data.name?.trim()) {
      throw new AppError('Nome da origem é obrigatório', 400);
    }
    return leadSourceRepository.update(id, { name: data.name.trim() });
  }

  async delete(id: string): Promise<LeadSource> {
    await this.findById(id);
    return leadSourceRepository.delete(id);
  }
}

export default new LeadSourceService();
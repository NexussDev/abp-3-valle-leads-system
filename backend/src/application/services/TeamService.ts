import teamRepository from '../../infrastructure/repositories/TeamRepository';
import { AppError } from '../../shared/errors/AppError';
import { Team, Prisma } from '@prisma/client';

class TeamService {
  async findAll(): Promise<Team[]> {
    return teamRepository.findAll();
  }

  async findById(id: string): Promise<Team> {
    const team = await teamRepository.findById(id);
    if (!team) throw new AppError('Equipe não encontrada', 404);
    return team;
  }

  async create(data: { name: string }): Promise<Team> {
    if (!data.name?.trim()) throw new AppError('Nome da equipe é obrigatório', 400);
    return teamRepository.create({ name: data.name.trim() });
  }

  async update(id: string, data: Prisma.TeamUpdateInput): Promise<Team> {
    await this.findById(id);
    return teamRepository.update(id, data);
  }

  async delete(id: string): Promise<Team> {
    await this.findById(id);
    return teamRepository.delete(id);
  }
}

export default new TeamService();

import prisma from '../database/prisma';
import { Client, Prisma } from '@prisma/client';

class ClientRepository {
  async findAll(): Promise<Client[]> {
    return prisma.client.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { id } });
  }

  async findByCpf(cpf: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { cpf } });
  }

  async create(data: Prisma.ClientCreateInput): Promise<Client> {
    return prisma.client.create({ data });
  }

  async update(id: string, data: Prisma.ClientUpdateInput): Promise<Client> {
    return prisma.client.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Client> {
    return prisma.client.delete({ where: { id } });
  }
}

export default new ClientRepository();

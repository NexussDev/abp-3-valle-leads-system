import clientRepository from '../../infrastructure/repositories/ClientRepository';
import { AppError } from '../../shared/errors/AppError';
import { Client, Prisma } from '@prisma/client';

class ClientService {
  async findAll(): Promise<Client[]> {
    return clientRepository.findAll();
  }

  async findById(id: string): Promise<Client> {
    const client = await clientRepository.findById(id);
    if (!client) throw new AppError('Cliente não encontrado', 404);
    return client;
  }

  async create(data: { name: string; cpf?: string; email?: string; phone?: string }): Promise<Client> {
    if (!data.name?.trim()) throw new AppError('Nome do cliente é obrigatório', 400);

    if (data.cpf) {
      const existing = await clientRepository.findByCpf(data.cpf);
      if (existing) throw new AppError('CPF já cadastrado', 409);
    }

    return clientRepository.create({
      name: data.name.trim(),
      ...(data.cpf && { cpf: data.cpf }),
      ...(data.email && { email: data.email }),
      ...(data.phone && { phone: data.phone }),
    });
  }

  async update(id: string, data: Prisma.ClientUpdateInput): Promise<Client> {
    await this.findById(id);
    return clientRepository.update(id, data);
  }

  async delete(id: string): Promise<Client> {
    await this.findById(id);
    return clientRepository.delete(id);
  }
}

export default new ClientService();

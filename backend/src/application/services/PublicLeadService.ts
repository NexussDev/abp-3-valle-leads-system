import prisma from '../../infrastructure/database/prisma';
import { AppError } from '../../shared/errors/AppError';

interface ClientLeadInput {
  nome: string;
  whatsapp: string;
  cidade: string;
  veiculo: string;
}

class PublicLeadService {
  async registerLead(data: ClientLeadInput) {
    if (!data.nome || !data.whatsapp) {
      throw new AppError('Nome e WhatsApp são obrigatórios', 400);
    }

    // Buscar equipe e loja padrão (primeira disponível)
    const team = await prisma.team.findFirst();
    const store = await prisma.store.findFirst();

    if (!team || !store) {
      throw new AppError('Sistema não configurado. Contate o administrador.', 500);
    }

    // Buscar um atendente disponível na equipe
    const atendente = await prisma.user.findFirst({
      where: { role: 'ATENDENTE', teamId: team.id },
    });

    if (!atendente) {
      throw new AppError('Nenhum atendente disponível no momento.', 500);
    }

    // Criar cliente
    const client = await prisma.client.create({
      data: {
        name: data.nome,
        phone: data.whatsapp,
      },
    });

    // Criar lead
    const lead = await prisma.lead.create({
      data: {
        name: `${data.nome} - ${data.veiculo}`,
        phone: data.whatsapp,
        status: 'novo_lead',
        origin: 'Site',
        userId: atendente.id,
        teamId: team.id,
        storeId: store.id,
        clientId: client.id,
      },
      include: {
        client: true,
        user: { select: { id: true, name: true } },
        team: true,
      },
    });

    // Criar negociação inicial
    await prisma.negotiation.create({
      data: {
        leadId: lead.id,
        status: 'aberta',
        stage: 'novo_lead',
        importance: 'morno',
        active: true,
      },
    });

    return lead;
  }
}

export default new PublicLeadService();

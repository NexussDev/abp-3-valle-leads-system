import prisma from '../../infrastructure/database/prisma';
import { AppError } from '../../shared/errors/AppError';

export interface ClientLeadInput {
  nome: string;
  whatsapp: string;
  cidade?: string;
  veiculo?: string;
  origem?: string;
}

const ALLOWED_ORIGINS = new Set([
  'Site',
  'Instagram',
  'WhatsApp',
  'Facebook',
  'Outros',
]);

class PublicLeadService {
  async registerLead(data: ClientLeadInput) {
    if (!data.nome?.trim() || !data.whatsapp?.trim()) {
      throw new AppError('Nome e WhatsApp são obrigatórios', 400);
    }

    const origin = normalizeOrigin(data.origem);

    // Distribuição: pegamos um atendente que já tenha equipe E loja vinculadas
    // e usamos os IDs dele. Buscar team e store separadamente era frágil —
    // o findFirst da team retornava qualquer equipe (mesmo as sem atendente),
    // resultando em 503 mesmo com atendentes disponíveis em outros times.
    // TODO(distribuição): substituir por round-robin quando o cadastro crescer.
    const atendente = await prisma.user.findFirst({
      where: {
        role: 'ATENDENTE',
        teamId: { not: null },
        storeId: { not: null },
      },
      orderBy: { id: 'asc' },
    });

    if (!atendente) {
      throw new AppError(
        'Nenhum atendente disponível no momento. Contate o administrador.',
        503,
      );
    }

    const teamId = atendente.teamId!;
    const storeId = atendente.storeId!;

    // Cria cliente + lead + negociação inicial dentro de uma transação,
    // garantindo que o estado fique consistente mesmo se algo falhar.
    return prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          name: data.nome.trim(),
          phone: data.whatsapp.trim(),
        },
      });

      const leadName = data.veiculo?.trim()
        ? `${data.nome.trim()} - ${data.veiculo.trim()}`
        : data.nome.trim();

      const lead = await tx.lead.create({
        data: {
          name: leadName,
          phone: data.whatsapp.trim(),
          status: 'novo_lead',
          origin,
          userId: atendente.id,
          teamId,
          storeId,
          clientId: client.id,
        },
        include: {
          client: true,
          user: { select: { id: true, name: true } },
          team: true,
        },
      });

      await tx.negotiation.create({
        data: {
          leadId: lead.id,
          status: 'aberta',
          stage: 'novo_lead',
          importance: 'morno',
          active: true,
        },
      });

      return lead;
    });
  }
}

function normalizeOrigin(raw?: string): string {
  if (!raw) return 'Site';
  const lookup: Record<string, string> = {
    site: 'Site',
    instagram: 'Instagram',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    indicacao: 'Outros',
    'indicação': 'Outros',
    outros: 'Outros',
    outro: 'Outros',
  };
  const normalized = lookup[raw.trim().toLowerCase()] ?? raw.trim();
  return ALLOWED_ORIGINS.has(normalized) ? normalized : 'Site';
}

export default new PublicLeadService();

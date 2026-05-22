import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('[seed] Dados já existem, pulando seed.');
    return;
  }

  console.log('[seed] Populando banco de dados...');

  // Teams
  const equipeNorte = await prisma.team.create({ data: { name: 'Equipe Norte' } });
  const equipeSul   = await prisma.team.create({ data: { name: 'Equipe Sul'   } });

  // Store
  const lojaCentral = await prisma.store.create({ data: { name: 'Loja Central' } });

  const senhaHash = await bcrypt.hash('123456', 10);

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: 'Gabrielly Neu',
      email: 'admin@1000valle.com',
      password: senhaHash,
      role: 'ADMIN',
      teamId: equipeNorte.id,
      storeId: lojaCentral.id,
    },
  });

  const pedro = await prisma.user.create({
    data: {
      name: 'Pedro Silva',
      email: 'pedro@1000valle.com',
      password: senhaHash,
      role: 'LIDER_EQUIPE',
      teamId: equipeNorte.id,
      storeId: lojaCentral.id,
    },
  });

  const maria = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@1000valle.com',
      password: senhaHash,
      role: 'GERENTE',
      teamId: equipeNorte.id,
      storeId: lojaCentral.id,
    },
  });

  const joao = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@1000valle.com',
      password: senhaHash,
      role: 'ATENDENTE',
      teamId: equipeNorte.id,
      storeId: lojaCentral.id,
    },
  });

  const carlos = await prisma.user.create({
    data: {
      name: 'Carlos Oliveira',
      email: 'carlos@1000valle.com',
      password: senhaHash,
      role: 'ATENDENTE',
      teamId: equipeSul.id,
      storeId: lojaCentral.id,
    },
  });

  // ── Clients ────────────────────────────────────────────────────────────────
  const clients = await Promise.all([
    prisma.client.create({ data: { name: 'Ana Souza',    cpf: '111.111.111-11', email: 'ana@email.com',    phone: '(11) 99999-1111' } }),
    prisma.client.create({ data: { name: 'Bruno Lima',   cpf: '222.222.222-22', email: 'bruno@email.com',  phone: '(11) 99999-2222' } }),
    prisma.client.create({ data: { name: 'Carla Mendes', cpf: '333.333.333-33', email: 'carla@email.com',  phone: '(11) 99999-3333' } }),
    prisma.client.create({ data: { name: 'Diego Ramos',  cpf: '444.444.444-44', email: 'diego@email.com',  phone: '(11) 99999-4444' } }),
    prisma.client.create({ data: { name: 'Elena Costa',  cpf: '555.555.555-55', email: 'elena@email.com',  phone: '(11) 99999-5555' } }),
    prisma.client.create({ data: { name: 'Fábio Nunes',  cpf: '666.666.666-66', email: 'fabio@email.com',  phone: '(11) 99999-6666' } }),
    prisma.client.create({ data: { name: 'Gabi Torres',  cpf: '777.777.777-77', email: 'gabi@email.com',   phone: '(11) 99999-7777' } }),
    prisma.client.create({ data: { name: 'Hugo Alves',   cpf: '888.888.888-88', email: 'hugo@email.com',   phone: '(11) 99999-8888' } }),
    prisma.client.create({ data: { name: 'Iris Pinto',   cpf: '999.999.999-99', email: 'iris@email.com',   phone: '(11) 99999-9999' } }),
    prisma.client.create({ data: { name: 'Jonas Melo',   cpf: '100.100.100-10', email: 'jonas@email.com',  phone: '(11) 98888-0000' } }),
  ]);

  // ── Cars ───────────────────────────────────────────────────────────────────
  const cars = await Promise.all([
    prisma.car.create({ data: { brand: 'Toyota', model: 'Corolla', year: 2022, price: 95000, color: 'Prata',  plate: 'ABC1234' } }),
    prisma.car.create({ data: { brand: 'Honda',  model: 'Civic',   year: 2021, price: 90000, color: 'Preto',  plate: 'DEF5678' } }),
    prisma.car.create({ data: { brand: 'Ford',   model: 'Focus',   year: 2020, price: 70000, color: 'Branco', plate: 'GHI9012' } }),
    prisma.car.create({ data: { brand: 'VW',     model: 'Golf',    year: 2023, price: 115000, color: 'Azul',  plate: 'JKL3456' } }),
    prisma.car.create({ data: { brand: 'Jeep',   model: 'Compass', year: 2022, price: 145000, color: 'Cinza', plate: 'MNO7890' } }),
  ]);

  // ── Lead Sources ───────────────────────────────────────────────────────────
  const src = await Promise.all([
    prisma.leadSource.create({ data: { name: 'WhatsApp'    } }),
    prisma.leadSource.create({ data: { name: 'Instagram'   } }),
    prisma.leadSource.create({ data: { name: 'Telefone'    } }),
    prisma.leadSource.create({ data: { name: 'Loja Física' } }),
    prisma.leadSource.create({ data: { name: 'Site'        } }),
  ]);

  // ── Leads ──────────────────────────────────────────────────────────────────
  // João (ATENDENTE, Equipe Norte) — 5 leads variados
  const leadsJoao = await Promise.all([
    prisma.lead.create({ data: { name: 'Lead Ana',    phone: '(11) 99999-1111', status: 'novo_lead',  origin: 'WhatsApp',  userId: joao.id, teamId: equipeNorte.id, storeId: lojaCentral.id, clientId: clients[0].id, sourceId: src[0].id, carId: cars[0].id } }),
    prisma.lead.create({ data: { name: 'Lead Bruno',  phone: '(11) 99999-2222', status: 'negociacao', origin: 'Instagram', userId: joao.id, teamId: equipeNorte.id, storeId: lojaCentral.id, clientId: clients[1].id, sourceId: src[1].id, carId: cars[1].id } }),
    prisma.lead.create({ data: { name: 'Lead Diego',  phone: '(11) 99999-4444', status: 'contato',    origin: 'Site',      userId: joao.id, teamId: equipeNorte.id, storeId: lojaCentral.id, clientId: clients[3].id, sourceId: src[4].id, carId: cars[3].id } }),
    prisma.lead.create({ data: { name: 'Lead Elena',  phone: '(11) 99999-5555', status: 'proposta',   origin: 'WhatsApp',  userId: joao.id, teamId: equipeNorte.id, storeId: lojaCentral.id, clientId: clients[4].id, sourceId: src[0].id, carId: cars[4].id } }),
    prisma.lead.create({ data: { name: 'Lead Fábio',  phone: '(11) 99999-6666', status: 'fechado',    origin: 'Instagram', userId: joao.id, teamId: equipeNorte.id, storeId: lojaCentral.id, clientId: clients[5].id, sourceId: src[1].id, carId: cars[0].id } }),
  ]);

  // Carlos (ATENDENTE, Equipe Sul) — 4 leads
  const leadCarlos = await Promise.all([
    prisma.lead.create({ data: { name: 'Lead Carla',  phone: '(11) 99999-3333', status: 'fechado',    origin: 'Telefone',    userId: carlos.id, teamId: equipeSul.id, storeId: lojaCentral.id, clientId: clients[2].id, sourceId: src[2].id, carId: cars[2].id } }),
    prisma.lead.create({ data: { name: 'Lead Gabi',   phone: '(11) 99999-7777', status: 'negociacao', origin: 'Loja Física', userId: carlos.id, teamId: equipeSul.id, storeId: lojaCentral.id, clientId: clients[6].id, sourceId: src[3].id, carId: cars[1].id } }),
    prisma.lead.create({ data: { name: 'Lead Hugo',   phone: '(11) 99999-8888', status: 'novo_lead',  origin: 'WhatsApp',    userId: carlos.id, teamId: equipeSul.id, storeId: lojaCentral.id, clientId: clients[7].id, sourceId: src[0].id, carId: cars[3].id } }),
    prisma.lead.create({ data: { name: 'Lead Iris',   phone: '(11) 99999-9999', status: 'contato',    origin: 'Site',        userId: carlos.id, teamId: equipeSul.id, storeId: lojaCentral.id, clientId: clients[8].id, sourceId: src[4].id, carId: cars[4].id } }),
  ]);

  // Pedro (LIDER_EQUIPE, Equipe Norte) — 2 leads próprios
  await Promise.all([
    prisma.lead.create({ data: { name: 'Lead Jonas',  phone: '(11) 98888-0000', status: 'proposta',   origin: 'Instagram',   userId: pedro.id, teamId: equipeNorte.id, storeId: lojaCentral.id, clientId: clients[9].id, sourceId: src[1].id, carId: cars[2].id } }),
    prisma.lead.create({ data: { name: 'Lead Extra',  phone: '(11) 97777-1111', status: 'contato',    origin: 'WhatsApp',    userId: pedro.id, teamId: equipeNorte.id, storeId: lojaCentral.id, sourceId: src[0].id } }),
  ]);

  // ── Negotiations ───────────────────────────────────────────────────────────
  await Promise.all([
    prisma.negotiation.create({ data: { leadId: leadsJoao[0].id, status: 'aberta',       stage: 'inicial',  importance: 'morno',  active: true  } }),
    prisma.negotiation.create({ data: { leadId: leadsJoao[1].id, status: 'em_andamento', stage: 'proposta', importance: 'quente', active: true  } }),
    prisma.negotiation.create({ data: { leadId: leadsJoao[2].id, status: 'aberta',       stage: 'inicial',  importance: 'frio',   active: true  } }),
    prisma.negotiation.create({ data: { leadId: leadsJoao[3].id, status: 'em_andamento', stage: 'proposta', importance: 'quente', active: true  } }),
    prisma.negotiation.create({ data: { leadId: leadsJoao[4].id, status: 'fechada',      stage: 'final',    importance: 'quente', active: false } }),
    prisma.negotiation.create({ data: { leadId: leadCarlos[0].id, status: 'fechada',     stage: 'final',    importance: 'quente', active: false } }),
    prisma.negotiation.create({ data: { leadId: leadCarlos[1].id, status: 'em_andamento',stage: 'proposta', importance: 'morno',  active: true  } }),
    prisma.negotiation.create({ data: { leadId: leadCarlos[2].id, status: 'aberta',      stage: 'inicial',  importance: 'frio',   active: true  } }),
  ]);

  console.log('[seed] Banco populado com sucesso!');
  console.log('[seed] Usuários criados:');
  console.log('  admin@1000valle.com  / 123456 (ADMIN)');
  console.log('  pedro@1000valle.com  / 123456 (LIDER_EQUIPE)');
  console.log('  maria@1000valle.com  / 123456 (GERENTE)');
  console.log('  joao@1000valle.com   / 123456 (ATENDENTE)');
  console.log('  carlos@1000valle.com / 123456 (ATENDENTE)');
}

main()
  .catch((e) => {
    console.error('[seed] Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('[seed] Iniciando seed idempotente...');

  const senhaHash = await bcrypt.hash('123456', 10);

  const equipeNorte = await prisma.team.upsert({
    where: { id: 'aaaaaaaa-0000-0000-0000-000000000001' },
    update: {},
    create: { id: 'aaaaaaaa-0000-0000-0000-000000000001', name: 'Equipe Norte' },
  });

  const equipeSul = await prisma.team.upsert({
    where: { id: 'aaaaaaaa-0000-0000-0000-000000000002' },
    update: {},
    create: { id: 'aaaaaaaa-0000-0000-0000-000000000002', name: 'Equipe Sul' },
  });

  const lojaCentral = await prisma.store.upsert({
    where: { id: 'bbbbbbbb-0000-0000-0000-000000000001' },
    update: {},
    create: { id: 'bbbbbbbb-0000-0000-0000-000000000001', name: 'Loja Central' },
  });

  await prisma.user.upsert({
    where: { email: 'admin@1000valle.com' },
    update: {},
    create: {
      name: 'Gabrielly Neu', email: 'admin@1000valle.com', password: senhaHash,
      role: 'ADMIN', teamId: equipeNorte.id, storeId: lojaCentral.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'gerente.geral@1000valle.com' },
    update: {},
    create: {
      name: 'Roberto Geral', email: 'gerente.geral@1000valle.com', password: senhaHash,
      role: 'GERENTE_GERAL', teamId: null, storeId: lojaCentral.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'joao@1000valle.com' },
    update: {},
    create: {
      name: 'João Silva', email: 'joao@1000valle.com', password: senhaHash,
      role: 'ATENDENTE', teamId: equipeNorte.id, storeId: lojaCentral.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'maria@1000valle.com' },
    update: {},
    create: {
      name: 'Maria Santos', email: 'maria@1000valle.com', password: senhaHash,
      role: 'GERENTE', teamId: equipeNorte.id, storeId: lojaCentral.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'carlos@1000valle.com' },
    update: {},
    create: {
      name: 'Carlos Oliveira', email: 'carlos@1000valle.com', password: senhaHash,
      role: 'ATENDENTE', teamId: equipeSul.id, storeId: lojaCentral.id,
    },
  });

  console.log('[seed] Seed concluído!');
  console.log('  admin@1000valle.com           / 123456 (ADMIN)');
  console.log('  gerente.geral@1000valle.com   / 123456 (GERENTE_GERAL)');
  console.log('  joao@1000valle.com            / 123456 (ATENDENTE)');
  console.log('  maria@1000valle.com           / 123456 (GERENTE)');
  console.log('  carlos@1000valle.com          / 123456 (ATENDENTE)');
}

main()
  .catch((e) => { console.error('[seed] Erro:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

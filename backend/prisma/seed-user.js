const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  await prisma.user.update({
    where: { id: 'c4711469-a44f-4bdf-8c30-23a47865bb27' },
    data: {
      name: 'Admin',
      email: 'admin@1000valle.com',
      password: hash,
      role: 'ADMIN'
    }
  });
  console.log('Usuário atualizado com sucesso!');
}

main().finally(() => prisma.$disconnect());
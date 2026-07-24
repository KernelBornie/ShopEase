// scripts/add-users.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords (salt rounds = 10)
  const hash = await bcrypt.hash('123456', 10);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'director@example.com' },
    update: {},
    create: {
      email: 'director@example.com',
      password: hash,
      name: 'Director',
      role: 'ADMIN',
      approved: true,
    },
  });

  // Customer user
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: hash,
      name: 'Customer',
      role: 'CUSTOMER',
      approved: true,
    },
  });

  console.log('Users created/updated:');
  console.log('  - Admin:', admin.email);
  console.log('  - Customer:', customer.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
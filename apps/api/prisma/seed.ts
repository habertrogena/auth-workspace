/**
 * ForwardFlow Kenya - Seed script
 * Creates the default admin user (username: habertdev, password: $Habertdev12).
 * Run: pnpm run prisma:seed (from apps/api) or pnpm exec prisma db seed --schema=apps/api/prisma/schema.prisma (from root)
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedAdmin = await bcrypt.hash('$Habertdev12', 10);
  const existingAdmin = await prisma.user.findUnique({ where: { username: 'habertdev' } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        username: 'habertdev',
        name: 'Admin',
        password: hashedAdmin,
        role: Role.ADMIN,
        email: null,
      },
    });
    console.log('Admin user created: username = habertdev, password = $Habertdev12');
  } else {
    console.log('Admin user already exists.');
  }

  // Demo business user for web dashboard (login with email)
  const bizEmail = 'business@forwardflow.demo';
  const existingBiz = await prisma.user.findFirst({ where: { email: bizEmail } });
  if (!existingBiz) {
    const hashedBiz = await bcrypt.hash('Business123!', 10);
    const bizUser = await prisma.user.create({
      data: {
        username: 'biz-demo',
        name: 'Demo Business',
        email: bizEmail,
        password: hashedBiz,
        role: Role.BUSINESS,
      },
    });
    await prisma.business.create({
      data: {
        userId: bizUser.id,
        name: 'Demo Shop',
        type: 'retail',
        industry: 'Retail',
      },
    });
    console.log('Business user created: email = business@forwardflow.demo, password = Business123!');
  } else {
    console.log('Business demo user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

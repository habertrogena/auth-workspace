/**
 * ForwardFlow Kenya - Dummy data seed
 * Creates 30 businesses with mixed: active subscriptions, free users, locked accounts.
 * Run from repo root: pnpm run prisma:seed-dummy
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}
// Load .env from repo root (when run from apps/api: cwd is apps/api, so ../../.env = root)
loadEnv(resolve(process.cwd(), '../../.env'));
loadEnv(resolve(__dirname, '../../../.env'));
if (!process.env.DATABASE_URL?.startsWith('postgresql://') && !process.env.DATABASE_URL?.startsWith('postgres://')) {
  console.error('DATABASE_URL must be set to a PostgreSQL URL (postgresql://...) in the repo root .env');
  process.exit(1);
}

const { PrismaClient, Role, PlanType, SubscriptionStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const BUSINESS_TYPES = ['retail', 'restaurant', 'pharmacy', 'salon', 'hardware', 'supermarket'];
const DUMMY_PASSWORD = 'DemoPass123!';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  const existing = await prisma.business.count();
  if (existing >= 30) {
    console.log('Dummy data already exists (30+ businesses). Skipping.');
    return;
  }

  const hashedPassword = await bcrypt.hash(DUMMY_PASSWORD, 10);
  const toCreate = 30 - existing;

  console.log(`Creating ${toCreate} dummy businesses with users, subscriptions, analytics, and locks...`);

  for (let i = 0; i < toCreate; i++) {
    const n = existing + i + 1;
    const username = `business_${n}`;
    const email = `owner${n}@example.com`;

    const user = await prisma.user.create({
      data: {
        username,
        email,
        name: `Owner ${n}`,
        password: hashedPassword,
        role: Role.BUSINESS,
      },
    });

    const business = await prisma.business.create({
      data: {
        userId: user.id,
        name: `Business ${n} - ${randomChoice(BUSINESS_TYPES)}`,
        type: randomChoice(BUSINESS_TYPES),
        lastActiveAt: Math.random() > 0.2 ? daysAgo(randomInt(0, 14)) : null,
      },
    });

    // Subscription: ~50% FREE, ~50% PREMIUM; most ACTIVE, some EXPIRED, 2 LOCKED
    const planType = n % 2 === 0 ? PlanType.PREMIUM : PlanType.FREE;
    let status = SubscriptionStatus.ACTIVE;
    if (n === 25 || n === 28) status = SubscriptionStatus.LOCKED;
    else if (n === 15 || n === 20) status = SubscriptionStatus.EXPIRED;

    await prisma.subscription.create({
      data: {
        businessId: business.id,
        planType,
        status,
        startDate: daysAgo(90),
        endDate: status === SubscriptionStatus.EXPIRED ? daysAgo(5) : daysAgo(-30), // future for active
      },
    });

    // Analytics (metadata only)
    await prisma.analytics.create({
      data: {
        businessId: business.id,
        lastLogin: Math.random() > 0.3 ? daysAgo(randomInt(0, 7)) : null,
        totalTransactionsCount: randomInt(0, 500),
        lastSyncAt: Math.random() > 0.4 ? daysAgo(randomInt(0, 3)) : null,
      },
    });

    // Lock: businesses 5, 12, 19, 25, 28 are locked (5 total)
    const lockedNumbers = [5, 12, 19, 25, 28];
    if (lockedNumbers.includes(n)) {
      await prisma.lock.create({
        data: {
          businessId: business.id,
          isLocked: true,
          reason: n === 25 ? 'Payment overdue' : n === 28 ? 'Terms violation' : 'Under review',
          lockedAt: daysAgo(randomInt(1, 10)),
        },
      });
    }
  }

  console.log(`Created ${toCreate} dummy businesses.`);
  console.log('Summary: mix of FREE/PREMIUM, ACTIVE/EXPIRED/LOCKED subscriptions; 5 locked accounts.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

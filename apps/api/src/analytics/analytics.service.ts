import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PlanType, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Overview stats for admin dashboard: total businesses, active subscriptions,
   * free users, locked accounts.
   */
  async getOverview() {
    const [totalBusinesses, activeSubscriptions, freeUsers, lockedCount] =
      await Promise.all([
        this.prisma.business.count(),
        this.prisma.subscription.count({
          where: { status: SubscriptionStatus.ACTIVE },
        }),
        this.prisma.subscription.count({
          where: { planType: PlanType.FREE, status: SubscriptionStatus.ACTIVE },
        }),
        this.prisma.lock.count({ where: { isLocked: true } }),
      ]);

    return {
      totalBusinesses,
      activeSubscriptions,
      freeUsers,
      lockedAccounts: lockedCount,
    };
  }
}

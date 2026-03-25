import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  /** List all businesses (admin). Includes owner, subscription, lock, analytics. */
  async findAll() {
    return this.prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, username: true } },
        subscriptions: {
          where: { status: 'ACTIVE' },
          take: 1,
          orderBy: { startDate: 'desc' },
        },
        lock: true,
        analytics: true,
      },
    });
  }

  /** Get one business by id (admin). */
  async findOne(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, username: true } },
        subscriptions: { orderBy: { startDate: 'desc' } },
        lock: true,
        analytics: true,
      },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  /**
   * Lock a business. Creates or updates Lock; sets isLocked = true.
   * When locked, business users should be denied access (enforce in business-facing APIs).
   */
  async lock(id: string, reason?: string) {
    await this.findOne(id);
    const now = new Date();
    await this.prisma.lock.upsert({
      where: { businessId: id },
      create: {
        businessId: id,
        isLocked: true,
        reason: reason ?? null,
        lockedAt: now,
      },
      update: { isLocked: true, reason: reason ?? null, lockedAt: now },
    });
    return this.findOne(id);
  }

  /** Unlock a business. */
  async unlock(id: string) {
    await this.findOne(id);
    await this.prisma.lock.upsert({
      where: { businessId: id },
      create: { businessId: id, isLocked: false },
      update: { isLocked: false, reason: null, lockedAt: null },
    });
    return this.findOne(id);
  }

  /**
   * Check if business is locked; throw if so. Call this from business-facing APIs.
   */
  async assertNotLocked(businessId: string) {
    const lock = await this.prisma.lock.findUnique({
      where: { businessId },
    });
    if (lock?.isLocked) {
      throw new ForbiddenException('Account is locked. Contact support.');
    }
  }

  /** Update lastActiveAt for a business (call from business-facing APIs on each request). */
  async touchLastActive(businessId: string) {
    await this.prisma.business.update({
      where: { id: businessId },
      data: { lastActiveAt: new Date() },
    });
  }
}

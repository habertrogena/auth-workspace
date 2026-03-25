import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PlanType, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, dto: UpdateSubscriptionDto) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');

    const data: {
      planType?: PlanType;
      status?: SubscriptionStatus;
      endDate?: Date | null;
    } = {};
    if (dto.planType !== undefined) data.planType = dto.planType;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;

    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }
}
